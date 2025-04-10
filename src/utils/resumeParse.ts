// Utils para processamento de currículos no frontend
import { ResumeData } from "../types/resume";

/**
 * Analisa um currículo a partir do texto extraído
 */
export const parseResumeText = (text: string, userName?: string, userEmail?: string): ResumeData => {
  console.log('Analisando texto do currículo via método local');
  
  // Estrutura básica que vamos preencher
  const resumeData: ResumeData = {
    personalInfo: {
      name: userName || detectName(text) || "Nome não detectado",
      contact: {
        email: userEmail || detectEmail(text) || "",
        phone: detectPhone(text) || "",
        location: detectLocation(text) || ""
      }
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      interpersonal: [],
      tools: []
    },
    certifications: [],
    languages: []
  };
  
  // Extrair experiência profissional
  const experienceSection = extractSection(text, [
    'experiência', 'experiência profissional', 'experiencias', 
    'histórico profissional', 'trajetória profissional'
  ]);
  
  if (experienceSection) {
    const experiences = extractExperienceItems(experienceSection);
    if (experiences.length > 0) {
      resumeData.experience = experiences;
    }
  }
  
  // Se não encontramos experiências, adicionar placeholder
  if (resumeData.experience.length === 0) {
    resumeData.experience.push({
      company: "Empresa",
      role: "Cargo/Função",
      period: {
        start: "2020-01",
        end: "present"
      },
      description: "Detalhes de sua experiência profissional aparecerão aqui.",
      achievements: ["Suas conquistas e responsabilidades serão listadas aqui."]
    });
  }
  
  // Extrair educação
  const educationSection = extractSection(text, [
    'educação', 'formação', 'formação acadêmica', 
    'escolaridade', 'academic background'
  ]);
  
  if (educationSection) {
    const educationItems = extractEducationItems(educationSection);
    if (educationItems.length > 0) {
      resumeData.education = educationItems;
    }
  }
  
  // Se não encontramos educação, adicionar placeholder
  if (resumeData.education.length === 0) {
    resumeData.education.push({
      institution: "Instituição de Ensino",
      degree: "Grau Acadêmico",
      field: "Área de Estudo",
      period: {
        start: "2015-01",
        end: "2019-12"
      }
    });
  }
  
  // Extrair habilidades
  const skillsSection = extractSection(text, [
    'habilidades', 'competências', 'skills', 
    'conhecimentos', 'qualificações'
  ]);
  
  if (skillsSection) {
    const skills = extractSkills(skillsSection);
    
    resumeData.skills.technical = skills.technical.length > 0 
      ? skills.technical 
      : [
          { name: "Habilidade Técnica 1", level: "avançado" },
          { name: "Habilidade Técnica 2", level: "intermediário" }
        ];
        
    resumeData.skills.interpersonal = skills.interpersonal.length > 0
      ? skills.interpersonal
      : [
          { name: "Comunicação", level: "avançado" },
          { name: "Trabalho em Equipe", level: "avançado" }
        ];
        
    resumeData.skills.tools = skills.tools.length > 0
      ? skills.tools
      : [
          { name: "Microsoft Office", level: "avançado" },
          { name: "Ferramenta Relevante", level: "intermediário" }
        ];
  } else {
    // Habilidades padrão
    resumeData.skills.technical = [
      { name: "Habilidade Técnica 1", level: "avançado" },
      { name: "Habilidade Técnica 2", level: "intermediário" }
    ];
    resumeData.skills.interpersonal = [
      { name: "Comunicação", level: "avançado" },
      { name: "Trabalho em Equipe", level: "avançado" }
    ];
    resumeData.skills.tools = [
      { name: "Microsoft Office", level: "avançado" }
    ];
  }
  
  // Extrair idiomas
  const languagesSection = extractSection(text, [
    'idiomas', 'línguas', 'languages', 
    'conhecimentos linguísticos'
  ]);
  
  if (languagesSection) {
    const languages = extractLanguages(languagesSection);
    if (languages.length > 0) {
      resumeData.languages = languages;
    }
  }
  
  // Se não encontramos idiomas, adicionar padrão
  if (resumeData.languages.length === 0) {
    resumeData.languages = [
      { name: "Português", level: "nativo" },
      { name: "Inglês", level: "intermediário" }
    ];
  }
  
  // Extrair certificações
  const certificationsSection = extractSection(text, [
    'certificações', 'certificados', 'cursos', 
    'certifications', 'qualificações adicionais'
  ]);
  
  if (certificationsSection) {
    const certifications = extractCertifications(certificationsSection);
    if (certifications.length > 0) {
      resumeData.certifications = certifications;
    }
  }
  
  console.log('Análise local concluída com sucesso');
  return resumeData;
};

