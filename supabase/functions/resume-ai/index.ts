import { Configuration, OpenAIApi } from "npm:openai@4.28.0";
import { parse as parsePdf } from "npm:pdf-parse@1.1.1";
import puppeteer from "npm:puppeteer@22.3.0";

interface ResumeData {
  personalInfo: {
    name: string;
    contact: {
      email: string;
      phone?: string;
      location?: string;
    };
  };
  experience: Array<{
    company: string;
    role: string;
    period: {
      start: string;
      end: string | 'present';
    };
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    period: {
      start: string;
      end: string | 'present';
    };
  }>;
  skills: {
    technical: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
    interpersonal: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
    tools: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expirationDate?: string;
  }>;
  languages: Array<{
    name: string;
    level: 'básico' | 'intermediário' | 'avançado' | 'fluente' | 'nativo';
  }>;
}

interface VisualStyle {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  style: 'modern' | 'classic' | 'creative' | 'minimal' | 'tech';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
};

let openai: OpenAIApi | null = null;

async function initializeOpenAI() {
  if (openai) return openai;

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    const configuration = new Configuration({ apiKey });
    openai = new OpenAIApi(configuration);
    return openai;
  } catch (error) {
    console.error('[OpenAI Initialization Error]:', error);
    throw new Error(`Failed to initialize OpenAI client: ${error.message}`);
  }
}

async function validateEnvironment() {
  const requiredEnvVars = ['OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

async function analyzeResume(text: string): Promise<ResumeData> {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid resume text provided');
    }

    console.log('[analyzeResume] Starting resume analysis');
    await validateEnvironment();
    const openaiClient = await initializeOpenAI();

    const prompt = `
      Você é um analisador especializado em currículos profissionais. Analise o seguinte currículo e extraia as informações estruturadas:

      ${text}

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
    `;

    console.log('[analyzeResume] Sending request to OpenAI');
    
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt,
      }],
      temperature: 0.3,
      timeout: 60000, // Increased timeout to 60 seconds
    }).catch(error => {
      console.error('[analyzeResume] OpenAI API Error:', error);
      throw new Error(`OpenAI API request failed: ${error.message}`);
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response content from OpenAI API');
    }

    console.log('[analyzeResume] Successfully received OpenAI response');

    try {
      const parsedContent = JSON.parse(completion.choices[0].message.content);
      return parsedContent;
    } catch (parseError) {
      console.error('[analyzeResume] JSON Parse Error:', parseError);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('[analyzeResume] Error:', error);
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
}

async function generateVisualResume(resumeData: ResumeData, style: VisualStyle): Promise<string> {
  try {
    console.log('[generateVisualResume] Starting visual resume generation');
    await validateEnvironment();
    const openaiClient = await initializeOpenAI();

    if (!resumeData || typeof resumeData !== 'object') {
      throw new Error('Invalid resume data provided');
    }

    if (!style || typeof style !== 'object') {
      throw new Error('Invalid style configuration provided');
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
      2. Reflita o estilo visual selecionado
      3. Organize as informações em uma hierarquia visual lógica
      4. Implemente tipografia apropriada ao estilo
      5. Mantenha excelente legibilidade e escaneabilidade
      6. Inclua elementos visuais de destaque
      7. Use representações gráficas para níveis de habilidade
      8. Adicione elementos de design que reforcem a identidade profissional

      Retorne apenas o código HTML e CSS completo, sem comentários adicionais.
    `;

    console.log('[generateVisualResume] Sending request to OpenAI');

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt,
      }],
      temperature: 0.3,
      timeout: 60000, // Increased timeout to 60 seconds
    }).catch(error => {
      console.error('[generateVisualResume] OpenAI API Error:', error);
      throw new Error(`OpenAI API request failed: ${error.message}`);
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response content from OpenAI API');
    }

    console.log('[generateVisualResume] Successfully received OpenAI response');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('[generateVisualResume] Error:', error);
    throw new Error(`Visual resume generation failed: ${error.message}`);
  }
}

async function extractResumeFromPDF(url: string): Promise<string> {
  try {
    console.log('[extractResumeFromPDF] Starting PDF extraction');

    if (!url || typeof url !== 'string') {
      throw new Error('Invalid PDF URL provided');
    }

    const response = await fetch(url, {
      timeout: 30000, // 30 second timeout
    }).catch(error => {
      throw new Error(`Failed to fetch PDF: ${error.message}`);
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    
    const data = await parsePdf(new Uint8Array(pdfBuffer)).catch(error => {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    });

    if (!data?.text) {
      throw new Error('No text content found in PDF');
    }

    console.log('[extractResumeFromPDF] Successfully extracted PDF content');
    return data.text;
  } catch (error) {
    console.error('[extractResumeFromPDF] Error:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

async function extractResumeFromLinkedIn(url: string): Promise<string> {
  try {
    console.log('[extractResumeFromLinkedIn] Starting LinkedIn extraction');

    if (!url || typeof url !== 'string') {
      throw new Error('Invalid LinkedIn URL provided');
    }

    const linkedInRegex = /^https:\/\/([\w]+\.)?linkedin\.com\/in\/[A-z0-9_-]+\/?$/;
    if (!linkedInRegex.test(url)) {
      throw new Error('Invalid LinkedIn profile URL');
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000, // 60 second timeout
    }).catch(error => {
      throw new Error(`Failed to launch browser: ${error.message}`);
    });

    try {
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      }).catch(error => {
        throw new Error(`Failed to load LinkedIn profile: ${error.message}`);
      });

      const profileContent = await page.evaluate(() => {
        const sections = ['experience', 'education', 'skills', 'certifications'];
        const content: Record<string, string> = {};

        for (const section of sections) {
          const sectionElement = document.querySelector(`section#${section}`);
          if (sectionElement) {
            content[section] = sectionElement.textContent || '';
          }
        }

        return JSON.stringify(content);
      }).catch(error => {
        throw new Error(`Failed to extract profile content: ${error.message}`);
      });

      if (!profileContent) {
        throw new Error('Failed to extract LinkedIn profile content');
      }

      console.log('[extractResumeFromLinkedIn] Successfully extracted LinkedIn content');
      return profileContent;
    } finally {
      await browser.close().catch(error => {
        console.error('[extractResumeFromLinkedIn] Error closing browser:', error);
      });
    }
  } catch (error) {
    console.error('[extractResumeFromLinkedIn] Error:', error);
    throw new Error(`LinkedIn extraction failed: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New request received: ${req.method}`);

  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    await validateEnvironment();

    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      throw new Error(`Invalid JSON payload: ${error.message}`);
    }

    const { action, data } = body;

    if (!action || !data) {
      throw new Error('Missing required parameters: action or data');
    }

    console.log(`[${requestId}] Processing ${action} request with data:`, data);

    let result;
    switch (action) {
      case 'analyze': {
        if (!data.text) {
          throw new Error('Missing required parameter: text');
        }
        result = await analyzeResume(data.text);
        break;
      }

      case 'generate': {
        if (!data.resume || !data.style) {
          throw new Error('Missing required parameters: resume or style');
        }
        result = await generateVisualResume(data.resume, data.style);
        break;
      }

      case 'extract': {
        if (!data.url) {
          throw new Error('Missing required parameter: url');
        }
        result = await extractResumeFromPDF(data.url);
        break;
      }

      case 'linkedin': {
        if (!data.url) {
          throw new Error('Missing required parameter: url');
        }
        result = await extractResumeFromLinkedIn(data.url);
        break;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    console.log(`[${requestId}] Request processed successfully`);

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
    console.error(`[${requestId}] Error:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected error occurred',
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