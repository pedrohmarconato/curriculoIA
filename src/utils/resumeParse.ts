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
    objective: {
      summary: extractObjective(text) || "Profissional dedicado buscando aplicar minha experiência e conhecimentos em um ambiente desafiador."
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      interpersonal: [],
      tools: []
    },
    certifications: [],
    languages: [],
    marketExperience: {
      details: []
    }
  };