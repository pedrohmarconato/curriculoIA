import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Edit2, 
  AlertCircle,
  Info, 
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Award,
  Heart,
  Settings,
  Target,
  User,
  Loader2,
  Save
} from 'lucide-react';
import { ResumeData } from '../../lib/resume-ai';
import toast from 'react-hot-toast';

interface ResumeCategoriesProps {
  resumeData: ResumeData | null;
  isLoading: boolean;
  onUpdate: (category: string, data: any) => void;
  onComplete: () => void;
}

// Definir as 10 categorias de um currículo de sucesso
const CATEGORIES = [
  { 
    id: 'personalInfo', 
    name: 'Informações Pessoais', 
    icon: User,
    description: 'Seus dados de contato e informações básicas.'
  },
  { 
    id: 'objective', 
    name: 'Objetivo Profissional', 
    icon: Target,
    description: 'Uma declaração concisa sobre seus objetivos de carreira.' 
  },
  { 
    id: 'experience', 
    name: 'Experiência Profissional', 
    icon: Briefcase,
    description: 'Seu histórico de trabalho e realizações profissionais.' 
  },
  { 
    id: 'education', 
    name: 'Formação Acadêmica', 
    icon: GraduationCap,
    description: 'Sua educação formal e treinamentos relevantes.' 
  },
  { 
    id: 'skills', 
    name: 'Habilidades Técnicas', 
    icon: Code,
    description: 'Competências técnicas relevantes para sua área.' 
  },
  { 
    id: 'softSkills', 
    name: 'Habilidades Interpessoais', 
    icon: Heart,
    description: 'Soft skills e características pessoais valorizadas profissionalmente.' 
  },
  { 
    id: 'languages', 
    name: 'Idiomas', 
    icon: Languages,
    description: 'Idiomas que você domina e seu nível de proficiência.' 
  },
  { 
    id: 'certifications', 
    name: 'Certificações', 
    icon: Award,
    description: 'Certificados e credenciais profissionais relevantes.' 
  },
  { 
    id: 'toolsAndTech', 
    name: 'Ferramentas e Tecnologias', 
    icon: Settings,
    description: 'Ferramentas, software e tecnologias que você utiliza.' 
  },
  { 
    id: 'marketExperience', 
    name: 'Detalhes de Experiência', 
    icon: Info,
    description: 'Descrições detalhadas de suas experiências profissionais para uso em tooltips.' 
  }
];