/**
 * Extrai uma seção específica do texto do currículo
 */
export const extractSection = (text: string, sectionHeaders: string[]): string | null => {
  // Converter para minúsculas para facilitar a busca
  const lowerText = text.toLowerCase();
  
  let startIndex = -1;
  let endIndex = text.length;
  let matchedHeader = '';
  
  // Encontrar o início da seção
  for (const header of sectionHeaders) {
    const headerIndex = lowerText.indexOf(header);
    if (headerIndex !== -1 && (startIndex === -1 || headerIndex < startIndex)) {
      startIndex = headerIndex;
      matchedHeader = header;
    }
  }
  
  if (startIndex === -1) {
    return null; // Seção não encontrada
  }
  
  // Avançar até o fim do cabeçalho (próxima quebra de linha)
  const headerEndIndex = lowerText.indexOf('\n', startIndex);
  if (headerEndIndex !== -1) {
    startIndex = headerEndIndex + 1;
  } else {
    startIndex = startIndex + matchedHeader.length;
  }
  
  // Procurar pelo próximo cabeçalho comum em currículos
  const nextSectionHeaders = [
    'experiência', 'experiências', 'formação', 'educação', 
    'habilidades', 'competências', 'idiomas', 'línguas',
    'certificações', 'cursos', 'referências', 'objetivo',
    'perfil', 'resumo', 'informações pessoais', 'contato'
  ];
  
  for (const header of nextSectionHeaders) {
    // Ignora o cabeçalho atual para não confundir com ele mesmo
    if (header === matchedHeader.toLowerCase()) continue;
    
    // Procura pela próxima ocorrência após o início da seção atual
    const headerIndex = lowerText.indexOf(header, startIndex);
    if (headerIndex !== -1 && headerIndex < endIndex) {
      // Verifica se é um cabeçalho real (precedido por quebra de linha ou no início)
      const isHeader = headerIndex === 0 || 
                       lowerText.charAt(headerIndex - 1) === '\n' ||
                       lowerText.charAt(headerIndex - 1) === ':';
                       
      if (isHeader) {
        endIndex = headerIndex;
      }
    }
  }
  
  // Extrair a seção
  const sectionText = text.substring(startIndex, endIndex).trim();
  return sectionText.length > 0 ? sectionText : null;
};

/**
 * Detecção de nome a partir do texto completo
 */
function detectName(text: string): string | null {
  // Estratégia 1: Procurar por padrões como "Nome: João Silva" ou "JOÃO SILVA" no início
  const namePattern1 = /^(?:.*?Nome\s*:?\s*)([\w\s]+)(?:\n|$)/i;
  const namePattern2 = /^([A-Z\s]{2,30})(?:\n|$)/;
  
  const match1 = text.match(namePattern1);
  if (match1 && match1[1]) {
    return match1[1].trim();
  }
  
  const match2 = text.match(namePattern2);
  if (match2 && match2[1]) {
    return match2[1].trim();
  }
  
  // Estratégia 2: Primeira linha como nome
  const firstLine = text.split('\n')[0].trim();
  if (firstLine && firstLine.length < 50 && /^[A-Za-z\s]+$/.test(firstLine)) {
    return firstLine;
  }
  
  return null;
}

/**
 * Detecção de email no texto
 */
