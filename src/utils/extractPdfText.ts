// Funções para extrair texto de PDFs diretamente no frontend
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker via CDN
pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

/**
 * Extrai texto de um arquivo PDF a partir de uma URL
 */
export async function extractTextFromPdf(url: string): Promise<string> {
  try {
    console.log('Iniciando extração de texto do PDF:', url);
    
    // Carregar documento PDF
    const pdf = await pdfjs.getDocument(url).promise;
    console.log(`PDF carregado, número de páginas: ${pdf.numPages}`);
    
    // Array para armazenar texto de cada página
    let fullText = '';
    
    // Extrair texto de cada página
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Processar itens de texto para preservar layout
        let lastY: number | null = null;
        let text = '';
        
        for (const item of textContent.items) {
          if ('str' in item) {
            // Verificar mudança significativa de posição vertical para adicionar quebra de linha
            if (lastY !== null && Math.abs((item as any).transform[5] - lastY) > 5) {
              text += '\n';
            }
            text += item.str;
            lastY = (item as any).transform[5];
          }
        }
        
        fullText += text + '\n\n';
      } catch (pageError) {
        console.warn(`Erro ao processar página ${i}:`, pageError);
        // Continuar com as próximas páginas
      }
    }
    
    console.log('Extração de texto concluída com sucesso');
    
    // Limpar excesso de linhas em branco e espaços
    const cleanedText = fullText
      .replace(/\n{3,}/g, '\n\n')  // Substituir mais de 2 quebras por apenas 2
      .replace(/\s+$/, '')         // Remover espaços no final
      .trim();
      
    return cleanedText;
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
  }
}

/**
 * Verifica se o texto extraído parece ser um currículo
 */
export function looksLikeResume(text: string): boolean {
  if (!text || text.length < 200) return false;
  
  // Palavras-chave comuns em currículos
  const resumeKeywords = [
    'experiência', 'experience', 'currículo', 'curriculum vitae', 
    'resumé', 'profissional', 'professional', 'formação', 
    'education', 'skills', 'habilidades', 'competências', 
    'idiomas', 'languages', 'qualificações', 'endereço', 
    'e-mail', 'telefone', 'tel', 'celular'
  ];
  
  // Verificar se pelo menos algumas palavras-chave estão presentes
  const lowerText = text.toLowerCase();
  let keywordCount = 0;
  
  for (const keyword of resumeKeywords) {
    if (lowerText.includes(keyword)) {
      keywordCount++;
      if (keywordCount >= 3) {
        return true;
      }
    }
  }
  
  // Verificar por estruturas comuns de currículo
  // (presença de e-mail, telefone, formação acadêmica, etc.)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/.test(text);
  const hasDateRanges = /\d{2}\/\d{2,4}([-–—]\d{2}\/\d{2,4}|\s*até\s*\d{2}\/\d{2,4}|\s*-\s*presente)/.test(text);
  
  // Se tiver pelo menos 2 desses padrões, provavelmente é um currículo
  return (hasEmail && hasPhone) || (hasEmail && hasDateRanges) || (hasPhone && hasDateRanges);
}