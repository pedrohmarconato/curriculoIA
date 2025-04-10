import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResumeData } from '../lib/resume-ai';

/**
 * Gera um PDF do currículo a partir de dados e estilo
 */
export async function generatePDF(
  resumeData: ResumeData, 
  style: { 
    colors: any; 
    style: string; 
  }
): Promise<Blob> {
  try {
    console.log('Iniciando geração de PDF');
    
    // Gerar HTML do currículo
    const resumeHTML = generateResumeHTML(resumeData, style);
    
    // Criar um container temporário para renderizar o HTML
    const container = document.createElement('div');
    container.innerHTML = resumeHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    document.body.appendChild(container);
    
    try {
      // Aguardar carregamento de fontes e recursos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Renderizar como canvas
      const canvas = await html2canvas(container, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: style.colors.background || '#ffffff',
        logging: false,
        onclone: (document) => {
          // Ajustar estilos para captura
          const clonedContainer = document.body.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.width = '794px';
            clonedContainer.style.margin = '0';
            clonedContainer.style.padding = '0';
          }
        }
      });
      
      // Inicializar PDF com orientação retrato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Dimensões da página A4 em mm
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Calcular dimensões para manter proporção
      const ratio = canvas.width / canvas.height;
      const pdfWidth = pageWidth;
      const pdfHeight = pdfWidth / ratio;
      
      // Se a altura for maior que a página, ajustar escala
      if (pdfHeight > pageHeight) {
        const scale = pageHeight / pdfHeight;
        const newWidth = pdfWidth * scale;
        
        // Centralizar horizontalmente
        const xOffset = (pageWidth - newWidth) / 2;
        
        // Adicionar a imagem do canvas ao PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', xOffset, 0, newWidth, pageHeight);
      } else {
        // Centralizar verticalmente
        const yOffset = (pageHeight - pdfHeight) / 2;
        
        // Adicionar a imagem do canvas ao PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfWidth, pdfHeight);
      }
      
      console.log('PDF gerado com sucesso');
      
      // Retornar o PDF como blob
      return pdf.output('blob');
    } finally {
      // Limpar o container temporário
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    console.error('Erro na geração do PDF:', error);
    throw new Error(`Falha ao gerar PDF: ${error.message}`);
  }
}

/**
 * Gera o HTML completo para o PDF do currículo
 */
function generateResumeHTML(
  resumeData: ResumeData, 
  style: { 
    colors: any; 
    style: string; 
  }
): string {
  // Formatar período para exibição
  const formatPeriod = (start: string, end: string | 'present') => {
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
  };
  
  // Formatar data para exibição
  const formatDate = (date: string) => {
    if (!date || date.length < 7) return date;
    
    const [year, month] = date.split('-');
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  };
  
  // Definir estilo específico com base no template escolhido
  let templateSpecificStyles = '';
  switch (style.style) {
    case 'modern':
      templateSpecificStyles = `
        header { border-radius: 0 0 30px 30px; }
        h2 { font-weight: 400; letter-spacing: 1px; }
        .skill-level { height: 8px; border-radius: 4px; }
        .experience-item, .education-item { position: relative; }
        .experience-item:before, .education-item:before {
          content: '';
          position: absolute;
          left: -22px;
          top: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${style.colors.accent};
        }
      `;
      break;
    case 'creative':
      templateSpecificStyles = `
        body { background-color: #f5f5f5; }
        header { 
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
          padding-bottom: 50px;
        }
        h2 { 
          display: inline-block;
          padding: 5px 15px;
          background-color: ${style.colors.accent};
          color: white;
          border-radius: 20px;
        }
        .experience-item, .education-item {
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          background-color: white;
        }
      `;
      break;
    case 'minimal':
      templateSpecificStyles = `
        header { 
          background-color: transparent;
          border-bottom: 2px solid ${style.colors.primary};
          color: ${style.colors.primary};
        }
        h1 { font-size: 36px; }
        h2 {
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .contact-info { color: ${style.colors.text}; }
        .section { border-top: 1px solid #eee; padding-top: 20px; }
      `;
      break;
    case 'classic':
      templateSpecificStyles = `
        body { font-family: 'Georgia', serif; }
        h1 { text-align: center; }
        .contact-info { text-align: center; }
        h2 { 
          font-family: 'Georgia', serif;
          border-bottom: 1px solid ${style.colors.primary};
        }
        .company-period, .institution-period {
          font-style: italic;
        }
      `;
      break;
    case 'tech':
      templateSpecificStyles = `
        body { font-family: 'Courier New', monospace; }
        header { background-color: ${style.colors.primary}; border-left: 8px solid ${style.colors.accent}; }
        h2 { 
          background-color: ${style.colors.primary}; 
          color: white;
          padding: 5px 10px;
          margin-left: -10px;
          position: relative;
        }
        h2:after {
          content: '';
          position: absolute;
          right: -10px;
          top: 0;
          border-style: solid;
          border-width: 17px 10px 17px 0;
          border-color: transparent transparent transparent ${style.colors.primary};
        }
        .skill-level {
          font-family: monospace;
          letter-spacing: 2px;
        }
      `;
      break;
  }

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
      background-color: #ffffff;
      color: ${style.colors.text};
      font-size: 14px;
      line-height: 1.6;
    }
    .resume {
      max-width: 800px;
      margin: 0 auto;
      background-color: ${style.colors.background};
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
      color: ${style.colors.secondary};
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
      color: ${style.colors.text};
    }
    p {
      margin-bottom: 10px;
      color: ${style.colors.text};
    }
    .contact-info {
      margin-top: 10px;
      color: ${style.colors.secondary};
    }
    .section {
      margin-bottom: 25px;
    }
    .experience-item, .education-item {
      margin-bottom: 20px;
      position: relative;
      padding-left: 15px;
      border-left: 2px solid ${style.colors.accent};
    }
    .company-period, .institution-period {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
      color: ${style.colors.text}99;
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
      display: inline-block;
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
      color: ${style.colors.text};
    }
    .contact-info {
      line-height: 1.8;
    }
    
    /* Estilos específicos do template */
    ${templateSpecificStyles}
    
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