import React, { useState, useEffect, useContext } from 'react';
// import { ResumeContext } from '../../contexts/ResumeContext'; // Assuming context exists

// Placeholder for ResumeContext - replace with actual import
const ResumeContext = React.createContext<any>(null);

// Define the structure for the 8 essential resume sections
interface ResumeSections {
  CabecalhoImpactante: string;
  ResumoProfissionalPersuasivo: string;
  PalavrasChaveOtimizadas: string;
  ExperienciaProfissional: string; // Consider a more structured type later
  CompetenciasTecnicasComportamentais: string; // Consider splitting later
  FormacaoAcademicaCertificacoes: string;
  RealizacoesDestacadas: string;
  ConteudoComplementar: string;
}

type SectionKey = keyof ResumeSections;

const sectionTitles: Record<SectionKey, string> = {
  CabecalhoImpactante: '1. Cabeçalho Impactante',
  ResumoProfissionalPersuasivo: '2. Resumo Profissional Persuasivo',
  PalavrasChaveOtimizadas: '3. Palavras-chave Otimizadas',
  ExperienciaProfissional: '4. Experiência Profissional (STAR/CAR)',
  CompetenciasTecnicasComportamentais: '5. Competências Técnicas e Comportamentais',
  FormacaoAcademicaCertificacoes: '6. Formação Acadêmica e Certificações',
  RealizacoesDestacadas: '7. Realizações Destacadas',
  ConteudoComplementar: '8. Conteúdo Complementar',
};

const EditResumeDataStep: React.FC = () => {
  const { processedResumeData, updateProcessedSection, getConfirmationStatus, setSectionConfirmed } = useContext(ResumeContext) || {}; // Use context

  // Initialize state with data from context or default
  const [editedData, setEditedData] = useState<ResumeSections>(processedResumeData || {
    CabecalhoImpactante: '',
    ResumoProfissionalPersuasivo: '',
    PalavrasChaveOtimizadas: '',
    ExperienciaProfissional: '',
    CompetenciasTecnicasComportamentais: '',
    FormacaoAcademicaCertificacoes: '',
    RealizacoesDestacadas: '',
    ConteudoComplementar: '',
  });

  // State to track confirmation status for each section
  const [confirmedSections, setConfirmedSections] = useState<Record<SectionKey, boolean>>(() => {
    const initialStatus: Record<SectionKey, boolean> = {} as any;
    if (getConfirmationStatus) {
        Object.keys(sectionTitles).forEach(key => {
            initialStatus[key as SectionKey] = getConfirmationStatus(key as SectionKey);
        });
    } else {
        // Default if context function not available yet
        Object.keys(sectionTitles).forEach(key => {
            initialStatus[key as SectionKey] = false;
        });
    }
    return initialStatus;
  });

  const allSectionsConfirmed = Object.values(confirmedSections).every(status => status);
  const confirmedCount = Object.values(confirmedSections).filter(status => status).length;
  const totalSections = Object.keys(sectionTitles).length;

  // Update local state if context data changes (e.g., AI processing finishes)
  useEffect(() => {
    if (processedResumeData) {
      setEditedData(processedResumeData);
      // Re-initialize confirmed status based on context when data loads
      const initialStatus: Record<SectionKey, boolean> = {} as any;
      if (getConfirmationStatus) {
          Object.keys(sectionTitles).forEach(key => {
              initialStatus[key as SectionKey] = getConfirmationStatus(key as SectionKey);
          });
          setConfirmedSections(initialStatus);
      }
    }
  }, [processedResumeData, getConfirmationStatus]);

  const handleInputChange = (section: SectionKey, value: string) => {
    setEditedData(prev => ({ ...prev, [section]: value }));
    // If user edits, consider it unconfirmed until they re-confirm
    if (confirmedSections[section]) {
        setConfirmedSections(prev => ({ ...prev, [section]: false }));
        if (setSectionConfirmed) {
            setSectionConfirmed(section, false); // Update context as well
        }
    }
    // TODO: Implement auto-save/draft logic here
    console.log(`Auto-saving draft for section: ${section}`);
  };

  const handleConfirmClick = (section: SectionKey) => {
    // 1. Update the context with the edited data for this section
    if (updateProcessedSection) {
      updateProcessedSection(section, editedData[section]);
    }
    // 2. Mark the section as confirmed locally and in context
    setConfirmedSections(prev => ({ ...prev, [section]: true }));
    if (setSectionConfirmed) {
        setSectionConfirmed(section, true);
    }
    console.log(`Section ${section} confirmed.`);
  };

  const handleProceed = () => {
    if (allSectionsConfirmed) {
      console.log('Proceeding to the next step...');
      // TODO: Implement navigation to the next step
    } else {
      console.warn('Cannot proceed: Not all sections are confirmed.');
      // Optionally show a message to the user
    }
  };

  // Loading state or placeholder if data isn't ready
  if (!processedResumeData) {
    return <div>Carregando dados do currículo processado...</div>; // Loading state
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Etapa 5: Geração - Preparando Dados</h2>
      <p>Revise, edite e confirme cada seção do seu currículo processado pela IA.</p>

      {/* Progress Indicator */}
      <div style={{ marginBottom: '20px', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        <strong>Progresso:</strong> {confirmedCount} de {totalSections} seções confirmadas.
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '3px', marginTop: '5px' }}>
          <div
            style={{
              width: `${(confirmedCount / totalSections) * 100}%`,
              backgroundColor: '#4caf50',
              height: '10px',
              borderRadius: '3px',
              transition: 'width 0.3s ease-in-out'
            }}
          ></div>
        </div>
      </div>

      {/* Render each section */}
      {(Object.keys(sectionTitles) as SectionKey[]).map((key) => (
        <div key={key} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px', backgroundColor: confirmedSections[key] ? '#e8f5e9' : '#fff' }}>
          <h3 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {sectionTitles[key]}
            {confirmedSections[key] && <span style={{ color: 'green', fontSize: '0.9em' }}>✔ Confirmado</span>}
          </h3>
          {/* TODO: Add contextual tips here */}
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            <i>Dica: [Placeholder para dicas contextuais sobre esta seção]</i>
          </p>
          <textarea
            value={editedData[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
            style={{ width: '98%', minHeight: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '3px', fontFamily: 'inherit' }}
            disabled={confirmedSections[key]} // Disable editing after confirmation
          />
          {!confirmedSections[key] && (
            <button
              onClick={() => handleConfirmClick(key)}
              style={{ marginTop: '10px', padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
            >
              Confirmar Seção
            </button>
          )}
           {confirmedSections[key] && (
            <button
              onClick={() => { /* Allow re-editing */
                  setConfirmedSections(prev => ({ ...prev, [key]: false }));
                  if (setSectionConfirmed) setSectionConfirmed(key, false);
              }}
              style={{ marginTop: '10px', marginLeft: '10px', padding: '8px 15px', cursor: 'pointer', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px' }}
            >
              Editar Novamente
            </button>
          )}
        </div>
      ))}

      {/* Proceed Button */}
      <button
        onClick={handleProceed}
        disabled={!allSectionsConfirmed}
        style={{
          marginTop: '20px',
          padding: '12px 25px',
          fontSize: '1.1em',
          cursor: allSectionsConfirmed ? 'pointer' : 'not-allowed',
          backgroundColor: allSectionsConfirmed ? '#28a745' : '#cccccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {allSectionsConfirmed ? 'Prosseguir para Próxima Etapa' : 'Confirme todas as seções para prosseguir'}
      </button>
    </div>
  );
};

export default EditResumeDataStep;
