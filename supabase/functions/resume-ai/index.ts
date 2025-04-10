// Importações necessárias
import { Configuration, OpenAIApi } from "npm:openai@4.28.0";
import { parse as parsePdf } from "npm:pdf-parse@1.1.1";
import puppeteer from "npm:puppeteer@22.3.0";

// Extração de PDF aprimorada e robusta
async function extractResumeFromPDF(url: string): Promise<string> {
  try {
    console.log('[extractResumeFromPDF] Iniciando extração de PDF:', url);

    if (!url || typeof url !== 'string') {
      throw new Error('URL do PDF inválida ou não fornecida');
    }

    // Download do PDF com recuperação de erros
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch(url, {
          timeout: 30000, // 30 segundos
        });
        
        if (response.ok) break;
        
        console.warn(`[extractResumeFromPDF] Tentativa ${retryCount + 1} falhou: ${response.status} ${response.statusText}`);
        retryCount++;
        
        // Esperar antes de tentar novamente (backoff exponencial)
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
      } catch (fetchError) {
        console.error(`[extractResumeFromPDF] Erro de fetch na tentativa ${retryCount + 1}:`, fetchError);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error(`Falha ao baixar PDF após ${maxRetries} tentativas: ${fetchError.message}`);
        }
        
        // Esperar antes de tentar novamente
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Falha ao baixar PDF: ${response?.statusText || 'Resposta inválida'}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    
    // Verificar se temos conteúdo válido
    if (pdfBuffer.byteLength === 0) {
      throw new Error('PDF vazio recebido');
    }
    
    console.log(`[extractResumeFromPDF] PDF baixado com sucesso: ${pdfBuffer.byteLength} bytes`);
    
    // Processar o PDF
    let data;
    try {
      data = await parsePdf(new Uint8Array(pdfBuffer), {
        // Opções avançadas
        max: 2000000, // Limite máximo de caracteres
        pagerender: render_page, // Função personalizada de renderização
      });
    } catch (parseError) {
      console.error('[extractResumeFromPDF] Erro ao processar PDF:', parseError);
      throw new Error(`Falha ao processar PDF: ${parseError.message}`);
    }

    if (!data?.text) {
      throw new Error('Nenhum texto encontrado no PDF');
    }
    
    // Validação do conteúdo extraído
    const extractedText = data.text.trim();
    if (extractedText.length < 100) {
      console.warn('[extractResumeFromPDF] Texto extraído muito curto:', extractedText);
      throw new Error('Conteúdo extraído insuficiente ou inválido');
    }

    console.log('[extractResumeFromPDF] Extração bem-sucedida, tamanho do texto:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('[extractResumeFromPDF] Erro crítico:', error);
    throw error;
  }
}

// Função auxiliar para renderização de páginas do PDF
function render_page(pageData) {
  // Personalizar extração para melhorar qualidade
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: false
  };
  
  return pageData.getTextContent(render_options)
    .then(function(textContent) {
      let text = '';
      let lastY = -1;
      let lastX = -1;
      
      // Processar itens de texto para preservar formatação
      for (const item of textContent.items) {
        if (lastY !== item.transform[5] || lastX > item.transform[4] + 30) {
          text += '\n';
        } else if (lastX !== item.transform[4]) {
          text += ' ';
        }
        
        text += item.str;
        lastY = item.transform[5];
        lastX = item.transform[4] + item.width;
      }
      
      return text;
    });
}