const ResumeCategories: React.FC<ResumeCategoriesProps> = ({ resumeData, isLoading, onUpdate, onComplete }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('personalInfo');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [tempEditData, setTempEditData] = useState<any>(null);
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  // Atualizar dados temporários quando a categoria expandida muda
  useEffect(() => {
    if (expandedCategory && resumeData) {
      const categoryData = getCategoryData(expandedCategory);
      setTempEditData(categoryData);
    }
  }, [expandedCategory, resumeData]);

  // Verificar quais categorias estão completas e calcular progresso
  useEffect(() => {
    if (!resumeData) return;

    const completed = new Set<string>();
    
    // Verificar cada categoria
    CATEGORIES.forEach(category => {
      const categoryData = getCategoryData(category.id);
      if (isCategoryComplete(category.id, categoryData)) {
        completed.add(category.id);
      }
    });

    setCompletedCategories(completed);
    
    // Calcular progresso
    const completionPercentage = Math.round((completed.size / CATEGORIES.length) * 100);
    setProgress(completionPercentage);
  }, [resumeData]);

  // Obter dados de uma categoria específica
  const getCategoryData = (categoryId: string) => {
    if (!resumeData) return null;

    switch(categoryId) {
      case 'personalInfo':
        return resumeData.personalInfo;
      case 'experience':
        return resumeData.experience;
      case 'education':
        return resumeData.education;
      case 'skills':
        return resumeData.skills?.technical || [];
      case 'softSkills':
        return resumeData.skills?.interpersonal || [];
      case 'languages':
        return resumeData.languages;
      case 'certifications':
        return resumeData.certifications || [];
      case 'toolsAndTech':
        return resumeData.skills?.tools || [];
      case 'objective':
        return resumeData.objective || { summary: '' };
      case 'marketExperience':
        return resumeData.marketExperience || { details: [] };
      default:
        return null;
    }
  };

  // Verificar se uma categoria está completa
  const isCategoryComplete = (categoryId: string, categoryData: any): boolean => {
    if (!categoryData) return false;

    switch(categoryId) {
      case 'personalInfo':
        return !!categoryData.name && !!categoryData.contact?.email;
      case 'experience':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'education':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'skills':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'softSkills':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'languages':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'certifications':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'toolsAndTech':
        return Array.isArray(categoryData) && categoryData.length > 0;
      case 'objective':
        return !!categoryData.summary;
      case 'marketExperience':
        return Array.isArray(categoryData.details) && categoryData.details.length > 0;
      default:
        return false;
    }
  };

  // Alternar a expansão de uma categoria
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setEditMode(null);
  };

  // Ativar modo de edição para uma categoria
  const handleEditCategory = (categoryId: string) => {
    setEditMode(categoryId);
    setTempEditData(getCategoryData(categoryId));
  };

  // Salvar alterações de uma categoria
  const handleSaveCategory = (categoryId: string) => {
    if (!tempEditData) return;

    onUpdate(categoryId, tempEditData);
    setEditMode(null);
    
    // Adicionar à lista de categorias completas
    setCompletedCategories(prev => {
      const newSet = new Set(prev);
      if (isCategoryComplete(categoryId, tempEditData)) {
        newSet.add(categoryId);
      } else {
        newSet.delete(categoryId);
      }
      return newSet;
    });

    toast.success('Categoria atualizada com sucesso!');
  };

  // Renderizar formulário de edição com base na categoria
  const renderEditForm = (categoryId: string) => {
    if (!tempEditData) return null;

    switch(categoryId) {
      case 'personalInfo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={tempEditData.name || ''}
                onChange={(e) => setTempEditData({...tempEditData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={tempEditData.contact?.email || ''}
                onChange={(e) => setTempEditData({
                  ...tempEditData, 
                  contact: {...tempEditData.contact, email: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={tempEditData.contact?.phone || ''}
                onChange={(e) => setTempEditData({
                  ...tempEditData, 
                  contact: {...tempEditData.contact, phone: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input
                type="text"
                value={tempEditData.contact?.location || ''}
                onChange={(e) => setTempEditData({
                  ...tempEditData, 
                  contact: {...tempEditData.contact, location: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 'objective':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Profissional</label>
              <textarea
                value={tempEditData.summary || ''}
                onChange={(e) => setTempEditData({...tempEditData, summary: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva brevemente seus objetivos profissionais"
              />
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-6">
            {Array.isArray(tempEditData) && tempEditData.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Experiência {index + 1}</h4>
                  <button 
                    onClick={() => {
                      const newData = [...tempEditData];
                      newData.splice(index, 1);
                      setTempEditData(newData);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], company: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={exp.role || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], role: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {...newData[index], date: e.target.value};
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração (opcional)</label>
                    <input
                      type="text"
                      value={cert.expirationDate || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {...newData[index], expirationDate: e.target.value};
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setTempEditData([
                  ...(tempEditData || []),
                  { name: '', issuer: '', date: '', expirationDate: '' }
                ]);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Certificação
            </button>
          </div>
        );

      case 'marketExperience':
        return (
          <div className="space-y-6">
            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
              Esta categoria contém descrições detalhadas de suas experiências que serão usadas em tooltips e seções mais completas do currículo.
            </p>
            {tempEditData.details && tempEditData.details.map((detail, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Detalhe {index + 1}</h4>
                  <button 
                    onClick={() => {
                      const newData = {...tempEditData};
                      newData.details.splice(index, 1);
                      setTempEditData(newData);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={detail.company || ''}
                    onChange={(e) => {
                      const newData = {...tempEditData};
                      newData.details[index] = {...newData.details[index], company: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                  <textarea
                    value={detail.extendedDescription || ''}
                    onChange={(e) => {
                      const newData = {...tempEditData};
                      newData.details[index] = {...newData.details[index], extendedDescription: e.target.value};
                      setTempEditData(newData);
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Forneça detalhes aprofundados sobre esta experiência"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={detail.keywords || ''}
                    onChange={(e) => {
                      const newData = {...tempEditData};
                      newData.details[index] = {...newData.details[index], keywords: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tecnologia, liderança, gestão, etc."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newData = {...tempEditData};
                if (!newData.details) newData.details = [];
                newData.details.push({
                  company: '',
                  extendedDescription: '',
                  keywords: ''
                });
                setTempEditData(newData);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Detalhe
            </button>
          </div>
        );

      default:
        return <p>Formulário não disponível para esta categoria.</p>;
    }
  };gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="text"
                      value={exp.period?.start || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {
                          ...newData[index], 
                          period: {...newData[index].period, start: e.target.value}
                        };
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="text"
                      value={exp.period?.end || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {
                          ...newData[index], 
                          period: {...newData[index].period, end: e.target.value}
                        };
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM ou 'present'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], description: e.target.value};
                      setTempEditData(newData);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conquistas</label>
                  {exp.achievements && exp.achievements.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex mb-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => {
                          const newData = [...tempEditData];
                          const newAchievements = [...newData[index].achievements];
                          newAchievements[achIndex] = e.target.value;
                          newData[index] = {...newData[index], achievements: newAchievements};
                          setTempEditData(newData);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newData = [...tempEditData];
                          const newAchievements = [...newData[index].achievements];
                          newAchievements.splice(achIndex, 1);
                          newData[index] = {...newData[index], achievements: newAchievements};
                          setTempEditData(newData);
                        }}
                        className="ml-2 px-2 py-2 bg-red-50 text-red-600 rounded-md"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newData = [...tempEditData];
                      const newAchievements = [...(newData[index].achievements || []), ''];
                      newData[index] = {...newData[index], achievements: newAchievements};
                      setTempEditData(newData);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm"
                  >
                    + Adicionar Conquista
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setTempEditData([
                  ...(tempEditData || []),
                  {
                    company: '',
                    role: '',
                    period: { start: '', end: '' },
                    description: '',
                    achievements: ['']
                  }
                ]);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Experiência
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            {Array.isArray(tempEditData) && tempEditData.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Formação {index + 1}</h4>
                  <button 
                    onClick={() => {
                      const newData = [...tempEditData];
                      newData.splice(index, 1);
                      setTempEditData(newData);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], institution: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grau</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], degree: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <input
                    type="text"
                    value={edu.field || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], field: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="text"
                      value={edu.period?.start || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {
                          ...newData[index], 
                          period: {...newData[index].period, start: e.target.value}
                        };
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="text"
                      value={edu.period?.end || ''}
                      onChange={(e) => {
                        const newData = [...tempEditData];
                        newData[index] = {
                          ...newData[index], 
                          period: {...newData[index].period, end: e.target.value}
                        };
                        setTempEditData(newData);
                      }}
                      placeholder="AAAA-MM ou 'present'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setTempEditData([
                  ...(tempEditData || []),
                  {
                    institution: '',
                    degree: '',
                    field: '',
                    period: { start: '', end: '' }
                  }
                ]);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Formação
            </button>
          </div>
        );

      case 'skills':
      case 'softSkills':
      case 'toolsAndTech':
        return (
          <div className="space-y-6">
            {Array.isArray(tempEditData) && tempEditData.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={skill.name || ''}
                  onChange={(e) => {
                    const newData = [...tempEditData];
                    newData[index] = {...newData[index], name: e.target.value};
                    setTempEditData(newData);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome da habilidade"
                />
                <select
                  value={skill.level || 'intermediário'}
                  onChange={(e) => {
                    const newData = [...tempEditData];
                    newData[index] = {...newData[index], level: e.target.value};
                    setTempEditData(newData);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="básico">Básico</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                  <option value="especialista">Especialista</option>
                </select>
                <button
                  onClick={() => {
                    const newData = [...tempEditData];
                    newData.splice(index, 1);
                    setTempEditData(newData);
                  }}
                  className="px-2 py-2 bg-red-50 text-red-600 rounded-md"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setTempEditData([
                  ...(tempEditData || []),
                  { name: '', level: 'intermediário' }
                ]);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Habilidade
            </button>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-6">
            {Array.isArray(tempEditData) && tempEditData.map((lang, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={lang.name || ''}
                  onChange={(e) => {
                    const newData = [...tempEditData];
                    newData[index] = {...newData[index], name: e.target.value};
                    setTempEditData(newData);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do idioma"
                />
                <select
                  value={lang.level || 'intermediário'}
                  onChange={(e) => {
                    const newData = [...tempEditData];
                    newData[index] = {...newData[index], level: e.target.value};
                    setTempEditData(newData);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="básico">Básico</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                  <option value="fluente">Fluente</option>
                  <option value="nativo">Nativo</option>
                </select>
                <button
                  onClick={() => {
                    const newData = [...tempEditData];
                    newData.splice(index, 1);
                    setTempEditData(newData);
                  }}
                  className="px-2 py-2 bg-red-50 text-red-600 rounded-md"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setTempEditData([
                  ...(tempEditData || []),
                  { name: '', level: 'intermediário' }
                ]);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adicionar Idioma
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-6">
            {Array.isArray(tempEditData) && tempEditData.map((cert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Certificação {index + 1}</h4>
                  <button 
                    onClick={() => {
                      const newData = [...tempEditData];
                      newData.splice(index, 1);
                      setTempEditData(newData);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Certificação</label>
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], name: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                  <input
                    type="text"
                    value={cert.issuer || ''}
                    onChange={(e) => {
                      const newData = [...tempEditData];
                      newData[index] = {...newData[index], issuer: e.target.value};
                      setTempEditData(newData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2