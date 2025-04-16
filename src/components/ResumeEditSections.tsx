import React from 'react';
import { ResumeData } from '../lib/resume-ai';

interface ResumeEditSectionsProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeEditSections: React.FC<ResumeEditSectionsProps> = ({ resumeData, onChange }) => {
  // Handlers de edição simplificados (pode ser expandido para cada campo)
  const handleFieldChange = (section: string, field: string, value: any) => {
    const updated = { ...resumeData } as any;
    if (updated[section]) {
      updated[section][field] = value;
      onChange(updated);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho Profissional */}
      <section className="section">
        <h3 className="font-bold mb-2">Cabeçalho Profissional</h3>
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.name || ''}
          onChange={e => handleFieldChange('personalInfo', 'name', e.target.value)}
          placeholder="Nome completo"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo?.title || ''}
          onChange={e => handleFieldChange('personalInfo', 'title', e.target.value)}
          placeholder="Título profissional"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.contact?.email || ''}
          onChange={e => handleFieldChange('personalInfo', 'contact', { ...resumeData.personalInfo.contact, email: e.target.value })}
          placeholder="Email"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.contact?.phone || ''}
          onChange={e => handleFieldChange('personalInfo', 'contact', { ...resumeData.personalInfo.contact, phone: e.target.value })}
          placeholder="Telefone"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.contact?.linkedin || ''}
          onChange={e => handleFieldChange('personalInfo', 'contact', { ...resumeData.personalInfo.contact, linkedin: e.target.value })}
          placeholder="LinkedIn"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.contact?.location || ''}
          onChange={e => handleFieldChange('personalInfo', 'contact', { ...resumeData.personalInfo.contact, location: e.target.value })}
          placeholder="Localização"
        />
        <input
          className="input-field mb-2"
          value={resumeData.personalInfo.photoUrl || ''}
          onChange={e => handleFieldChange('personalInfo', 'photoUrl', e.target.value)}
          placeholder="URL da foto profissional (opcional)"
        />
      </section>
      {/* Resumo Profissional */}
      <section className="section">
        <h3 className="font-bold mb-2">Resumo Profissional</h3>
        <textarea
          className="input-field"
          rows={3}
          value={resumeData.professionalSummary?.summary || ''}
          onChange={e => handleFieldChange('professionalSummary', 'summary', e.target.value)}
          placeholder="Resumo de 3-5 linhas, conquistas e palavras-chave..."
        />
      </section>
      {/* Competências */}
      <section className="section">
        <h3 className="font-bold mb-2">Competências Técnicas e Comportamentais</h3>
        {/* Exemplo simplificado: só exibe arrays, edição avançada pode ser implementada depois */}
        <div>
          <label className="block font-semibold">Técnicas:</label>
          <input
            className="input-field mb-2"
            value={resumeData.skills.technical.map(s => s.name).join(', ')}
            onChange={e => handleFieldChange('skills', 'technical', e.target.value.split(',').map(name => ({ name: name.trim(), level: 'intermediário' })))}
            placeholder="Habilidades técnicas separadas por vírgula"
          />
          <label className="block font-semibold">Comportamentais:</label>
          <input
            className="input-field mb-2"
            value={resumeData.skills.interpersonal.map(s => s.name).join(', ')}
            onChange={e => handleFieldChange('skills', 'interpersonal', e.target.value.split(',').map(name => ({ name: name.trim(), level: 'intermediário' })))}
            placeholder="Soft skills separadas por vírgula"
          />
        </div>
      </section>
      {/* Experiência Profissional */}
      <section className="section">
        <h3 className="font-bold mb-2">Experiência Profissional</h3>
        {/* Exibição simplificada, edição detalhada pode ser expandida depois */}
        {resumeData.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <input
              className="input-field mb-1"
              value={exp.company}
              onChange={e => {
                const newExp = [...resumeData.experience];
                newExp[i] = { ...exp, company: e.target.value };
                onChange({ ...resumeData, experience: newExp });
              }}
              placeholder="Empresa"
            />
            <input
              className="input-field mb-1"
              value={exp.role}
              onChange={e => {
                const newExp = [...resumeData.experience];
                newExp[i] = { ...exp, role: e.target.value };
                onChange({ ...resumeData, experience: newExp });
              }}
              placeholder="Cargo"
            />
            <input
              className="input-field mb-1"
              value={exp.location || ''}
              onChange={e => {
                const newExp = [...resumeData.experience];
                newExp[i] = { ...exp, location: e.target.value };
                onChange({ ...resumeData, experience: newExp });
              }}
              placeholder="Localização"
            />
            <textarea
              className="input-field mb-1"
              rows={2}
              value={exp.description}
              onChange={e => {
                const newExp = [...resumeData.experience];
                newExp[i] = { ...exp, description: e.target.value };
                onChange({ ...resumeData, experience: newExp });
              }}
              placeholder="Descrição da função"
            />
            <textarea
              className="input-field mb-1"
              rows={2}
              value={exp.achievements.join('\n')}
              onChange={e => {
                const newExp = [...resumeData.experience];
                newExp[i] = { ...exp, achievements: e.target.value.split('\n') };
                onChange({ ...resumeData, experience: newExp });
              }}
              placeholder="Realizações (uma por linha)"
            />
          </div>
        ))}
      </section>
      {/* Formação Acadêmica */}
      <section className="section">
        <h3 className="font-bold mb-2">Formação Acadêmica</h3>
        {resumeData.education.map((edu, i) => (
          <div key={i} className="mb-4">
            <input
              className="input-field mb-1"
              value={edu.institution}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, institution: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="Instituição"
            />
            <input
              className="input-field mb-1"
              value={edu.degree}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, degree: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="Curso/Grau"
            />
            <input
              className="input-field mb-1"
              value={edu.field}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, field: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="Área de estudo"
            />
            <input
              className="input-field mb-1"
              value={edu.year || ''}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, year: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="Ano de conclusão"
            />
            <input
              className="input-field mb-1"
              value={edu.gpa || ''}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, gpa: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="GPA/Nota (opcional)"
            />
            <input
              className="input-field mb-1"
              value={edu.specialization || ''}
              onChange={e => {
                const newEdu = [...resumeData.education];
                newEdu[i] = { ...edu, specialization: e.target.value };
                onChange({ ...resumeData, education: newEdu });
              }}
              placeholder="Especialização relevante (opcional)"
            />
          </div>
        ))}
      </section>
      {/* Seção de Diferenciação */}
      <section className="section">
        <h3 className="font-bold mb-2">Diferenciais</h3>
        {resumeData.differentiation?.map((item, i) => (
          <div key={i} className="mb-2">
            <input
              className="input-field mb-1"
              value={item.title}
              onChange={e => {
                const newDiff = [...(resumeData.differentiation || [])];
                newDiff[i] = { ...item, title: e.target.value };
                onChange({ ...resumeData, differentiation: newDiff });
              }}
              placeholder="Título/Nome do diferencial"
            />
            <input
              className="input-field mb-1"
              value={item.details}
              onChange={e => {
                const newDiff = [...(resumeData.differentiation || [])];
                newDiff[i] = { ...item, details: e.target.value };
                onChange({ ...resumeData, differentiation: newDiff });
              }}
              placeholder="Detalhes"
            />
          </div>
        ))}
      </section>
      {/* Elemento Final de Engajamento */}
      <section className="section">
        <h3 className="font-bold mb-2">Elemento Final de Engajamento</h3>
        <input
          className="input-field mb-2"
          value={resumeData.finalElement?.qrCodeUrl || ''}
          onChange={e => handleFieldChange('finalElement', 'qrCodeUrl', e.target.value)}
          placeholder="URL do QR code/LinkedIn/Portfólio"
        />
        <input
          className="input-field mb-2"
          value={resumeData.finalElement?.availability || ''}
          onChange={e => handleFieldChange('finalElement', 'availability', e.target.value)}
          placeholder="Disponibilidade para entrevistas"
        />
        <input
          className="input-field mb-2"
          value={resumeData.finalElement?.references || ''}
          onChange={e => handleFieldChange('finalElement', 'references', e.target.value)}
          placeholder="Referências disponíveis sob solicitação"
        />
      </section>
    </div>
  );
};

export default ResumeEditSections;