// Extração de LinkedIn aprimorada
async function extractResumeFromLinkedIn(url: string): Promise<string> {
  try {
    console.log('[extractResumeFromLinkedIn] Iniciando extração do LinkedIn:', url);

    if (!url || typeof url !== 'string') {
      throw new Error('URL do LinkedIn inválida ou não fornecida');
    }

    // Validação rigorosa da URL
    const linkedInRegex = /^https:\/\/([\w]+\.)?linkedin\.com\/in\/[A-z0-9_-]{5,100}\/?$/;
    if (!linkedInRegex.test(url)) {
      throw new Error('URL do LinkedIn inválida. Formato esperado: https://linkedin.com/in/username');
    }

    // Inicializar o navegador com configurações otimizadas para evitar detecção
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1280,720',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ],
      timeout: 60000, // 60 segundos
    }).catch(error => {
      throw new Error(`Falha ao iniciar navegador: ${error.message}`);
    });

    try {
      console.log('[extractResumeFromLinkedIn] Navegador inicializado');
      
      const page = await browser.newPage();
      
      // Configuração da página para parecer um usuário real
      await page.setViewport({ width: 1280, height: 800 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
      });
      
      // Desabilitar cache e interceptações que possam causar bloqueio
      await page.setCacheEnabled(false);
      
      // Timeout para navegação
      console.log('[extractResumeFromLinkedIn] Navegando para URL:', url);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      }).catch(error => {
        throw new Error(`Falha ao carregar perfil do LinkedIn: ${error.message}`);
      });
      
      // Esperamos que elementos críticos sejam carregados
      try {
        await page.waitForSelector('h1', { timeout: 10000 });
        await page.waitForFunction(() => document.body.innerText.length > 500, { timeout: 10000 });
      } catch (timeoutError) {
        console.warn('[extractResumeFromLinkedIn] Timeout ao aguardar carregamento completo:', timeoutError);
        // Continuamos mesmo assim
      }

      // Extrair conteúdo com estrutura aprimorada
      console.log('[extractResumeFromLinkedIn] Extraindo conteúdo do perfil');
      const profileContent = await page.evaluate(() => {
        // Extrair texto de uma seção específica, com fallbacks
        const extractSectionContent = (sectionId, alternativeSelectors = []) => {
          // Tenta primeiro pelo ID da seção
          let section = document.getElementById(sectionId);
          
          // Se não encontrar pelo ID, tenta seletores alternativos
          if (!section && alternativeSelectors.length) {
            for (const selector of alternativeSelectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length) {
                section = elements[0];
                break;
              }
            }
          }
          
          if (!section) return null;
          
          // Obtém todos os elementos com texto dentro da seção
          const textNodes = Array.from(section.querySelectorAll('*'))
            .filter(el => el.innerText && el.innerText.trim().length > 0);
          
          // Extrai texto mantendo alguma estrutura
          return {
            fullText: section.innerText.trim(),
            // Extrai itens individuais (experiências, formação, etc)
            items: textNodes
              .filter(el => {
                // Pegar apenas "containers" que parecem ser itens independentes
                return el.children.length > 0 && 
                      el.innerText.split('\n').length > 1 &&
                      el.innerText.length > 30;
              })
              .map(el => el.innerText.trim())
          };
        };
        
        // Dados pessoais
        const name = document.querySelector('h1')?.innerText.trim() || '';
        const title = document.querySelector('div.pv-text-details__left-panel h2')?.innerText.trim() || '';
        const location = document.querySelector('.pv-text-details__left-panel .text-body-small')?.innerText.trim() || '';
        
        // Coleta textos de contato se disponíveis
        const contactInfo = Array.from(document.querySelectorAll('.pv-contact-info section'))
          .map(section => ({
            type: section.querySelector('.pv-contact-info__header')?.innerText.trim() || '',
            value: section.querySelector('.pv-contact-info__ci-container')?.innerText.trim() || ''
          }))
          .filter(info => info.type && info.value);
        
        // Extrai as seções principais
        return {
          personalInfo: {
            name,
            title,
            location,
            contactInfo
          },
          about: document.querySelector('section#about')?.innerText.trim() || '',
          experience: extractSectionContent('experience', ['.experience-section', 'section[data-section="experience"]']),
          education: extractSectionContent('education', ['.education-section', 'section[data-section="education"]']),
          skills: extractSectionContent('skills', ['.skills-section', 'section[data-section="skills"]']),
          certifications: extractSectionContent('certifications', ['section[data-section="certifications"]']),
          languages: extractSectionContent('languages', ['section[data-section="languages"]']),
          recommendations: extractSectionContent('recommendations', ['section[data-section="recommendations"]']),
          // Timestamp para debug e cache
          extractedAt: new Date().toISOString()
        };
      }).catch(error => {
        throw new Error(`Falha ao extrair conteúdo do perfil: ${error.message}`);
      });

      // Validação do conteúdo extraído
      if (!profileContent.personalInfo || !profileContent.personalInfo.name) {
        throw new Error('Dados essenciais do perfil não foram encontrados');
      }

      console.log('[extractResumeFromLinkedIn] Extração bem-sucedida');
      return JSON.stringify(profileContent);
    } finally {
      // Sempre fecha o navegador para liberar recursos
      await browser.close().catch(error => {
        console.error('[extractResumeFromLinkedIn] Erro ao fechar navegador:', error);
      });
      console.log('[extractResumeFromLinkedIn] Navegador fechado');
    }
  } catch (error) {
    console.error('[extractResumeFromLinkedIn] Erro crítico:', error);
    throw error;
  }
}

