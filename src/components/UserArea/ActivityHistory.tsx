import React from 'react';
import { 
  Clock,
  FileText,
  Download,
  Share2,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'create',
    title: 'Currículo criado',
    description: 'Novo currículo criado com template Moderno',
    date: '2025-04-05T10:30:00Z',
    status: 'success'
  },
  {
    id: 2,
    type: 'edit',
    title: 'Currículo editado',
    description: 'Atualização das informações profissionais',
    date: '2025-04-04T15:45:00Z',
    status: 'success'
  },
  {
    id: 3,
    type: 'download',
    title: 'Download realizado',
    description: 'Currículo baixado em formato PDF',
    date: '2025-04-03T09:15:00Z',
    status: 'success'
  },
  {
    id: 4,
    type: 'share',
    title: 'Currículo compartilhado',
    description: 'Link de compartilhamento gerado',
    date: '2025-04-02T14:20:00Z',
    status: 'success'
  }
];

const ActivityHistory = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return FileText;
      case 'edit':
        return Edit;
      case 'download':
        return Download;
      case 'share':
        return Share2;
      default:
        return Clock;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Histórico de Atividades
        </h2>
        <p className="text-primary/70">
          Acompanhe todas as ações realizadas em sua conta
        </p>
      </div>

      {/* Activity Filters */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-accent text-white rounded-lg font-medium whitespace-nowrap">
          Todas as Atividades
        </button>
        <button className="px-4 py-2 border border-secondary rounded-lg text-primary hover:bg-secondary/5 whitespace-nowrap">
          Currículos
        </button>
        <button className="px-4 py-2 border border-secondary rounded-lg text-primary hover:bg-secondary/5 whitespace-nowrap">
          Downloads
        </button>
        <button className="px-4 py-2 border border-secondary rounded-lg text-primary hover:bg-secondary/5 whitespace-nowrap">
          Compartilhamentos
        </button>
        <button className="px-4 py-2 border border-secondary rounded-lg text-primary hover:bg-secondary/5 whitespace-nowrap">
          Edições
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-secondary/50" />
        
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            
            return (
              <div
                key={activity.id}
                className="relative flex gap-4 items-start pl-8"
              >
                {/* Activity Indicator */}
                <div className="absolute -left-2 p-2 rounded-full bg-white border-2 border-secondary">
                  <Icon className="w-4 h-4 text-primary" />
                </div>

                {/* Activity Content */}
                <div className="flex-1 bg-white rounded-lg border border-secondary p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-primary">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-primary/70 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-primary/70">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      {activity.type === 'create' || activity.type === 'edit' ? (
                        <>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : activity.type === 'download' ? (
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;