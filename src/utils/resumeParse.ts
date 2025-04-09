// Utilitário para extrair dados de currículos
// Usa análise de texto básica sem depender de bibliotecas externas complexas

/**
 * Extrai dados estruturados de um currículo a partir do texto
 */
export const parseResumeText = (text: string, userName?: string, userEmail?: string) => {
    // Estrutura básica que vamos preencher
    const resumeData = {
      personalInfo: {
        name: userName || "Nome não encontrado",
        contact: {
          email: userEmail || "",
          phone: "",
          location: ""
        }
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        interpersonal: [],
        tools: []
      },
      languages: []
    };
    
    // Extrair telefone (formato básico)
    const phoneRegex = /\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      resumeData.personalInfo.contact.phone = phoneMatches[0];
    }
    
    // Extrair localização (cidades comuns brasileiras)
    const locationRegex = /(São Paulo|Rio de Janeiro|Brasília|Salvador|Belo Horizonte|Curitiba|Fortaleza|Manaus|Recife|Porto Alegre)([,-\s].*?)?$/gmi;
    const locationMatches = text.match(locationRegex);
    if (locationMatches && locationMatches.length > 0) {
      resumeData.personalInfo.contact.location = locationMatches[0].trim();
    }
    
    // Extrair experiência profissional
    // Procurar por padrões como "Experiência" ou "Experiência Profissional"
    const experienceSection = extractSection(text, ['experiência', 'experiência profissional', 'experiencias', 'histórico profissional']);
    
    if (experienceSection) {
      // Tentar encontrar empresas e cargos
      const companyRegex = /(?:^|\n)([A-Z][A-Za-z\s]+)(?:\s*[-–]\s*|\n|:)([^\n]+)/g;
      let match;
      
      while ((match = companyRegex.exec(experienceSection)) !== null) {
        if (match.length >= 2) {
          resumeData.experience.push({
            company: match[1].trim(),
            role: match[2] ? match[2].trim() : "Cargo não especificado",
            period: {
              start: "2020-01", // Valores padrão
              end: "present"
            },
            description: "Responsável por atividades e projetos relacionados à função.",
            achievements: []
          });
        }
      }
    }
    
    // Se não encontramos experiências, adicionar uma padrão
    if (resumeData.experience.length === 0) {
      resumeData.experience.push({
        company: "Empresa atual",
        role: "Cargo atual",
        period: {
          start: "2020-01",
          end: "present"
        },
        description: "Detalhes disponíveis na versão completa após a compra",
        achievements: ["Acesso a todas as conquistas após a compra"]
      });
    }
    
    // Extrair educação
    const educationSection = extractSection(text, ['educação', 'formação', 'formação acadêmica', 'escolaridade']);
    
    if (educationSection) {
      // Tentar encontrar instituições e cursos
      const educationRegex = /(?:^|\n)([A-Z][A-Za-z\s]+)(?:\s*[-–]\s*|\n|:)([^\n]+)/g;
      let match;
      
      while ((match = educationRegex.exec(educationSection)) !== null) {
        if (match.length >= 2) {
          resumeData.education.push({
            institution: match[1].trim(),
            degree: "Graduação",
            field: match[2] ? match[2].trim() : "Área não especificada",
            period: {
              start: "2015-01",
              end: "2019-12"
            }
          });
        }
      }
    }
    
    // Se não encontramos educação, adicionar uma padrão
    if (resumeData.education.length === 0) {
      resumeData.education.push({
        institution: "Instituição de Ensino",
        degree: "Graduação",
        field: "Sua área de formação",
        period: {
          start: "2015-01",
          end: "2019-12"
        }
      });
    }
    
    // Extrair habilidades
    const skillsSection = extractSection(text, ['habilidades', 'competências', 'skills', 'conhecimentos']);
    
    if (skillsSection) {
      // Dividir por linhas ou vírgulas
      const skillItems = skillsSection.split(/[,\n;]/).map(item => item.trim()).filter(item => item.length > 0);
      
      // Adicionar como habilidades técnicas
      skillItems.forEach(skill => {
        if (skill.length > 2 && skill.length < 30) { // Filtrar entradas muito curtas ou muito longas
          resumeData.skills.technical.push({
            name: skill,
            level: determineSkillLevel(skill, text)
          });
        }
      });
    }
    
    // Se não encontramos habilidades, adicionar algumas padrão
    if (resumeData.skills.technical.length === 0) {
      resumeData.skills.technical = [
        { name: "Habilidade Técnica 1", level: "avançado" },
        { name: "Habilidade Técnica 2", level: "intermediário" }
      ];
    }
    
    // Adicionar algumas habilidades interpessoais padrão
    resumeData.skills.interpersonal = [
      { name: "Comunicação", level: "avançado" },
      { name: "Trabalho em Equipe", level: "avançado" }
    ];
    
    // Extrair idiomas
    const languagesSection = extractSection(text, ['idiomas', 'línguas', 'languages']);
    
    if (languagesSection) {
      // Procurar por idiomas comuns
      const commonLanguages = ['português', 'inglês', 'espanhol', 'francês', 'alemão', 'italiano', 'japonês', 'mandarim'];
      
      commonLanguages.forEach(language => {
        const languageRegex = new RegExp(`${language}\\s*[-:.]?\\s*(básico|intermediário|avançado|fluente|nativo)`, 'i');
        const match = languagesSection.match(languageRegex);
        
        if (match) {
          resumeData.languages.push({
            name: language.charAt(0).toUpperCase() + language.slice(1),
            level: match[1].toLowerCase()
          });
        }
      });
    }
    
    // Se não encontramos idiomas, adicionar Português como padrão
    if (resumeData.languages.length === 0) {
      resumeData.languages = [
        { name: "Português", level: "nativo" },
        { name: "Inglês", level: "intermediário" }
      ];
    }
    
    return resumeData;
  };
  
  /**
   * Extrai uma seção específica do texto do currículo
   */
  export const extractSection = (text: string, sectionHeaders: string[]) => {
    // Converter texto para minúsculas para facilitar a busca
    const lowerText = text.toLowerCase();
    
    let startIndex = -1;
    let endIndex = text.length;
    
    // Encontrar o início da seção (usando qualquer um dos headers fornecidos)
    for (const header of sectionHeaders) {
      const headerIndex = lowerText.indexOf(header);
      if (headerIndex !== -1 && (startIndex === -1 || headerIndex < startIndex)) {
        startIndex = headerIndex;
      }
    }
    
    if (startIndex === -1) {
      return null; // Seção não encontrada
    }
    
    // Avançar até o fim do cabeçalho
    startIndex = lowerText.indexOf('\n', startIndex);
    if (startIndex === -1) {
      startIndex = 0; // Se não encontrar quebra de linha, usar o texto inteiro
    } else {
      startIndex += 1; // Pular a quebra de linha
    }
    
    // Procurar pelo próximo cabeçalho comum em currículos
    const nextSectionHeaders = [
      'experiência', 'experiências', 'formação', 'educação', 
      'habilidades', 'competências', 'idiomas', 'línguas',
      'certificações', 'cursos', 'referências', 'objetivo'
    ];
    
    for (const header of nextSectionHeaders) {
      const headerIndex = lowerText.indexOf(header, startIndex);
      if (headerIndex !== -1 && headerIndex < endIndex) {
        endIndex = headerIndex;
      }
    }
    
    return text.substring(startIndex, endIndex).trim();
  };
  
  /**
   * Determina o nível de uma habilidade com base no contexto
   */
  export const determineSkillLevel = (skill: string, fullText: string) => {
    const levels = ['básico', 'intermediário', 'avançado', 'especialista'];
    
    // Procurar pelo padrão "habilidade - nível" ou similar
    const skillLevelRegex = new RegExp(`${skill}\\s*[-:.]?\\s*(básico|intermediário|avançado|especialista)`, 'i');
    const match = fullText.match(skillLevelRegex);
    
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    
    // Caso não encontre um nível explícito, atribuir um nível "intermediário" como padrão
    return 'intermediário';
  };
  
  /**
   * Cria dados básicos do currículo quando não é possível extrair dados reais
   */
  export const createBasicResumeData = (name?: string, email?: string) => {
    return {
      personalInfo: {
        name: name || "Seu Nome",
        contact: {
          email: email || "",
          phone: "",
          location: ""
        }
      },
      experience: [{
        company: "Sua experiência profissional será mostrada aqui",
        role: "Seu cargo atual",
        period: {
          start: "Data início",
          end: "present"
        },
        description: "Após a compra, você terá acesso aos detalhes completos do seu currículo.",
        achievements: ["Todos os seus destaques serão mostrados após a compra"]
      }],
      education: [{
        institution: "Sua instituição de ensino",
        degree: "Seu grau acadêmico",
        field: "Sua área de formação",
        period: {
          start: "Data início",
          end: "Data conclusão"
        }
      }],
      skills: {
        technical: [
          { name: "Suas habilidades técnicas", level: "avançado" },
          { name: "Serão mostradas aqui", level: "intermediário" }
        ],
        interpersonal: [
          { name: "Comunicação", level: "avançado" },
          { name: "Trabalho em Equipe", level: "avançado" }
        ],
        tools: []
      },
      languages: [
        { name: "Português", level: "nativo" },
        { name: "Inglês", level: "intermediário" }
      ]
    };
  };