import React from 'react';
import { ResumeData, VisualStyle } from '../lib/resume-ai';
import { Loader2 } from 'lucide-react';

interface ResumePreviewProps {
  resumeData: ResumeData;
  style: VisualStyle;
  isLoading?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, style, isLoading }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-6"
        style={{ backgroundColor: style.colors.primary }}
      >
        <h2 className="text-2xl font-bold" style={{ color: style.colors.background }}>
          {resumeData.personalInfo.name}
        </h2>
        <div className="mt-2 space-y-1" style={{ color: style.colors.secondary }}>
          {resumeData.personalInfo.contact.email && (
            <p>{resumeData.personalInfo.contact.email}</p>
          )}
          {resumeData.personalInfo.contact.phone && (
            <p>{resumeData.personalInfo.contact.phone}</p>
          )}
          {resumeData.personalInfo.contact.location && (
            <p>{resumeData.personalInfo.contact.location}</p>
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
            {resumeData.experience.map((exp, index) => (
              <div key={index}>
                <h4 className="font-medium">{exp.role}</h4>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.period.start} - {exp.period.end}
                </p>
                <p className="mt-2">{exp.description}</p>
              </div>
            ))}
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
                {resumeData.skills.technical.map((skill, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{skill.name}</span>
                    <span className="text-sm text-gray-600">{skill.level}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Interpessoais</h4>
              <ul className="space-y-2">
                {resumeData.skills.interpersonal.map((skill, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{skill.name}</span>
                    <span className="text-sm text-gray-600">{skill.level}</span>
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
            {resumeData.education.map((edu, index) => (
              <div key={index}>
                <h4 className="font-medium">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">
                  {edu.period.start} - {edu.period.end}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResumePreview;