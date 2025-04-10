import React, { useState, useEffect } from 'react';
import { Loader2, Edit, Eye, Code, CheckCircle2, Download } from 'lucide-react';
import { ResumeData } from '../lib/resume-ai';
import { generatePDF } from '../utils/pdfGenerator';

interface ResumePreviewProps {
  resumeData: ResumeData;
  style: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    style: 'modern' | 'classic' | 'creative' | 'minimal' | 'tech';
  };
  isLoading?: boolean;
  isInteractive?: boolean;
  onDataChange?: (updatedData: ResumeData) => void;
  onDownload?: (format: 'pdf' | 'html') => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  resumeData, 
  style, 
  isLoading = false,
  isInteractive = false,
  onDataChange,
  onDownload
}) => {
  const [currentView, setCurrentView] = useState<'preview' | 'code'>('preview');
  const [editableData, setEditableData] = useState<ResumeData>(resumeData);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Atualizar dados editáveis quando os dados externos mudarem
  useEffect(() => {
    setEditableData(resumeData);
  }, [resumeData]);
  
  // Gerar HTML simples para previsualização
  const generateSimpleHTML = () => {
    const data = isEditing ? editableData : resumeData;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Currículo de ${data.personalInfo.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    body {
      background-color: #f5f5f5;
      color: ${style.colors.text};
      font-size: 14px;
      line-height: 1.6;
    }
    .resume {
      max-width: 800px;
      margin: 0 auto;
      background-color: ${style.colors.background};
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    header {
      background-color: ${style.colors.primary};
      color: ${style.colors.secondary};
      padding: 30px;
    }
    .content {
      padding: 30px;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 5px;
    }
    h2 {
      font-size: 22px;
      margin: 25px 0 15px;
      color: ${style.colors.primary};
      border-bottom: 2px solid ${style.colors.accent};
      padding-bottom: 5px;
    }
    h3 {
      font-size: 18px;
      margin-bottom: 5px;
    }
    p {
      margin-bottom: 10px;
    }
    .contact-info {
      margin-top: 10px;
    }
    .section {
      margin-bottom: 25px;
    }
    .experience-item, .education-item {
      margin-bottom: 20px;
    }
    .company-period, .institution-period {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
      color: #666;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .skill-level {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      background-color: ${style.colors.accent}40;
      color: ${style.colors.primary};
    }
    .achievements {
      margin-top: 10px;
      padding-left: 20px;
    }
    .achievements li {
      margin-bottom: 5px;
    }
    .contact-info {
      line-height: 1.8;
    }
    @media print {
      body {
        background-color: white;
      }
      .resume {
        box-shadow: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <header>
      <h1>${data.personalInfo.name}</h1>
      <div class="contact-info">
        ${data.personalInfo.contact.email ? `<div>Email: ${data.personalInfo.contact.email}</div>` : ''}
        ${data.personalInfo.contact.phone ? `<div>Telefone: ${data.personalInfo.contact.phone}</div>` : ''}
        ${data.personalInfo.contact.location ? `<div>Localização: ${data.personalInfo.contact.location}</div>` : ''}
      </div>
    </header>
    
    <div class="content">
      <!-- Experiência Profissional -->
      <section class="section">
        <h2>Experiência Profissional</h2>
        ${data.experience.map(exp => `
          <div class="experience-item">
            <h3>${exp.role}</h3>
            <div class="company-period">
              <span>${exp.company}</span>
              <span>${formatPeriod(exp.period.start, exp.period.end)}</span>
            </div>
            <p>${exp.description}</p>
            ${exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>

      <!-- Educação -->
      <section class="section">
        <h2>Educação</h2>
        ${data.education.map(edu => `
          <div class="education-item">
            <h3>${edu.degree} em ${edu.field}</h3>
            <div class="institution-period">
              <span>${edu.institution}</span>
              <span>${formatPeriod(edu.period.start, edu.period.end)}</span>
            </div>
          </div>
        `).join('')}
      </section>

      <!-- Habilidades -->
      <section class="section">
        <h2>Habilidades</h2>
        <div class="skills-grid">
          <div>
            <h3>Técnicas</h3>
            ${data.skills.technical.map(skill => `
              <div class="skill-item">
                <span>${skill.name}</span>
                <span class="skill-level">${skill.level}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h3>Interpessoais</h3>
            ${data.skills.interpersonal.map(skill => `
              <div class="skill-item">
                <span>${skill.name}</span>
                <span class="skill-level">${skill.level}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Idiomas -->
      <section class="section">
        <h2>Idiomas</h2>
        ${data.languages.map(lang => `
          <div class="skill-item">
            <span>${lang.name}</span>
            <span class="skill-level">${lang.level}</span>
          </div>
        `).join('')}
      </section>
      
      <!-- Certificações (se houver) -->
      ${data.certifications && data.certifications.length > 0 ? `
        <section class="section">
          <h2>Certificações</h2>
          ${data.certifications.map(cert => `
            <div class="education-item">
              <h3>${cert.name}</h3>
              <div class="institution-period">
                <span>${cert.issuer}</span>
                <span>${formatDate(cert.date)}${cert.expirationDate ? ` - ${formatDate(cert.expirationDate)}` : ''}</span>
              </div>
            </div>
          `).join('')}
        </section>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
  };
  
  // Formatar período para exibição
  const formatPeriod = (start: string, end: string | 'present') => {
    const formatYearMonth = (yearMonth: string) => {
      const [year, month] = yearMonth.split('-');
      if (!month) return year;
      
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    };
    
    const startFormatted = formatYearMonth(start);
    const endFormatted = end === 'present' ? 'Atual' : formatYearMonth(end);
    
    return `${startFormatted} - ${endFormatted}`;
  };
  
  // Formatar data para exibição
  const formatDate = (date: string) => {
    if (!date || date.length < 7) return date;
    
    const [year, month] = date.split('-');
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  };
  
  // Atualizar um campo no modo de edição
  const handleFieldEdit = (
    section: string,
    field: string,
    value: string | any,
    index?: number,
    nestedField?: string
  ) => {
    setEditableData(prevData => {
      const newData = {...prevData};
      
      if (index !== undefined) {
        if (nestedField) {
          // Para campos aninhados como period.start
          newData[section][index][field][nestedField] = value;
        } else {
          // Para campos simples dentro de arrays
          newData[section][index][field] = value;
        }
      } else if (section === 'personalInfo' && field === 'contact') {
        // Para campos de contato
        newData.personalInfo.contact[nestedField] = value;
      } else if (nestedField) {
        // Para outros campos aninhados
        newData[section][field][nestedField] = value;
      } else {
        // Para campos simples
        newData[section][field] = value;
      }
      
      return newData;
    });
  };
  
  // Salvar alterações feitas no modo de edição
  const handleSaveChanges = () => {
    if (onDataChange) {
      onDataChange(editableData);
    }
    setIsEditing(false);
  };
  
  // Cancelar edição e restaurar dados originais
  const handleCancelEdit = () => {
    setEditableData(resumeData);
    setIsEditing(false);
  };
  
  // Gerar e baixar PDF
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Gerar HTML final
      const html = generatedHTML || generateSimpleHTML();
      
      // Usar biblioteca pdfGenerator para converter HTML em PDF
      const pdfBlob = await generatePDF(isEditing ? editableData : resumeData, style);
      
      // Criar URL do blob e iniciar download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Curriculo_${resumeData.personalInfo.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Registrar download se handler fornecido
      if (onDownload) {
        onDownload('pdf');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Baixar HTML
  const handleDownloadHTML = () => {
    try {
      // Gerar HTML final
      const html = generatedHTML || generateSimpleHTML();
      
      // Criar blob e iniciar download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Curriculo_${resumeData.personalInfo.name.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Registrar download se handler fornecido
      if (onDownload) {
        onDownload('html');
      }
    } catch (error) {
      console.error('Erro ao gerar HTML:', error);
      alert('Erro ao gerar HTML. Por favor, tente novamente.');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Gerando prévia...</p>
        </div>
      </div>
    );
  }
  
  // Dados a serem usados na renderização
  const data = isEditing ? editableData : resumeData;
  
  return (
    <div className="resume-preview">
      {/* Controles de visualização */}
      {isInteractive && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('preview')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-sm ${
                currentView === 'preview' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Visualizar</span>
            </button>
            <button
              onClick={() => setCurrentView('code')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-sm ${
                currentView === 'code' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Código</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleDownloadHTML}
                  className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span>HTML</span>
                </button>
                {isInteractive && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-md text-sm bg-accent text-white hover:bg-accent/90 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Visualização do código */}
      {currentView === 'code' && (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[800px]">
          <pre className="text-sm">{generatedHTML || generateSimpleHTML()}</pre>
        </div>
      )}
      
      {/* Visualização do currículo */}
      {currentView === 'preview' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div 
            className="p-6"
            style={{ backgroundColor: style.colors.primary }}
          >
            {isEditing ? (
              <input
                type="text"
                value={data.personalInfo.name}
                onChange={(e) => handleFieldEdit('personalInfo', 'name', e.target.value)}
                className="text-2xl font-bold w-full bg-transparent border-b border-white/30 focus:outline-none focus:border-white text-white"
              />
            ) : (
              <h2 className="text-2xl font-bold" style={{ color: style.colors.background }}>
                {data.personalInfo.name}
              </h2>
            )}
            
            <div className="mt-2 space-y-1" style={{ color: style.colors.secondary }}>
              {isEditing ? (
                <>
                  <div className="flex items-center">
                    <span className="w-16 text-sm opacity-75">Email:</span>
                    <input
                      type="text"
                      value={data.personalInfo.contact.email}
                      onChange={(e) => handleFieldEdit('personalInfo', 'contact', e.target.value, undefined, 'email')}
                      className="flex-1 bg-transparent border-b border-white/30 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm opacity-75">Telefone:</span>
                    <input
                      type="text"
                      value={data.personalInfo.contact.phone || ''}
                      onChange={(e) => handleFieldEdit('personalInfo', 'contact', e.target.value, undefined, 'phone')}
                      className="flex-1 bg-transparent border-b border-white/30 focus:outline-none focus:border-white"
                      placeholder="Adicionar telefone"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm opacity-75">Local:</span>
                    <input
                      type="text"
                      value={data.personalInfo.contact.location || ''}
                      onChange={(e) => handleFieldEdit('personalInfo', 'contact', e.target.value, undefined, 'location')}
                      className="flex-1 bg-transparent border-b border-white/30 focus:outline-none focus:border-white"
                      placeholder="Adicionar localização"
                    />
                  </div>
                </>
              ) : (
                <>
                  {data.personalInfo.contact.email && (
                    <p>{data.personalInfo.contact.email}</p>
                  )}
                  {data.personalInfo.contact.phone && (
                    <p>{data.personalInfo.contact.phone}</p>
                  )}
                  {data.personalInfo.contact.location && (
                    <p>{data.personalInfo.contact.location}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Experience */}
            <section>
              <h3 className="text-lg font-semibold mb-4" style={{ color: style.colors.primary }}>
                Experiência Profissional
              </h3>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 pl-4 py-1" style={{ borderColor: style.colors.accent }}>
                    {isEditing ? (
                      <>
                        <input 
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleFieldEdit('experience', 'role', e.target.value, index)}
                          className="font-medium w-full border-b border-gray-300 focus:border-accent focus:outline-none"
                        />
                        <div className="flex items-center gap-4 mt-1">
                          <input 
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleFieldEdit('experience', 'company', e.target.value, index)}
                            className="text-sm text-gray-600 flex-1 border-b border-gray-300 focus:border-accent focus:outline-none"
                          />
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <input 
                              type="text"
                              value={exp.period.start}
                              onChange={(e) => handleFieldEdit('experience', 'period', e.target.value, index, 'start')}
                              className="w-16 border-b border-gray-300 focus:border-accent focus:outline-none text-center"
                            />
                            <span>-</span>
                            <input 
                              type="text"
                              value={exp.period.end === 'present' ? 'present' : exp.period.end}
                              onChange={(e) => handleFieldEdit('experience', 'period', e.target.value, index, 'end')}
                              className="w-16 border-b border-gray-300 focus:border-accent focus:outline-none text-center"
                            />
                          </div>
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleFieldEdit('experience', 'description', e.target.value, index)}
                          className="mt-2 w-full border border-gray-300 rounded p-2 focus:border-accent focus:outline-none text-sm"
                          rows={2}
                        />
                        <div className="mt-2">
                          <p className="text-sm font-medium">Conquistas:</p>
                          {exp.achievements.map((achievement, achIndex) => (
                            <div key={achIndex} className="flex items-center mt-1">
                              <span className="mr-2 text-accent">•</span>
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => {
                                  const newAchievements = [...exp.achievements];
                                  newAchievements[achIndex] = e.target.value;
                                  handleFieldEdit('experience', 'achievements', newAchievements, index);
                                }}
                                className="flex-1 text-sm border-b border-gray-300 focus:border-accent focus:outline-none"
                              />
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newAchievements = [...exp.achievements, ''];
                              handleFieldEdit('experience', 'achievements', newAchievements, index);
                            }}
                            className="text-sm text-accent mt-2 hover:underline"
                          >
                            + Adicionar conquista
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium">{exp.role}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {formatPeriod(exp.period.start, exp.period.end)}
                        </p>
                        <p className="mt-2">{exp.description}</p>
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx} className="text-sm">{achievement}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    onClick={() => {
                      const newExperience = {
                        company: "Nova Empresa",
                        role: "Novo Cargo",
                        period: {
                          start: "2023-01",
                          end: "present"
                        },
                        description: "Descrição da função",
                        achievements: ["Nova conquista"]
                      };
                      setEditableData(prev => ({
                        ...prev,
                        experience: [...prev.experience, newExperience]
                      }));
                    }}
                    className="mt-4 text-accent hover:underline flex items-center gap-1"
                  >
                    <span>+ Adicionar experiência</span>
                  </button>
                )}
              </div>
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-lg font-semibold mb-4" style={{ color: style.colors.primary }}>
                Habilidades
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Técnicas</h4>
                  <ul className="space-y-2">
                    {data.skills.technical.map((skill, index) => (
                      <li key={index} className="flex items-center justify-between">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => {
                                const newSkills = [...data.skills.technical];
                                newSkills[index].name = e.target.value;
                                handleFieldEdit('skills', 'technical', newSkills);
                              }}
                              className="flex-1 border-b border-gray-300 focus:border-accent focus:outline-none mr-2"
                            />
                            <select
                              value={skill.level}
                              onChange={(e) => {
                                const newSkills = [...data.skills.technical];
                                newSkills[index].level = e.target.value;
                                handleFieldEdit('skills', 'technical', newSkills);
                              }}
                              className="text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                            >
                              <option value="básico">Básico</option>
                              <option value="intermediário">Intermediário</option>
                              <option value="avançado">Avançado</option>
                              <option value="especialista">Especialista</option>
                            </select>
                          </>
                        ) : (
                          <>
                            <span>{skill.name}</span>
                            <span className="text-sm text-gray-600">{skill.level}</span>
                          </>
                        )}
                      </li>
                    ))}
                    
                    {isEditing && (
                      <button
                        onClick={() => {
                          const newSkill = { name: "Nova habilidade", level: "intermediário" };
                          setEditableData(prev => ({
                            ...prev,
                            skills: {
                              ...prev.skills,
                              technical: [...prev.skills.technical, newSkill]
                            }
                          }));
                        }}
                        className="text-sm text-accent hover:underline"
                      >
                        + Adicionar habilidade técnica
                      </button>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interpessoais</h4>
                  <ul className="space-y-2">
                    {data.skills.interpersonal.map((skill, index) => (
                      <li key={index} className="flex items-center justify-between">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => {
                                const newSkills = [...data.skills.interpersonal];
                                newSkills[index].name = e.target.value;
                                handleFieldEdit('skills', 'interpersonal', newSkills);
                              }}
                              className="flex-1 border-b border-gray-300 focus:border-accent focus:outline-none mr-2"
                            />
                            <select
                              value={skill.level}
                              onChange={(e) => {
                                const newSkills = [...data.skills.interpersonal];
                                newSkills[index].level = e.target.value;
                                handleFieldEdit('skills', 'interpersonal', newSkills);
                              }}
                              className="text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                            >
                              <option value="básico">Básico</option>
                              <option value="intermediário">Intermediário</option>
                              <option value="avançado">Avançado</option>
                              <option value="especialista">Especialista</option>
                            </select>
                          </>
                        ) : (
                          <>
                            <span>{skill.name}</span>
                            <span className="text-sm text-gray-600">{skill.level}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h3 className="text-lg font-semibold mb-4" style={{ color: style.colors.primary }}>
                Educação
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="border-l-2 pl-4 py-1" style={{ borderColor: style.colors.accent }}>
                    {isEditing ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleFieldEdit('education', 'degree', e.target.value, index)}
                            className="font-medium flex-1 border-b border-gray-300 focus:border-accent focus:outline-none"
                            placeholder="Grau"
                          />
                          <span className="self-center">em</span>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => handleFieldEdit('education', 'field', e.target.value, index)}
                            className="font-medium flex-1 border-b border-gray-300 focus:border-accent focus:outline-none"
                            placeholder="Área"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleFieldEdit('education', 'institution', e.target.value, index)}
                            className="text-sm text-gray-600 flex-1 border-b border-gray-300 focus:border-accent focus:outline-none"
                            placeholder="Instituição"
                          />
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <input 
                              type="text"
                              value={edu.period.start}
                              onChange={(e) => handleFieldEdit('education', 'period', e.target.value, index, 'start')}
                              className="w-16 border-b border-gray-300 focus:border-accent focus:outline-none text-center"
                            />
                            <span>-</span>
                            <input 
                              type="text"
                              value={edu.period.end === 'present' ? 'present' : edu.period.end}
                              onChange={(e) => handleFieldEdit('education', 'period', e.target.value, index, 'end')}
                              className="w-16 border-b border-gray-300 focus:border-accent focus:outline-none text-center"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium">{edu.degree} em {edu.field}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {formatPeriod(edu.period.start, edu.period.end)}
                        </p>
                      </>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    onClick={() => {
                      const newEducation = {
                        institution: "Nova Instituição",
                        degree: "Curso",
                        field: "Área de Estudo",
                        period: {
                          start: "2020-01",
                          end: "2023-12"
                        }
                      };
                      setEditableData(prev => ({
                        ...prev,
                        education: [...prev.education, newEducation]
                      }));
                    }}
                    className="mt-4 text-accent hover:underline flex items-center gap-1"
                  >
                    <span>+ Adicionar formação</span>
                  </button>
                )}
              </div>
            </section>
            
            {/* Languages */}
            <section>
              <h3 className="text-lg font-semibold mb-4" style={{ color: style.colors.primary }}>
                Idiomas
              </h3>
              <div className="space-y-2">
                {data.languages.map((language, index) => (
                  <div key={index} className="flex items-center justify-between">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={language.name}
                          onChange={(e) => {
                            const newLanguages = [...data.languages];
                            newLanguages[index].name = e.target.value;
                            handleFieldEdit('languages', '', newLanguages);
                          }}
                          className="flex-1 border-b border-gray-300 focus:border-accent focus:outline-none mr-2"
                        />
                        <select
                          value={language.level}
                          onChange={(e) => {
                            const newLanguages = [...data.languages];
                            newLanguages[index].level = e.target.value;
                            handleFieldEdit('languages', '', newLanguages);
                          }}
                          className="text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                        >
                          <option value="básico">Básico</option>
                          <option value="intermediário">Intermediário</option>
                          <option value="avançado">Avançado</option>
                          <option value="fluente">Fluente</option>
                          <option value="nativo">Nativo</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <span>{language.name}</span>
                        <span className="text-sm text-gray-600">{language.level}</span>
                      </>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    onClick={() => {
                      const newLanguage = { name: "Novo Idioma", level: "intermediário" };
                      setEditableData(prev => ({
                        ...prev,
                        languages: [...prev.languages, newLanguage]
                      }));
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    + Adicionar idioma
                  </button>
                )}
              </div>
            </section>
            
            {/* Certifications (if available) */}
            {(data.certifications && data.certifications.length > 0) && (
              <section>
                <h3 className="text-lg font-semibold mb-4" style={{ color: style.colors.primary }}>
                  Certificações
                </h3>
                <div className="space-y-4">
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="border-l-2 pl-4 py-1" style={{ borderColor: style.colors.accent }}>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleFieldEdit('certifications', 'name', e.target.value, index)}
                            className="font-medium w-full border-b border-gray-300 focus:border-accent focus:outline-none"
                          />
                          <div className="flex items-center justify-between mt-1">
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => handleFieldEdit('certifications', 'issuer', e.target.value, index)}
                              className="text-sm text-gray-600 flex-1 border-b border-gray-300 focus:border-accent focus:outline-none"
                            />
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) => handleFieldEdit('certifications', 'date', e.target.value, index)}
                              className="text-sm text-gray-500 w-24 border-b border-gray-300 focus:border-accent focus:outline-none text-center"
                              placeholder="YYYY-MM"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(cert.date)}
                            {cert.expirationDate && ` - ${formatDate(cert.expirationDate)}`}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newCertification = {
                          name: "Nova Certificação",
                          issuer: "Entidade Emissora",
                          date: "2023-01"
                        };
                        setEditableData(prev => ({
                          ...prev,
                          certifications: [...(prev.certifications || []), newCertification]
                        }));
                      }}
                      className="mt-4 text-accent hover:underline flex items-center gap-1"
                    >
                      <span>+ Adicionar certificação</span>
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;