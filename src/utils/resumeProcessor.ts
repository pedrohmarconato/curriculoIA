// src/utils/resumeProcessor.ts

import { ResumeData } from '../lib/resume-ai';
import { extractTextFromPdf, looksLikeResume } from './extractPdfText';
import { parseResumeText, createBasicResumeData } from './resumeParse';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Processa um currículo a partir da URL, com múltiplas estratégias e fallbacks
 * @param url URL do arquivo PDF
 * @param userId ID do usuário (opcional)
 * @param userName Nome do usuário (opcional)
 * @param userEmail Email do usuário (opcional)
 * @returns Dados estruturados do currículo ou null se falhar
 */
export async function processResume(
  url: string,
  userId?: string,
  userName?: string,
  userEmail?: string
): Promise<ResumeData | null> {
  // Tentar primeiro com o backend
  try {
    console.log('Iniciando processamento de currículo via servidor:', url);
    
    // Adicionar timestamp na URL para evitar cache
    const timestampedUrl = `${url}?ts=${Date.now()}`;
    
    // Chamada para a função Edge da Supabase
    const { data: extractResponse, error: extractError } = await supabase.functions.invoke('resume-ai', {
      body: {
        action: 'extract',
        data: { url: timestampedUrl }
      }
    });

    if (extractError) {
      console.error('Erro na função de extração:', extractError);
      throw extractError;
    }

    // Verificar se temos dados válidos
    if (!extractResponse || !extractResponse.data) {
      throw new Error('Resposta vazia da função de extração');
    }

    // Extrair o texto
    const extractedText = extractResponse.data;
    
    // Verificar comprimento mínimo
    if (typeof extractedText !== 'string' || extractedText.length < 100) {
      throw new Error('Texto extraído inválido ou muito curto');
    }

    console.log('Texto extraído com sucesso, analisando via IA');
    
    // Analisar o texto via IA
    const { data: analyzeResponse, error: analyzeError } = await supabase.functions.invoke('resume-ai', {
      body: {
        action: 'analyze',
        data: { text: extractedText }
      }
    });

    if (analyzeError) {
      console.error('Erro na função de análise:', analyzeError);
      throw analyzeError;
    }

    if (!analyzeResponse || !analyzeResponse.data) {
      throw new Error('Resposta vazia da função de análise');
    }

    // Registrar que a análise foi bem-sucedida
    try {
      if (userId) {
        await supabase.from('user_activities').insert({
          user_id: userId,
          activity_type: 'ai_analysis',
          metadata: { 
            source: 'server',
            text_length: extractedText.length
          }
        });
      }
    } catch (logError) {
      // Não falhar se o registro falhar
      console.warn('Erro ao registrar atividade:', logError);
    }

    // Retornar os dados analisados
    return analyzeResponse.data;
  } catch (serverError) {
    // Se falhar o processamento no servidor, tentar no frontend
    console.warn('Processamento no servidor falhou, tentando no frontend:', serverError);
    toast.error('Processamento no servidor falhou. Tentando alternativa local...', {
      duration: 3000
    });
    
    try {
      return await processResumeInBrowser(url, userName, userEmail);
    } catch (browserError) {
      console.error('Processamento no frontend também falhou:', browserError);
      toast.error('Não foi possível processar o currículo. Usando modelo básico.');
      
      // Último recurso: criar um modelo básico
      try {
        return createBasicResumeData(userName, userEmail);
      } catch (fallbackError) {
        console.error('Falha ao criar modelo básico:', fallbackError);
        return null;
      }
    }
  }
}

/**
 * Processa um currículo localmente no navegador
 */
async function processResumeInBrowser(
  url: string,
  userName?: string,
  userEmail?: string
): Promise<ResumeData> {
  console.log('Processando currículo no navegador:', url);
  
  // Extrair o texto do PDF
  const extractedText = await extractTextFromPdf(url);
  console.log('Texto extraído do navegador:', extractedText.substring(0, 200) + '...');
  
  // Verificar se parece um currículo
  if (!looksLikeResume(extractedText)) {
    console.warn('O texto extraído não parece ser um currículo');
    
    // Usar um toast personalizado já que toast.warning não existe
    toast('O arquivo enviado talvez não seja um currículo válido. Faremos o melhor possível.', {
      icon: '⚠️',
      style: {
        background: '#FEF9C3',
        color: '#854D0E',
        border: '1px solid #FDE68A'
      },
      duration: 5000
    });
  }
  
  // Analisar o texto para extrair informações estruturadas
  const parsedData = parseResumeText(extractedText, userName, userEmail);
  console.log('Dados estruturados extraídos localmente:', parsedData);
  
  toast.success('Currículo processado com sucesso no navegador');
  return parsedData;
}

/**
 * Função para gerar o HTML do currículo com base nos dados
 */