function detectEmail(text: string): string | null {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

/**
 * Detecção de telefone no texto
 */
function detectPhone(text: string): string | null {
  // Padrões brasileiros comuns de telefone
  const phonePatterns = [
    /\(\d{2}\)\s*\d{4,5}[-.\s]?\d{4}/,           // (11) 99999-9999
    /\(\d{2}\)\s*\d{8,9}/,                       // (11) 999999999
    /\d{2}[-.\s]?\d{4,5}[-.\s]?\d{4}/,           // 11 99999-9999
    /\+\d{1,3}\s*\(\d{2}\)\s*\d{4,5}[-.\s]?\d{4}/ // +55 (11) 99999-9999
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

/**
 * Detecção de localização no texto
 */
function detectLocation(text: string): string | null {
  // Principais cidades brasileiras e estados
  const locationKeywords = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 
    'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 
    'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'SP', 'RJ', 
    'DF', 'BA', 'CE', 'MG', 'AM', 'PR', 'PE', 'RS'
  ];
  
  // Padrões de localização
  const locationPatterns = [
    new RegExp(`Endereço\\s*:?\\s*([^\\n]+${locationKeywords.join('|')}[^\\n]+)`, 'i'),
    new RegExp(`Localidade\\s*:?\\s*([^\\n]+${locationKeywords.join('|')}[^\\n]+)`, 'i'),
    new RegExp(`Local\\s*:?\\s*([^\\n]+${locationKeywords.join('|')}[^\\n]+)`, 'i'),
    new RegExp(`Cidade\\s*:?\\s*([^\\n]+)`, 'i'),
    new RegExp(`(${locationKeywords.join('|')})(?:[,-]\\s*\\w+)?`, 'i')
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  
  return null;
}

/**
 * Extração de itens de experiência profissional
 */
function extractExperienceItems(text: string): Array<{
  company: string;
  role: string;
  period: { start: string; end: string | 'present' };
  description: string;
  achievements: string[];
}> {
  const items = [];
  
  // Padrões para identificar itens de experiência
  const experienceItemPatterns = [
    // Empresa - Cargo (Período)
    /([A-Za-z\s&.]+)[\s\-–—]+([A-Za-z\s&.]+)[\s\-–—]+(?:\(|\[)?(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4})(?:\s*(?:-|–|—|a|até|to)\s*)(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4}|presente|present|atual|current|atualmente|currently)(?:\)|\])?/gi,
    
    // Empresa (Período) Cargo
    /([A-Za-z\s&.]+)(?:\(|\[)?(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4})(?:\s*(?:-|–|—|a|até|to)\s*)(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4}|presente|present|atual|current|atualmente|currently)(?:\)|\])?[\s\-–—]+([A-Za-z\s&.]+)/gi,
    
    // Padrões alternativos...
  ];
  
  // Separar em parágrafos ou seções que parecem ser itens independentes
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // Se o parágrafo for muito curto, ignorar
    if (paragraph.trim().length < 20) continue;
    
    let company = '', role = '', startDate = '', endDate = '';
    let description = paragraph.trim();
    
    // Tentar extrair usando padrões específicos
    for (const pattern of experienceItemPatterns) {
      pattern.lastIndex = 0; // Reset regex state
      const match = pattern.exec(paragraph);
      
      if (match) {
        // A ordem dos grupos depende do padrão específico
        if (pattern.source.includes('([A-Za-z\\s&.]+)[\\s\\-–—]+([A-Za-z\\s&.]+)')) {
          // Primeiro padrão
          company = match[1].trim();
          role = match[2].trim();
          startDate = formatDate(match[3]);
          endDate = formatEndDate(match[4]);
        } else {
          // Segundo padrão
          company = match[1].trim();
          startDate = formatDate(match[2]);
          endDate = formatEndDate(match[3]);
          role = match[4].trim();
        }
        
        // Remover o texto correspondente ao match da descrição
        description = paragraph.replace(match[0], '').trim();
        break;
      }
    }
    
    // Se não conseguiu extrair os dados básicos, tentar abordagem mais simples
    if (!company || !role) {
      const lines = paragraph.split('\n');
      
      // Primeira linha como empresa/cargo
      if (lines.length >= 1) {
        const firstLine = lines[0].trim();
        
        // Tentar separar empresa e cargo
        const parts = firstLine.split(/\s+[-–—]\s+/);
        if (parts.length >= 2) {
          company = parts[0].trim();
          role = parts[1].trim();
        } else if (firstLine.length < 50) {
          // Se não conseguir separar, usar como empresa
          company = firstLine;
          // Tentar extrair cargo da segunda linha
          if (lines.length >= 2) {
            role = lines[1].trim();
          } else {
            role = "Cargo não especificado";
          }
        }
      }
      
      // Procurar por datas no texto
      const datePattern = /(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4})(?:\s*(?:-|–|—|a|até|to)\s*)(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4}|presente|present|atual|current|atualmente|currently)/i;
      const dateMatch = paragraph.match(datePattern);
      
      if (dateMatch) {
        startDate = formatDate(dateMatch[1]);
        endDate = formatEndDate(dateMatch[2]);
      }
    }
    
    // Se ainda não tiver conseguido extrair informações essenciais, ignorar
    if (!company) continue;
    
    // Valores padrão para campos não encontrados
    if (!role) role = "Cargo não especificado";
    if (!startDate) startDate = "2020-01"; // Valor padrão
    if (!endDate) endDate = "present";     // Valor padrão
    
    // Extrair conquistas/responsabilidades
    const achievements = extractAchievements(description);
    
    // Limitar tamanho da descrição
    if (description.length > 300) {
      description = description.substring(0, 297) + '...';
    }
    
    items.push({
      company,
      role,
      period: {
        start: startDate,
        end: endDate
      },
      description,
      achievements: achievements.length > 0 ? achievements : ["Responsabilidades e conquistas específicas serão listadas aqui."]
    });
  }
  
  return items;
}

