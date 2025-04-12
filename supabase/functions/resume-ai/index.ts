import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://deno.land/x/openai/mod.ts'

// IMPORTANT: Set your OpenAI API key in Supabase Edge Function secrets
// const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

// Placeholder for the API key - replace with secure retrieval in production
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual key or use environment variables

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  // In a real scenario, you might want to return an error response here
}

const RESUME_PARSE_PROMPT = `
Você é um analisador especializado em currículos profissionais.

Analise o seguinte currículo e estruture-o nas 8 seções essenciais:
1. Cabeçalho Impactante (Nome, Contato, Título Profissional)
2. Resumo Profissional Persuasivo (Breve descrição das qualificações e objetivos)
3. Palavras-chave Otimizadas (Termos relevantes para a área de atuação)
4. Experiência Profissional (Formato STAR/CAR: Situação, Tarefa, Ação, Resultado / Contexto, Ação, Resultado)
5. Competências Técnicas e Comportamentais (Hard skills e Soft skills)
6. Formação Acadêmica e Certificações (Graus, cursos, instituições, datas)
7. Realizações Destacadas (Conquistas quantificáveis, prêmios)
8. Conteúdo Complementar (Idiomas, projetos pessoais, voluntariado, etc.)

Regras essenciais:
- Não invente informações ou números.
- Use o texto original sempre que possível.
- Torne as frases concisas e diretas.
- Foque em resultados quantificáveis.
- Evite linguagem que pareça gerada por IA.
- Retorne a resposta como um objeto JSON com chaves correspondendo aos nomes das seções (ex: "CabecalhoImpactante", "ResumoProfissionalPersuasivo", etc.). O valor de cada chave deve ser o texto extraído e estruturado para aquela seção.

CURRÍCULO PARA ANÁLISE:
---
{resume_text}
---

OBJETO JSON ESTRUTURADO:
`;

serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let resumeText = '';
  try {
    const body = await req.json();
    resumeText = body.resume_text;
    if (!resumeText) {
      throw new Error('Missing resume_text in request body');
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new Response(JSON.stringify({ error: 'Bad Request', details: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!OPENAI_API_KEY) {
     return new Response(JSON.stringify({ error: 'Server configuration error: OpenAI API key not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openai = new OpenAI(OPENAI_API_KEY);

  try {
    console.log('Sending request to OpenAI...');
    const completion = await openai.createCompletion({
      model: 'text-davinci-003', // Or a newer/more suitable model
      prompt: RESUME_PARSE_PROMPT.replace('{resume_text}', resumeText),
      max_tokens: 2048, // Adjust as needed based on expected resume length and detail
      temperature: 0.2, // Lower temperature for more deterministic output
      stop: null, // Let the model finish naturally or define specific stop sequences if needed
      // Ensure the output is likely JSON
      // logit_bias: { /* Consider biasing towards JSON tokens if needed */ },
    });

    const structuredDataText = completion.choices[0]?.text?.trim();

    if (!structuredDataText) {
        throw new Error('OpenAI response was empty or invalid.');
    }

    console.log('Received raw response from OpenAI:', structuredDataText);

    // Attempt to parse the JSON response from OpenAI
    let structuredData;
    try {
        // Basic cleanup: Sometimes the model might add backticks or 'json' prefix
        const cleanedJsonString = structuredDataText.replace(/^```json\n?|```$/g, '').trim();
        structuredData = JSON.parse(cleanedJsonString);
    } catch (parseError) {
        console.error('Error parsing OpenAI JSON response:', parseError);
        console.error('Raw response that failed parsing:', structuredDataText);
        // Fallback: Return the raw text if JSON parsing fails, maybe wrapped in an error structure
        return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw_response: structuredDataText }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    console.log('Successfully parsed structured data.');

    return new Response(JSON.stringify(structuredData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

console.log('Resume AI Edge Function started...');
