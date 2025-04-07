import { useResume } from '../context/ResumeContext';
import LoginStep from './steps/LoginStep';
import UploadStep from './steps/UploadStep';
import PersonalizationStep from './steps/PersonalizationStep';
import PaymentStep from './steps/PaymentStep';
import GenerationStep from './steps/GenerationStep';
import EditingStep from './steps/EditingStep';
import DeliveryStep from './steps/DeliveryStep';

const TimelineFlow = () => {
  const { resumeData } = useResume();

  const steps = [
    { id: 1, name: 'Login', component: LoginStep },
    { id: 2, name: 'Upload', component: UploadStep },
    { id: 3, name: 'Personalização', component: PersonalizationStep },
    { id: 4, name: 'Pagamento', component: PaymentStep },
    { id: 5, name: 'Geração', component: GenerationStep },
    { id: 6, name: 'Edição', component: EditingStep },
    { id: 7, name: 'Entrega', component: DeliveryStep }
  ];

  const currentStep = steps.find(step => step.id === resumeData.currentStep);
  const CurrentStepComponent = currentStep?.component;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Timeline Navigation */}
      <div className="mb-12">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-secondary -z-10" />
          
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center ${
                resumeData.currentStep === step.id ? 'text-accent' :
                resumeData.currentStep > step.id ? 'text-primary' :
                'text-primary/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${resumeData.currentStep === step.id ? 'bg-accent text-white' :
                  resumeData.currentStep > step.id ? 'bg-primary text-white' :
                  'bg-secondary'
                } shadow-lg transition-all duration-300`}
              >
                {resumeData.currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-franie font-bold">{step.id}</span>
                )}
              </div>
              <span className="mt-2 text-sm font-medium font-franie">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-secondary">
        {CurrentStepComponent && <CurrentStepComponent />}
      </div>
    </div>
  );
};

export default TimelineFlow;