/**
 * Extração de itens de educação
 */
function extractEducationItems(text: string): Array<{
  institution: string;
  degree: string;
  field: string;
  period: { start: string; end: string | 'present' };
}> {
  const items = [];
  
  // Dividir em parágrafos ou blocos
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // Se o parágrafo for muito curto, ignorar
    if (paragraph.trim().length < 15) continue;
    
    const lines = paragraph.split('\n');
    let institution = '', degree = '', field = '', startDate = '', endDate = '';
    
    // Tentar extrair instituição de ensino (normalmente na primeira linha)
    if (lines.length >= 1) {
      institution = lines[0].trim();
      
      // Se a linha contiver hífen, pode estar separando instituição e curso
      const parts = institution.split(/\s+[-–—]\s+/);
      if (parts.length >= 2) {
        institution = parts[0].trim();
        field = parts[1].trim();
      }
    }
    
    // Procurar por grau acadêmico em todo o texto
    const degreeKeywords = [
      'Bacharelado', 'Bacharel', 'Licenciatura', 'Graduação', 'Mestrado', 
      'Doutorado', 'MBA', 'Pós-Graduação', 'Pós-Doutorado', 'Técnico', 
      'Tecnólogo', 'Especialização', 'Ensino Médio', 'Ensino Fundamental'
    ];
    
    const degreePattern = new RegExp(`(${degreeKeywords.join('|')})\\s+(?:em|na área de|no curso de)?\\s+([^\\n,]+)`, 'i');
    const degreeMatch = paragraph.match(degreePattern);
    
    if (degreeMatch) {
      degree = degreeMatch[1].trim();
      if (degreeMatch[2] && !field) {
        field = degreeMatch[2].trim();
      }
    } else {
      // Se não encontrar um padrão específico, tentar a segunda linha
      if (lines.length >= 2 && !field) {
        // Verificar se a segunda linha parece ser um curso
        if (lines[1].length < 60 && !/^\d+/.test(lines[1])) {
          field = lines[1].trim();
        }
      }
    }
    
    // Procurar por datas no texto
    const datePattern = /(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4})(?:\s*(?:-|–|—|a|até|to)\s*)(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4}|presente|present|atual|current|atualmente|currently)/i;
    const dateMatch = paragraph.match(datePattern);
    
    if (dateMatch) {
      startDate = formatDate(dateMatch[1]);
      endDate = formatEndDate(dateMatch[2]);
    }
    
    // Se não extraiu instituição, ignorar
    if (!institution) continue;
    
    // Valores padrão para campos não encontrados
    if (!degree) degree = "Graduação";  // Valor padrão
    if (!field) field = "Área não especificada";
    if (!startDate) startDate = "2015-01";  // Valor padrão
    if (!endDate) endDate = "2019-12";      // Valor padrão
    
    items.push({
      institution,
      degree,
      field,
      period: {
        start: startDate,
        end: endDate
      }
    });
  }
  
  return items;
}

/**
 * Extração de habilidades
 */
