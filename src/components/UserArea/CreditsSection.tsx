import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useCredits } from '../../hooks/useCredits';
import {
  CreditCard,
  Plus,
  Clock,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const transactions = [
  {
    id: 1,
    type: 'add',
    amount: 5,
    date: '2025-04-05T10:30:00Z',
    status: 'completed',
    description: 'Compra de créditos - Plano Premium'
  },
  {
    id: 2,
    type: 'use',
    amount: 1,
    date: '2025-04-04T15:45:00Z',
    status: 'completed',
    description: 'Geração de currículo'
  },
  {
    id: 3,
    type: 'add',
    amount: 10,
    date: '2025-04-03T09:15:00Z',
    status: 'completed',
    description: 'Compra de créditos - Plano Enterprise'
  }
];

const paymentMethods = [
  {
    id: 1,
    type: 'credit',
    last4: '4242',
    brand: 'Visa',
    expiry: '12/25'
  },
  {
    id: 2,
    type: 'credit',
    last4: '8888',
    brand: 'Mastercard',
    expiry: '09/26'
  }
];

const CreditsSection = () => {
  const { resumeData } = useResume();
  const { credits, loading } = useCredits(resumeData.user?.id);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(5);

  const creditPackages = [
    { amount: 5, price: 49.90, popular: false },
    { amount: 10, price: 89.90, popular: true },
    { amount: 20, price: 159.90, popular: false }
  ];

  const handleAddCredits = async () => {
    setIsAddingCredits(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedAmount} créditos adicionados com sucesso!`);
      setIsAddingCredits(false);
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Erro ao adicionar créditos. Tente novamente.');
      setIsAddingCredits(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Seus Créditos
        </h2>
        <p className="text-primary/70">
          Gerencie seus créditos e visualize seu histórico de transações
        </p>
      </div>

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-accent/5 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary/70">
                Saldo Atual
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `${credits} crédito${credits !== 1 ? 's' : ''}`
                )}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700/70">
                Créditos Utilizados
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                15
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700/70">
                Próximo Vencimento
              </p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                30 dias
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Credits */}
      <div className="bg-white rounded-xl border border-secondary p-6">
        <h3 className="text-lg font-medium text-primary mb-4">
          Adicionar Créditos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.amount}
              onClick={() => setSelectedAmount(pkg.amount)}
              className={`relative cursor-pointer rounded-xl transition-all
                ${selectedAmount === pkg.amount
                  ? 'border-2 border-accent bg-accent/5'
                  : 'border border-secondary hover:border-accent/50'
                }
              `}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {pkg.amount}
                  </span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-primary/70 text-sm mb-4">
                  créditos
                </p>
                <div className="text-lg font-bold text-primary">
                  R$ {pkg.price.toFixed(2)}
                </div>
                <p className="text-sm text-primary/70">
                  R$ {(pkg.price / pkg.amount).toFixed(2)} por crédito
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddCredits}
          disabled={isAddingCredits}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingCredits ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Adicionar {selectedAmount} Créditos</span>
            </>
          )}
        </button>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-medium text-primary mb-4">
          Histórico de Transações
        </h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg
                  ${transaction.type === 'add'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                  }`}
                >
                  {transaction.type === 'add' ? (
                    <Plus className={`w-5 h-5 ${
                      transaction.type === 'add'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`} />
                  ) : (
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-primary/70">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'add'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`}>
                  {transaction.type === 'add' ? '+' : '-'}
                  {transaction.amount} crédito{transaction.amount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-primary/70">
                  {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-medium text-primary mb-4">
          Métodos de Pagamento
        </h3>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-sm text-primary/70">
                    Expira em {method.expiry}
                  </p>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-secondary rounded-lg text-primary hover:bg-secondary/5 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Adicionar Novo Método de Pagamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsSection;