// src/App.tsx

import { useResume } from './contexts/ResumeContext';
import TimelineFlow from './components/TimelineFlow';
import UserMenu from './components/UserMenu';
import UserArea from './components/UserArea';
import { Toaster } from 'react-hot-toast';
import ThemeToggleButton from './components/ThemeToggleButton';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { resumeData } = useResume();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background dark:bg-darkBackground relative overflow-hidden text-primary dark:text-darkPrimary transition-colors duration-300">
        {/* Background Elements - Adjust opacity or colors for dark mode if needed */}
        <div className="absolute inset-0 bg-geometric-pattern opacity-5 dark:opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
          }}
        />

        {/* Header with User Menu */}
        <header className="relative z-10 border-b border-secondary/20 dark:border-darkSurface bg-white/80 dark:bg-darkSurface/80 backdrop-blur-sm transition-colors duration-300">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="font-franie text-2xl font-bold text-primary dark:text-darkPrimary transition-colors duration-300">
              Currículo Profissional
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeToggleButton />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative">
          <ErrorBoundary>
            {resumeData.showUserArea ? (
              <UserArea />
            ) : (
              <div className="container mx-auto px-4 py-12">
                <TimelineFlow />
              </div>
            )}
          </ErrorBoundary>
        </main>
        <Toaster 
          position="top-right" 
          toastOptions={{
            // Configurações globais para toast
            duration: 5000,
            style: {
              borderRadius: '8px',
              background: '#fff',
              color: '#333',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            },
            // Estilos por tipo de toast
            success: {
              style: {
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534'
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff'
              }
            },
            error: {
              style: {
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b'
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            },
            loading: {
              style: {
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af'
              }
            }
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;