function extractSkills(text: string): {
  technical: Array<{ name: string; level: string }>;
  interpersonal: Array<{ name: string; level: string }>;
  tools: Array<{ name: string; level: string }>;
} {
  const technical = [];
  const interpersonal = [];
  const tools = [];
  
  // Lista de habilidades técnicas comuns
  const technicalKeywords = [
    'programação', 'desenvolvimento', 'análise', 'design', 'engenharia',
    'marketing', 'vendas', 'gestão', 'coordenação', 'contabilidade',
    'finanças', 'administração', 'jurídico', 'direito', 'medicina',
    'enfermagem', 'pesquisa', 'ensino', 'tradução', 'seo', 'sql',
    'python', 'java', 'javascript', 'html', 'css', 'php', 'c#', 'c++',
    'ruby', 'swift', 'kotlin', 'react', 'angular', 'vue', 'node'
  ];
  
  // Lista de habilidades interpessoais comuns
  const interpersonalKeywords = [
    'comunicação', 'liderança', 'trabalho em equipe', 'negociação',
    'resolução de conflitos', 'empatia', 'criatividade', 'adaptabilidade',
    'flexibilidade', 'proatividade', 'organização', 'planejamento',
    'gestão de tempo', 'resiliência', 'pensamento crítico', 'ética',
    'relacionamento interpessoal', 'atendimento ao cliente'
  ];
  
  // Lista de ferramentas comuns
  const toolsKeywords = [
    'word', 'excel', 'powerpoint', 'outlook', 'office', 'g suite',
    'photoshop', 'illustrator', 'indesign', 'figma', 'sketch',
    'adobe', 'sap', 'oracle', 'salesforce', 'jira', 'trello',
    'asana', 'slack', 'teams', 'zoom', 'git', 'github'
  ];
  
  // Dividir o texto em linhas ou itens separados por vírgulas
  const items = text
    .replace(/[;|]/g, ',')  // Substituir ponto-e-vírgula e pipe por vírgulas
    .split(/[,\n]/)         // Dividir por vírgulas ou quebras de linha
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // Processar cada item
  for (const item of items) {
    // Ignorar itens muito curtos ou muito longos
    if (item.length < 3 || item.length > 50) continue;
    
    // Extrair nome e nível da habilidade
    let skillName = item;
    let skillLevel = 'intermediário';  // Nível padrão
    
    // Procurar por indicadores de nível
    const levelRegex = /(básico|intermediário|avançado|especialista|fluente|nativo)$/i;
    const levelMatch = item.match(levelRegex);
    
    if (levelMatch) {
      // Se encontrou um nível, ajustar o nome da habilidade
      skillName = item.substring(0, levelMatch.index).trim();
      skillLevel = levelMatch[1].toLowerCase();
    } else {
      // Procurar por outros indicadores
      if (/(expert|avançad[oa]|proficiente)/i.test(item)) {
        skillLevel = 'avançado';
      } else if (/(básic[oa]|iniciante|beginner)/i.test(item)) {
        skillLevel = 'básico';
      }
    }
    
    // Determinar categoria da habilidade
    const lowerName = skillName.toLowerCase();
    
    if (toolsKeywords.some(keyword => lowerName.includes(keyword))) {
      tools.push({ name: capitalizeFirstLetter(skillName), level: skillLevel });
    } else if (interpersonalKeywords.some(keyword => lowerName.includes(keyword))) {
      interpersonal.push({ name: capitalizeFirstLetter(skillName), level: skillLevel });
    } else if (technicalKeywords.some(keyword => lowerName.includes(keyword))) {
      technical.push({ name: capitalizeFirstLetter(skillName), level: skillLevel });
    } else {
      // Se não for uma categoria específica, assumir técnica
      technical.push({ name: capitalizeFirstLetter(skillName), level: skillLevel });
    }
  }
  
  return { technical, interpersonal, tools };
}

/**
 * Extração de idiomas
 */
function extractLanguages(text: string): Array<{
  name: string;
  level: string;
}> {
  const languages = [];
  
  // Lista de idiomas comuns
  const commonLanguages = [
    'português', 'inglês', 'espanhol', 'francês', 'alemão', 
    'italiano', 'japonês', 'mandarim', 'chinês', 'russo',
    'árabe', 'hindi', 'coreano', 'holandês', 'sueco'
  ];
  
  // Procurar por menções a idiomas no texto
  for (const language of commonLanguages) {
    // Padrão para capturar "idioma - nível" ou similar
    const languagePattern = new RegExp(`${language}\\s*[-:.]?\\s*(básico|intermediário|avançado|fluente|nativo)`, 'i');
    const match = text.match(languagePattern);
    
    if (match) {
      languages.push({
        name: capitalizeFirstLetter(language),
        level: match[1].toLowerCase()
      });
    } else if (text.toLowerCase().includes(language)) {
      // Se menciona o idioma mas sem nível especificado
      languages.push({
        name: capitalizeFirstLetter(language),
        level: language === 'português' ? 'nativo' : 'intermediário'
      });
    }
  }
  
  return languages;
}

