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
      Você é um analisador especializado em currículos profissionais, treinado para extrair informações estruturadas precisas.
      
      TEXTO DO CURRÍCULO:
      ${truncatedText}
      
      INSTRUÇÕES DE EXTRAÇÃO:
      1. Extraia apenas informações factuais presentes no currículo - não invente ou alucine informações
      2. Para informações ausentes, use null ou array vazio [] conforme apropriado
      3. Para datas, use o formato AAAA-MM se disponível, ou estime o ano se apenas informações parciais forem fornecidas
      4. Para períodos de experiência onde a data final é "presente", "atual", "até o momento", etc., use "present" como valor
      5. Limite descrições a 300 caracteres no máximo
      6. Seja preciso e foque em informações chave
      7. Crie um objetivo profissional conciso baseado no conteúdo do currículo
      8. Extraia detalhes ricos para a seção marketExperience que serão usados para tooltips
      
      ESTRUTURA DE SAÍDA REQUERIDA:
      {
        "personalInfo": {
          "name": "Nome completo do candidato",
          "contact": {
            "email": "Endereço de email",
            "phone": "Número de telefone (com código de país se presente)",
            "location": "Cidade, Estado/Província, País ou localização geográfica"
          }
        },
        "objective": {
          "summary": "Resumo conciso dos objetivos profissionais do candidato (1-2 frases)"
        },
        "experience": [
          {
            "company": "Nome da empresa",
            "role": "Cargo ou posição",
            "period": {
              "start": "AAAA-MM", 
              "end": "AAAA-MM ou 'present'"
            },
            "description": "Breve descrição do trabalho (max 300 caracteres)",
            "achievements": ["Conquista notável 1", "Conquista notável 2", "..."]
          }
        ],
        "education": [
          {
            "institution": "Nome da Escola/Universidade",
            "degree": "Tipo de grau (ex: Bacharelado, Mestrado, Doutorado)",
            "field": "Campo de estudo ou especialização",
            "period": {
              "start": "AAAA-MM",
              "end": "AAAA-MM ou 'present'"
            }
          }
        ],
        "skills": {
          "technical": [
            {"name": "Nome da habilidade técnica", "level": "básico|intermediário|avançado|especialista"}
          ],
          "interpersonal": [
            {"name": "Nome da soft skill", "level": "básico|intermediário|avançado|especialista"}
          ],
          "tools": [
            {"name": "Nome da ferramenta ou software", "level": "básico|intermediário|avançado|especialista"}
          ]
        },
        "certifications": [
          {
            "name": "Nome da certificação",
            "issuer": "Organização emissora",
            "date": "AAAA-MM",
            "expirationDate": "AAAA-MM ou null se não aplicável"
          }
        ],
        "languages": [
          {
            "name": "Nome do idioma",
            "level": "básico|intermediário|avançado|fluente|nativo"
          }
        ],
        "marketExperience": {
          "details": [
            {
              "company": "Nome da empresa",
              "extendedDescription": "Descrição detalhada da experiência para tooltips e displays expandidos",
              "keywords": "palavras-chave,separadas,por,vírgula"
            }
          ]
        }
      }
      
      DIRETRIZES ADICIONAIS:
      - Se você puder inferir o nível de habilidade, mas ele não estiver explicitamente declarado, faça uma estimativa razoável baseada no contexto
      - Para idiomas, use "básico", "intermediário", "avançado", "fluente", ou "nativo"
      - Para habilidades técnicas e interpessoais, use "básico", "intermediário", "avançado", ou "especialista"
      - Se o currículo não estiver em português, você pode usar equivalentes em inglês para níveis de habilidade e normalizar para português na saída final
      - Priorize extrair todas as informações disponíveis mesmo que o formato varie da estrutura esperada
      - Se encontrar múltiplas experiências profissionais ou formações, liste todas em ordem cronológica (mais recente primeiro)
      - Para habilidades técnicas, categorize apropriadamente entre technical, interpersonal e tools
      - O campo marketExperience deve conter descrições mais completas e ricas das experiências profissionais, para uso em tooltips e visualizações expandidas
      - Se não conseguir extrair um objetivo profissional explícito, crie um breve resumo (1-2 frases) baseado na experiência e qualificações
      
      Por favor, retorne APENAS a estrutura JSON sem comentários ou explicações adicionais. Assegure que o JSON seja válido e não tenha erros de sintaxe.
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
      11. Inclua o objetivo profissional em destaque, logo após as informações pessoais
      12. Se existirem, utilize os dados detalhados de 'marketExperience' para criar tooltips ou seções expandidas
      13. Crie uma versão print-friendly do currículo

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