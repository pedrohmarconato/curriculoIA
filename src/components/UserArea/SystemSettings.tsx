import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Sun, 
  Moon, 
  Globe, 
  Type, 
  Clock,
  Eye,
  ChevronDown,
  Check
} from 'lucide-react';

const SystemSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState('normal');
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF7F6B');

  const fontSizes = [
    { id: 'small', label: 'Pequeno' },
    { id: 'normal', label: 'Normal' },
    { id: 'large', label: 'Grande' },
    { id: 'xlarge', label: 'Extra Grande' }
  ];

  const languages = [
    { id: 'pt-BR', label: 'Português (Brasil)' },
    { id: 'en-US', label: 'English (US)' },
    { id: 'es', label: 'Español' }
  ];

  const timezones = [
    { id: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { id: 'America/New_York', label: 'New York (GMT-4)' },
    { id: 'Europe/London', label: 'London (GMT+1)' },
    { id: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
  ];

  const colors = [
    '#FF7F6B',
    '#4299E1',
    '#48BB78',
    '#ED8936',
    '#9F7AEA',
    '#F56565'
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Configurações do Sistema
        </h2>
        <p className="text-primary/70">
          Personalize a aparência e o comportamento do sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary">
            Tema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => toggleTheme()}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                ${theme === 'light'
                  ? 'border-accent bg-accent/5'
                  : 'border-secondary hover:border-accent/50'
                }`}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sun className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-primary">Tema Claro</p>
                <p className="text-sm text-primary/70">
                  Ideal para uso durante o dia
                </p>
              </div>
              {theme === 'light' && (
                <Check className="w-5 h-5 text-accent ml-auto" />
              )}
            </button>

            <button
              onClick={() => toggleTheme()}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                ${theme === 'dark'
                  ? 'border-accent bg-accent/5'
                  : 'border-secondary hover:border-accent/50'
                }`}
            >
              <div className="p-2 bg-gray-900 rounded-lg shadow-sm">
                <Moon className="w-6 h-6 text-gray-100" />
              </div>
              <div className="text-left">
                <p className="font-medium text-primary">Tema Escuro</p>
                <p className="text-sm text-primary/70">
                  Melhor para uso noturno
                </p>
              </div>
              {theme === 'dark' && (
                <Check className="w-5 h-5 text-accent ml-auto" />
              )}
            </button>
          </div>
        </div>

        {/* Cores */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary">
            Cores do Tema
          </h3>
          <div className="relative">
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-secondary hover:border-accent/50 transition-all"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-primary">Cor Principal</span>
              <ChevronDown className="w-4 h-4 text-primary/70 ml-auto" />
            </button>

            {isColorPickerOpen && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-secondary">
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setIsColorPickerOpen(false);
                      }}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tamanho da Fonte */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary flex items-center gap-2">
            <Type className="w-5 h-5" />
            Tamanho da Fonte
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id)}
                className={`px-4 py-2 rounded-lg border transition-all
                  ${fontSize === size.id
                    ? 'border-accent bg-accent/5'
                    : 'border-secondary hover:border-accent/50'
                  }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Idioma
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-4 py-2 rounded-lg border transition-all
                  ${language === lang.id
                    ? 'border-accent bg-accent/5'
                    : 'border-secondary hover:border-accent/50'
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fuso Horário */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Fuso Horário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timezones.map((tz) => (
              <button
                key={tz.id}
                onClick={() => setTimezone(tz.id)}
                className={`px-4 py-2 rounded-lg border transition-all
                  ${timezone === tz.id
                    ? 'border-accent bg-accent/5'
                    : 'border-secondary hover:border-accent/50'
                  }`}
              >
                {tz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Acessibilidade */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Acessibilidade
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-primary">Alto Contraste</span>
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={() => {}}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-primary">Reduzir Animações</span>
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={() => {}}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-primary">Leitor de Tela</span>
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={() => {}}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;