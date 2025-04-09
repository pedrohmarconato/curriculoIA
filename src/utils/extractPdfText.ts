/**
 * Este arquivo contém funções para extrair texto de arquivos PDF
 * Utiliza fetch para baixar o PDF e técnicas básicas para extrair texto
 */

/**
 * Extrai texto de um PDF a partir de sua URL
 * @param url URL do arquivo PDF
 * @returns Promessa que resolve para o texto extraído ou rejeita com erro
 */
export async function extractTextFromPdf(url: string): Promise<string> {
    try {
      console.log("Iniciando download do PDF:", url);
      
      // Baixar o PDF como ArrayBuffer
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao baixar o PDF: ${response.status} ${response.statusText}`);
      }
      
      // Obter o conteúdo binário
      const pdfBuffer = await response.arrayBuffer();
      console.log("PDF baixado, tamanho:", pdfBuffer.byteLength, "bytes");
      
      // Caso você queira implementar extração de texto do PDF no frontend,
      // você precisaria instalar uma biblioteca como pdf.js
      // Por enquanto, vamos usar uma solução simplificada:
      // - Se for um PDF pequeno (< 5MB), tentamos extrair texto usando string matching
      // - Caso contrário, usamos uma abordagem de fallback
      
      // Simplificação: buscar por strings de texto no PDF
      // Isso não é uma solução robusta, mas pode funcionar para PDFs simples
      const textDecoder = new TextDecoder('utf-8');
      let rawText = textDecoder.decode(pdfBuffer);
      
      // Limpar o texto extraído (remover caracteres não imprimíveis)
      let cleanedText = "";
      
      // Percorrer o texto e extrair somente caracteres imprimíveis
      for (let i = 0; i < rawText.length; i++) {
        const charCode = rawText.charCodeAt(i);
        // Manter apenas caracteres imprimíveis e quebras de linha
        if ((charCode >= 32 && charCode <= 126) || // ASCII básico
            (charCode >= 128 && charCode <= 255) || // Extended ASCII/Latin
            charCode === 10 || charCode === 13) {   // Quebras de linha
          cleanedText += rawText.charAt(i);
        }
      }
      
      // Processar o texto para remover ruído
      const processedText = processRawPdfText(cleanedText);
      
      if (processedText.length < 100) {
        console.warn("Pouco texto extraído do PDF, possivelmente um PDF digitalizado ou protegido");
        return "Não foi possível extrair texto suficiente deste PDF. " +
               "O arquivo pode ser digitalizado, protegido ou conter principalmente imagens.";
      }
      
      return processedText;
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      throw new Error(`Falha ao processar o PDF: ${error.message}`);
    }
  }
  
  /**
   * Processa o texto extraído do PDF para remover padrões de formatação 
   * e melhorar a qualidade do texto extraído
   */
  function processRawPdfText(text: string): string {
    // Remover sequências de espaços e tabs
    let processed = text.replace(/[ \t]+/g, ' ');
    
    // Substituir múltiplas quebras de linha por uma única
    processed = processed.replace(/\n+/g, '\n');
    
    // Remover caracteres de controle
    processed = processed.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Substituir sequências comuns de caracteres especiais
    processed = processed.replace(/[^\w\s.,;:!?()[\]{}\-'"/\\&%#@$*+=<>|~^`´]/g, ' ');
    
    // Remover linhas muito curtas (provavelmente cabeçalhos/rodapés)
    const lines = processed.split('\n');
    const filteredLines = lines.filter(line => line.trim().length > 10);
    processed = filteredLines.join('\n');
    
    return processed;
  }
  
  /**
   * Verifica se o conteúdo parece ser um currículo
   * @param text Texto a ser verificado
   * @returns true se parece um currículo, false caso contrário
   */
  export function looksLikeResume(text: string): boolean {
    const resumeKeywords = [
      'currículo', 'curriculum', 'vitae', 'cv', 'résumé',
      'experiência', 'experience', 'profissional', 'professional',
      'educação', 'education', 'formação', 'formation', 'academic',
      'habilidades', 'skills', 'competências', 'competences',
      'idiomas', 'languages', 'línguas'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Verificar se pelo menos 3 palavras-chave estão presentes
    let keywordsFound = 0;
    for (const keyword of resumeKeywords) {
      if (lowerText.includes(keyword)) {
        keywordsFound++;
        if (keywordsFound >= 3) {
          return true;
        }
      }
    }
    
    return false;
  }