export async function generateResumeHTML(
  resumeData: ResumeData,
  style: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    style: string;
  }
): Promise<string> {
  try {
    // Tentar gerar via IA no servidor
    const { data, error } = await supabase.functions.invoke('resume-ai', {
      body: {
        action: 'generate',
        data: { resume: resumeData, style }
      }
    });

    if (error) throw error;
    
    if (!data || !data.data) {
      throw new Error('Resposta vazia da função de geração');
    }
    
    return data.data;
  } catch (serverError) {
    console.warn('Geração no servidor falhou, usando template local:', serverError);
    
    // Template HTML básico como fallback
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Currículo de ${resumeData.personalInfo.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    body {
      background-color: ${style.colors.background};
      color: ${style.colors.text};
      font-size: 14px;
      line-height: 1.6;
    }
    .resume {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    header {
      background-color: ${style.colors.primary};
      color: ${style.colors.secondary};
      padding: 30px;
    }
    .content {
      padding: 30px;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 5px;
    }
    h2 {
      font-size: 22px;
      margin: 25px 0 15px;
      color: ${style.colors.primary};
      border-bottom: 2px solid ${style.colors.accent};
      padding-bottom: 5px;
    }
    h3 {
      font-size: 18px;
      margin-bottom: 5px;
    }
    p {
      margin-bottom: 10px;
    }
    .contact-info {
      margin-top: 10px;
    }
    .section {
      margin-bottom: 25px;
    }
    .experience-item, .education-item {
      margin-bottom: 20px;
    }
    .company-period, .institution-period {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
      color: #666;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .skill-level {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      background-color: ${style.colors.accent}40;
      color: ${style.colors.primary};
    }
    .achievements {
      margin-top: 10px;
      padding-left: 20px;
    }
    .achievements li {
      margin-bottom: 5px;
    }
    .contact-info {
      line-height: 1.8;
    }
    @media print {
      body {
        background-color: white;
      }
      .resume {
        box-shadow: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <header>
      <h1>${resumeData.personalInfo.name}</h1>
      <div class="contact-info">
        ${resumeData.personalInfo.contact.email ? `<div>Email: ${resumeData.personalInfo.contact.email}</div>` : ''}
        ${resumeData.personalInfo.contact.phone ? `<div>Telefone: ${resumeData.personalInfo.contact.phone}</div>` : ''}
        ${resumeData.personalInfo.contact.location ? `<div>Localização: ${resumeData.personalInfo.contact.location}</div>` : ''}
      </div>
    </header>
    
    <div class="content">
      <!-- Seções do currículo -->
      
      <!-- Experiência Profissional -->
      <section class="section">
        <h2>Experiência Profissional</h2>
        ${resumeData.experience.map(exp => `
          <div class="experience-item">
            <h3>${exp.role}</h3>
            <div class="company-period">
              <span>${exp.company}</span>
              <span>${formatPeriod(exp.period.start, exp.period.end)}</span>
            </div>
            <p>${exp.description}</p>
            ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>

      <!-- Educação -->
      <section class="section">
        <h2>Educação</h2>
        ${resumeData.education.map(edu => `
          <div class="education-item">
            <h3>${edu.degree} em ${edu.field}</h3>
            <div class="institution-period">
              <span>${edu.institution}</span>
              <span>${formatPeriod(edu.period.start, edu.period.end)}</span>
            </div>
          </div>
        `).join('')}
      </section>

      <!-- Habilidades -->
      <section class="section">
        <h2>Habilidades</h2>
        <div class="skills-grid">
          <div>
            <h3>Técnicas</h3>
            ${resumeData.skills.technical.map(skill => `
              <div class="skill-item">
                <span>${skill.name}</span>
                <span class="skill-level">${skill.level}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h3>Interpessoais</h3>
            ${resumeData.skills.interpersonal.map(skill => `
              <div class="skill-item">
                <span>${skill.name}</span>
                <span class="skill-level">${skill.level}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Idiomas -->
      <section class="section">
        <h2>Idiomas</h2>
        ${resumeData.languages.map(lang => `
          <div class="skill-item">
            <span>${lang.name}</span>
            <span class="skill-level">${lang.level}</span>
          </div>
        `).join('')}
      </section>
      
      <!-- Certificações (se houver) -->
      ${resumeData.certifications && resumeData.certifications.length > 0 ? `
        <section class="section">
          <h2>Certificações</h2>
          ${resumeData.certifications.map(cert => `
            <div class="education-item">
              <h3>${cert.name}</h3>
              <div class="institution-period">
                <span>${cert.issuer}</span>
                <span>${formatDate(cert.date)}${cert.expirationDate ? ` - ${formatDate(cert.expirationDate)}` : ''}</span>
              </div>
            </div>
          `).join('')}
        </section>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
  }
}

// Funções auxiliares para formatação de datas
function formatPeriod(start: string, end: string | 'present'): string {
  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    if (!month) return year;
    
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  };
  
  const startFormatted = formatYearMonth(start);
  const endFormatted = end === 'present' ? 'Atual' : formatYearMonth(end);
  
  return `${startFormatted} - ${endFormatted}`;
}

function formatDate(date: string): string {
  if (!date || date.length < 7) return date;
  
  const [year, month] = date.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  return `${monthNames[parseInt(month) - 1]}/${year}`;
}