/**
 * Extração de certificações
 */
function extractCertifications(text: string): Array<{
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
}> {
  const certifications = [];
  
  // Dividir em linhas
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Ignorar linhas muito curtas
    if (line.trim().length < 10) continue;
    
    let name = line.trim();
    let issuer = '';
    let date = '';
    let expirationDate = undefined;
    
    // Procurar por emissor (após hífen, vírgula ou parenteses)
    const issuerPatterns = [
      /^(.*?)\s*[-–—]\s*(.+)$/,          // Nome - Emissor
      /^(.*?)\s*,\s*(.+)$/,               // Nome, Emissor
      /^(.*?)\s*\(\s*([^)]+)\s*\)/        // Nome (Emissor)
    ];
    
    for (const pattern of issuerPatterns) {
      const match = line.match(pattern);
      if (match) {
        name = match[1].trim();
        issuer = match[2].trim();
        break;
      }
    }
    
    // Procurar por data
    const datePattern = /\b(\d{2}\/\d{2,4}|\d{2}\.\d{2,4}|\d{2}-\d{2,4}|\d{4})\b/;
    const dateMatches = [...line.matchAll(datePattern)];
    
    if (dateMatches.length >= 1) {
      date = formatDate(dateMatches[0][1]);
      
      // Se tiver duas datas, a segunda pode ser a expiração
      if (dateMatches.length >= 2) {
        expirationDate = formatDate(dateMatches[1][1]);
      }
    }
    
    // Se não tiver emissor mas tiver uma organização conhecida na linha
    if (!issuer) {
      const knownIssuers = [
        'Microsoft', 'Google', 'AWS', 'Amazon', 'Oracle', 'IBM', 
        'Cisco', 'CompTIA', 'PMI', 'ITIL', 'Scrum', 'Udemy', 
        'Coursera', 'Alura', 'USP', 'FGV', 'Senai', 'Senac'
      ];
      
      for (const knownIssuer of knownIssuers) {
        if (line.includes(knownIssuer)) {
          issuer = knownIssuer;
          // Remover emissor do nome se for parte dele
          name = name.replace(knownIssuer, '').trim();
          // Limpar caracteres extras do nome
          name = name.replace(/^[-:,.;()\s]+|[-:,.;()\s]+$/g, '');
          break;
        }
      }
    }
    
    // Se ainda não tiver emissor
    if (!issuer) {
      issuer = "Não especificado";
    }
    
    // Se não tiver data
    if (!date) {
      date = "2020-01"; // Data padrão
    }
    
    certifications.push({
      name,
      issuer,
      date,
      ...(expirationDate && { expirationDate })
    });
  }
  
  return certifications;
}

/**
 * Extrair conquistas/responsabilidades de texto descritivo
 */
function extractAchievements(text: string): string[] {
  const achievements = [];
  
  // Dividir por marcadores ou pontos finais
  const items = text
    .split(/(?:\n+|•|\*|\-|–|—|\d+\.\s)/)
    .map(item => item.trim())
    .filter(item => item.length > 10 && item.length < 200);
  
  // Limitar ao máximo de 5 conquistas
  for (let i = 0; i < Math.min(items.length, 5); i++) {
    // Garantir que cada item termine com ponto
    let item = items[i];
    if (!item.endsWith('.')) item += '.';
    
    // Iniciar com letra maiúscula
    item = capitalizeFirstLetter(item);
    
    achievements.push(item);
  }
  
  return achievements;
}

/**
 * Formata data para o formato YYYY-MM
 */
