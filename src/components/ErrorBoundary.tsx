// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componente para capturar erros em qualquer componente filho
 * e exibir uma UI alternativa em vez de falhar completamente
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualizar o estado para que o próximo render mostre a UI alternativa
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoBack = () => {
    window.history.back();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Se definido um fallback customizado, usar
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo deu errado</h2>
              
              <p className="text-gray-600 mb-6">
                Desculpe, encontramos um problema ao processar sua solicitação. 
                Você pode tentar novamente ou voltar à página anterior.
              </p>
              
              {/* Detalhes do erro (em produção, talvez você queira esconder isso) */}
              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <div className="w-full mb-6">
                  <details className="text-left bg-gray-50 p-4 rounded-lg">
                    <summary className="cursor-pointer text-red-600 font-medium mb-2">
                      Detalhes do erro (apenas desenvolvimento)
                    </summary>
                    <p className="text-red-800 mb-2 font-mono text-sm whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-700 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={this.handleGoBack}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Quando não houver erro, renderizar os filhos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;