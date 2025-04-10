// Importações necessárias
import { Configuration, OpenAIApi } from "npm:openai@4.28.0";
import { parse as parsePdf } from "npm:pdf-parse@1.1.1";

// Define o CORS headers para permitir chamadas da aplicação frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Função para validar ambiente
async function validateEnvironment() {
  // Verificar variáveis de ambiente necessárias
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('[validateEnvironment] OPENAI_API_KEY não configurada');
    throw new Error('Configuração incompleta: API Key da OpenAI ausente');
  }
  
  console.log('[validateEnvironment] Ambiente validado com sucesso');
  return true;
}

// Função para inicializar o cliente da OpenAI
async function initializeOpenAI() {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('API Key da OpenAI não configurada');
  }
  
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  
  const openaiClient = new OpenAIApi(configuration);
  return openaiClient;
}

// Função para extrair texto de um PDF
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
          headers: {
            'Accept': 'application/pdf'
          }
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
    try {
      const data = await parsePdf(new Uint8Array(pdfBuffer));
      
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
    } catch (parseError) {
      console.error('[extractResumeFromPDF] Erro ao processar PDF:', parseError);
      throw new Error(`Falha ao processar PDF: ${parseError.message}`);
    }
  } catch (error) {
    console.error('[extractResumeFromPDF] Erro crítico:', error);
    throw error;
  }
}

// Função para extrair dados do LinkedIn (simplificada)
async function extractResumeFromLinkedIn(url: string): Promise<string> {
  // Implementação simplificada
  if (!url || !url.includes('linkedin.com/in/')) {
    throw new Error('URL do LinkedIn inválida');
  }
  
  // Em produção, implementar com browser automation (puppeteer)
  return JSON.stringify({
    message: "Extração do LinkedIn não implementada completamente"
  });
}

// Função para analisar o currículo usando OpenAI
async function analyzeResume(text: string): Promise<any> {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Texto do currículo inválido ou não fornecido');
    }

    console.log('[analyzeResume] Iniciando análise, tamanho do texto:', text.length);
    await validateEnvironment();
    const openaiClient = await initializeOpenAI();

    // Limitar tamanho do input
    const maxTextLength = 15000;
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...[texto truncado devido ao tamanho]' 
      : text;
    
    const prompt = `
      Você é um analisador especializado em currículos profissionais. Analise o seguinte currículo e extraia as informações estruturadas:

      ${truncatedText}

      Retorne apenas o JSON com a seguinte estrutura, sem comentários adicionais:
      {
        "personalInfo": {
          "name": "string",
          "contact": {
            "email": "string",
            "phone": "string?",
            "location": "string?"
          }
        },
        "experience": [{
          "company": "string",
          "role": "string",
          "period": {
            "start": "YYYY-MM",
            "end": "YYYY-MM | present"
          },
          "description": "string (max 300 chars)",
          "achievements": ["string"]
        }],
        "education": [{
          "institution": "string",
          "degree": "string",
          "field": "string",
          "period": {
            "start": "YYYY-MM",
            "end": "YYYY-MM | present"
          }
        }],
        "skills": {
          "technical": [{
            "name": "string",
            "level": "básico | intermediário | avançado | especialista"
          }],
          "interpersonal": [{
            "name": "string",
            "level": "básico | intermediário | avançado | especialista"
          }],
          "tools": [{
            "name": "string",
            "level": "básico | intermediário | avançado | especialista"
          }]
        },
        "certifications": [{
          "name": "string",
          "issuer": "string",
          "date": "YYYY-MM",
          "expirationDate": "YYYY-MM?"
        }],
        "languages": [{
          "name": "string",
          "level": "básico | intermediário | avançado | fluente | nativo"
        }]
      }
      
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

// Função para gerar currículo visual
async function generateVisualResume(resumeData: any, style: any): Promise<string> {
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

// Servidor principal
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

    console.log(`[${requestId}] Processando requisição ${action}:`, data);

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