function formatDate(dateStr: string): string {
  // Limpar a string
  dateStr = dateStr.trim();
  
  // Verificar se é só o ano
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01`;  // Janeiro por padrão
  }
  
  // Formatos comuns: MM/YYYY, MM-YYYY, MM.YYYY
  const patterns = [
    /^(\d{2})\/(\d{4})$/,  // MM/YYYY
    /^(\d{2})\/(\d{2})$/,  // MM/YY
    /^(\d{2})-(\d{4})$/,   // MM-YYYY
    /^(\d{2})-(\d{2})$/,   // MM-YY
    /^(\d{2})\.(\d{4})$/,  // MM.YYYY
    /^(\d{2})\.(\d{2})$/   // MM.YY
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      const month = match[1];
      let year = match[2];
      
      // Se o ano tem apenas 2 dígitos, ajustar
      if (year.length === 2) {
        // Assume que anos 00-49 são 2000-2049, e 50-99 são 1950-1999
        const twoDigitYear = parseInt(year, 10);
        year = (twoDigitYear < 50 ? '20' : '19') + year;
      }
      
      return `${year}-${month}`;
    }
  }
  
  // Se chegou aqui, não conseguiu formatar, retornar formato padrão
  return '2020-01';
}

/**
 * Formata data de término, tratando casos especiais como "presente"
 */
function formatEndDate(dateStr: string): string | 'present' {
  // Verificar se é data no formato "presente" ou similar
  const presentTerms = ['presente', 'present', 'atual', 'current', 'atualmente', 'currently'];
  
  if (presentTerms.some(term => dateStr.toLowerCase().includes(term))) {
    return 'present';
  }
  
  // Caso contrário, formatar como data normal
  return formatDate(dateStr);
}

/**
 * Função auxiliar para capitalizar primeira letra
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Verifica se o texto parece um currículo
 */
export const looksLikeResume = (text: string): boolean => {
  // Verificar comprimento mínimo
  if (!text || text.length < 200) return false;
  
  // Palavras-chave específicas de currículos
  const resumeKeywords = [
    'currículo', 'curriculum', 'vitae', 'cv', 'resume',
    'experiência', 'experience', 'profissional', 'professional',
    'formação', 'education', 'educação', 'acadêmico', 'academic',
    'habilidades', 'skills', 'competências', 'qualificações',
    'idiomas', 'languages', 'referências', 'references'
  ];
  
  // Contar quantas palavras-chave estão presentes
  const lowerText = text.toLowerCase();
  const keywordsPresent = resumeKeywords.filter(keyword => 
    lowerText.includes(keyword)
  );
  
  // Se tiver pelo menos 3 palavras-chave, provavelmente é um currículo
  if (keywordsPresent.length >= 3) return true;
  
  // Verificar por padrões de estrutura de currículo
  // (seções, experiências, formação, etc.)
  const hasExperienceSection = extractSection(text, ['experiência', 'experiência profissional']) !== null;
  const hasEducationSection = extractSection(text, ['educação', 'formação']) !== null;
  const hasContactInfo = detectEmail(text) !== null || detectPhone(text) !== null;
  
  // Se tiver pelo menos 2 dos 3 padrões, provavelmente é um currículo
  let patternCount = 0;
  if (hasExperienceSection) patternCount++;
  if (hasEducationSection) patternCount++;
  if (hasContactInfo) patternCount++;
  
  return patternCount >= 2;
};

/**
 * Cria dados básicos do currículo quando não é possível extrair
 */
export const createBasicResumeData = (name?: string, email?: string): ResumeData => {
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
        start: "2020-01",
        end: "present"
      },
      description: "Após a análise completa, você terá acesso aos detalhes do seu currículo nesta seção.",
      achievements: ["As suas principais conquistas e responsabilidades serão listadas aqui."]
    }],
    education: [{
      institution: "Sua instituição de ensino",
      degree: "Seu grau acadêmico",
      field: "Sua área de formação",
      period: {
        start: "2015-01",
        end: "2019-12"
      }
    }],
    skills: {
      technical: [
        { name: "Habilidade Técnica 1", level: "avançado" },
        { name: "Habilidade Técnica 2", level: "intermediário" }
      ],
      interpersonal: [
        { name: "Comunicação", level: "avançado" },
        { name: "Trabalho em Equipe", level: "avançado" }
      ],
      tools: [
        { name: "Microsoft Office", level: "avançado" }
      ]
    },
    certifications: [{
      name: "Certificação Profissional",
      issuer: "Entidade Emissora",
      date: "2019-06"
    }],
    languages: [
      { name: "Português", level: "nativo" },
      { name: "Inglês", level: "intermediário" }
    ]
  };
};