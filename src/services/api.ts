import { ResumeSections } from '../contexts/ResumeContext'; 


// Read the Supabase Function URL from environment variables
// Ensure this variable is set in your .env file (e.g., REACT_APP_SUPABASE_RESUME_AI_FUNCTION_URL=... for Create React App)
// Or VITE_SUPABASE_RESUME_AI_FUNCTION_URL=... for Vite
const RESUME_AI_FUNCTION_URL = process.env.REACT_APP_SUPABASE_RESUME_AI_FUNCTION_URL;
export async function processarCurriculoComIA(textoCurriculo: string): Promise<ResumeSections | null> {
  console.log('Chamando a função Supabase em:', RESUME_AI_FUNCTION_URL);

  if (!RESUME_AI_FUNCTION_URL) {
      console.error('Environment variable REACT_APP_SUPABASE_RESUME_AI_FUNCTION_URL is not set.');
      alert('Erro de configuração: URL da função de IA não definida nas variáveis de ambiente.'); te em api.ts');
      alert('Erro de configuração: URL da função de IA não definida.'); 
      return null;
  }

  try {
    const response = await fetch(RESUME_AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
        
      },
      body: JSON.stringify({ resume_text: textoCurriculo }),
    });

    if (!response.ok) {
      let errorBody = {};
      try {
          errorBody = await response.json();
      } catch(e) {
          console.warn('Não foi possível parsear o corpo do erro como JSON.');
      }
      console.error('Erro na resposta da API Supabase:', response.status, response.statusText, errorBody);
      throw new Error(`Falha ao processar currículo (Status: ${response.status}): ${response.statusText} ${JSON.stringify(errorBody)}`);
    }

    const dadosProcessados: ResumeSections = await response.json();
    console.log('Dados recebidos da IA via Supabase:', dadosProcessados);
    return dadosProcessados;

  } catch (error) {
    console.error('Erro ao chamar a função resume-ai via fetch:', error);
    alert(`Erro ao conectar com o serviço de IA: ${error.message}`); 
    return null;
  }
}