// Análise de currículo usando OpenAI
async function analyzeResume(text: string): Promise<ResumeData> {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Texto do currículo inválido ou não fornecido');
    }

    console.log('[analyzeResume] Iniciando análise, tamanho do texto:', text.length);
    await validateEnvironment();
    const openaiClient = await initializeOpenAI();

    // Prompt estruturado para limitar tamanho do input
    const maxTextLength = 15000; // Limite para evitar exceder tokens da API
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...[texto truncado devido ao tamanho]' 
      : text;
    
    const prompt = `
      Você é um analisador especializado em currículos profissionais. Analise o seguinte currículo e extraia as informações estruturadas:

      ${truncatedText}

      Retorne apenas o JSON com a seguinte estrutura, sem comentários adicionais:
      ${JSON.stringify({
        personalInfo: {
          name: 'string',
          contact: {
            email: 'string',
            phone: 'string?',
            location: 'string?',
          },
        },
        experience: [{
          company: 'string',
          role: 'string',
          period: {
            start: 'YYYY-MM',
            end: 'YYYY-MM | "present"',
          },
          description: 'string (max 300 chars)',
          achievements: ['string'],
        }],
        education: [{
          institution: 'string',
          degree: 'string',
          field: 'string',
          period: {
            start: 'YYYY-MM',
            end: 'YYYY-MM | "present"',
          },
        }],
        skills: {
          technical: [{
            name: 'string',
            level: 'básico | intermediário | avançado | especialista',
          }],
          interpersonal: [{
            name: 'string',
            level: 'básico | intermediário | avançado | especialista',
          }],
          tools: [{
            name: 'string',
            level: 'básico | intermediário | avançado | especialista',
          }],
        },
        certifications: [{
          name: 'string',
          issuer: 'string',
          date: 'YYYY-MM',
          expirationDate: 'YYYY-MM?',
        }],
        languages: [{
          name: 'string',
          level: 'básico | intermediário | avançado | fluente | nativo',
        }],
      }, null, 2)}
      
      Se não tiver uma informação específica, deixe o campo em branco ou forneça uma estimativa razoável com base no contexto.
    `;

    console.log('[analyzeResume] Enviando solicitação para OpenAI');
    
    // Implementação com retry
    let retryCount = 0;
    const maxRetries = 3;
    let lastError;
    
    while (retryCount < maxRetries) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: prompt,
          }],
          temperature: 0.3,
          timeout: 60000, // 60 segundos
        });
        
        if (!completion?.choices?.[0]?.message?.content) {
          throw new Error('Nenhuma resposta da OpenAI');
        }
        
        console.log('[analyzeResume] Resposta da OpenAI recebida com sucesso');
        
        try {
          const cleanContent = completion.choices[0].message.content.trim();
          // Limpar qualquer texto antes e depois do JSON
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : cleanContent;
          
          const parsedContent = JSON.parse(jsonString);
          return parsedContent;
        } catch (parseError) {
          console.error('[analyzeResume] Erro ao analisar JSON da resposta:', parseError);
          throw new Error(`Falha ao analisar resposta da OpenAI: ${parseError.message}`);
        }
      } catch (error) {
        console.warn(`[analyzeResume] Erro na tentativa ${retryCount + 1}:`, error);
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Esperar antes de tentar novamente (backoff exponencial)
          const delay = 1000 * Math.pow(2, retryCount);
          console.log(`[analyzeResume] Aguardando ${delay}ms antes da próxima tentativa`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    // Se chegamos aqui, todas as tentativas falharam
    throw new Error(`Análise falhou após ${maxRetries} tentativas: ${lastError?.message}`);
  } catch (error) {
    console.error('[analyzeResume] Erro crítico:', error);
    throw error;
  }
}

