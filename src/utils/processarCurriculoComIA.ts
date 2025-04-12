import { supabase } from '../lib/supabase';
import { ResumeSections } from '../contexts/ResumeContext';
import toast from 'react-hot-toast';

/**
 * Função para processar o texto do currículo usando a Edge Function do Supabase
 * @param resumeText Texto do currículo a ser processado
 * @returns Dados estruturados do currículo ou null em caso de erro
 */
export async function processarCurriculoComIA(resumeText: string): Promise<ResumeSections | null> {
  try {
    // Mostrar toast de carregamento
    toast.loading('Processando seu currículo com IA...', { id: 'process-ai' });
    
    // Chamada para a função Edge do Supabase
    const { data, error } = await supabase.functions.invoke('resume-ai', {
      body: { resume_text: resumeText }
    });

    // Verificar se houve erro
    if (error) {
      console.error('Erro ao chamar a função Edge do Supabase:', error);
      toast.error('Erro ao processar o currículo. Tente novamente.', { id: 'process-ai' });
      return null;
    }

    // Verificar se os dados estão no formato esperado
    if (!data || typeof data !== 'object') {
      console.error('Resposta inválida da API:', data);
      toast.error('Formato de resposta inválido da API.', { id: 'process-ai' });
      return null;
    }

    // Verificar se todas as seções obrigatórias estão presentes
    const requiredSections: (keyof ResumeSections)[] = [
      'CabecalhoImpactante',
      'ResumoProfissionalPersuasivo',
      'PalavrasChaveOtimizadas',
      'ExperienciaProfissional',
      'CompetenciasTecnicasComportamentais',
      'FormacaoAcademicaCertificacoes',
      'RealizacoesDestacadas',
      'ConteudoComplementar'
    ];

    const missingSection = requiredSections.find(section => !(section in data));
    if (missingSection) {
      console.error(`Seção obrigatória ausente na resposta: ${missingSection}`);
      toast.error('Dados incompletos recebidos da API.', { id: 'process-ai' });
      return null;
    }

    // Notificar sucesso
    toast.success('Currículo processado com sucesso!', { id: 'process-ai' });
    
    // Retornar os dados estruturados
    return data as ResumeSections;
  } catch (error) {
    console.error('Erro ao processar currículo:', error);
    toast.error('Erro inesperado ao processar o currículo.', { id: 'process-ai' });
    return null;
  }
}