// Geração visual do currículo
async function generateVisualResume(resumeData: ResumeData, style: VisualStyle): Promise<string> {
  try {
    console.log('[generateVisualResume] Iniciando geração de currículo visual');
    await validateEnvironment();
    const openaiClient = await initializeOpenAI();

    if (!resumeData || typeof resumeData !== 'object') {
      throw new Error('Dados do currículo inválidos');
    }

    if (!style || typeof style !== 'object') {
      throw new Error('Configuração de estilo inválida');
    }

    const prompt = `
      Você é um designer especializado em currículos profissionais. 
      Com base nos dados e estilo fornecidos, crie um currículo visualmente atraente.

      DADOS DO CURRÍCULO:
      ${JSON.stringify(resumeData, null, 2)}

      ESTILO VISUAL:
      ${JSON.stringify(style, null, 2)}

      Crie um código HTML e CSS completo que:
      1. Utilize efetivamente a paleta de cores especificada
      2. Reflita o estilo visual selecionado (${style.style})
      3. Organize as informações em uma hierarquia visual lógica
      4. Implemente tipografia apropriada ao estilo
      5. Mantenha excelente legibilidade e escaneabilidade
      6. Inclua elementos visuais de destaque apropriados
      7. Use representações gráficas para níveis de habilidade
      8. Seja totalmente responsivo para visualização em qualquer dispositivo
      9. Inclua meta tags para SEO e compartilhamento social
      10. Use HTML5 semântico e CSS moderno

      Retorne apenas o código HTML e CSS completo em um único arquivo, sem comentários adicionais ou explicações.
      O código deve estar pronto para uso, funcionando sem dependências externas.
    `;

    console.log('[generateVisualResume] Enviando solicitação para OpenAI');

    // Implementação com retry
    let retryCount = 0;
    const maxRetries = 3;
    let lastError;
    
    while (retryCount < maxRetries) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: prompt,
          }],
          temperature: 0.3,
          timeout: 60000, // 60 segundos
        });

        if (!completion?.choices?.[0]?.message?.content) {
          throw new Error('Nenhuma resposta da OpenAI');
        }

        const htmlContent = completion.choices[0].message.content.trim();
        
        // Verificação rápida se o resultado é realmente HTML
        if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
          throw new Error('O conteúdo retornado não parece ser HTML válido');
        }
        
        console.log('[generateVisualResume] HTML gerado com sucesso, tamanho:', htmlContent.length);
        return htmlContent;
      } catch (error) {
        console.warn(`[generateVisualResume] Erro na tentativa ${retryCount + 1}:`, error);
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Esperar antes de tentar novamente (backoff exponencial)
          const delay = 1000 * Math.pow(2, retryCount);
          console.log(`[generateVisualResume] Aguardando ${delay}ms antes da próxima tentativa`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    // Se chegamos aqui, todas as tentativas falharam
    throw new Error(`Geração visual falhou após ${maxRetries} tentativas: ${lastError?.message}`);
  } catch (error) {
    console.error('[generateVisualResume] Erro crítico:', error);
    throw error;
  }
}

// Implementação completa do endpoint Deno
Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Nova requisição recebida: ${req.method}`);

  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    await validateEnvironment();

    if (req.method !== 'POST') {
      throw new Error(`Método ${req.method} não permitido`);
    }

    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type deve ser application/json');
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      throw new Error(`Payload JSON inválido: ${error.message}`);
    }

    const { action, data } = body;

    if (!action || !data) {
      throw new Error('Parâmetros obrigatórios ausentes: action ou data');
    }

    console.log(`[${requestId}] Processando requisição ${action} com dados:`, data);

    let result;
    switch (action) {
      case 'analyze': {
        if (!data.text) {
          throw new Error('Parâmetro obrigatório ausente: text');
        }
        result = await analyzeResume(data.text);
        break;
      }

      case 'generate': {
        if (!data.resume || !data.style) {
          throw new Error('Parâmetros obrigatórios ausentes: resume ou style');
        }
        result = await generateVisualResume(data.resume, data.style);
        break;
      }

      case 'extract': {
        if (!data.url) {
          throw new Error('Parâmetro obrigatório ausente: url');
        }
        result = await extractResumeFromPDF(data.url);
        break;
      }

      case 'linkedin': {
        if (!data.url) {
          throw new Error('Parâmetro obrigatório ausente: url');
        }
        result = await extractResumeFromLinkedIn(data.url);
        break;
      }

      default:
        throw new Error(`Ação inválida: ${action}`);
    }

    console.log(`[${requestId}] Requisição processada com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result,
        requestId
      }),
      {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Erro:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Ocorreu um erro inesperado',
      details: error.stack,
      requestId,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
        status: error.status || 400,
      }
    );
  }
});