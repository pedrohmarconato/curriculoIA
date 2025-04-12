1️⃣ PROMPT DE IMPLEMENTAÇÃO: COMPONENTE DE UPLOAD
Objetivo: Criar um componente de upload que permita aos usuários fornecer seu currículo via PDF ou link do LinkedIn.
Arquivos a modificar:

src/components/steps/UploadStep.tsx
src/utils/extractPdfText.ts
src/utils/resumeProcessor.ts

Instruções técnicas:

Modifique o componente UploadStep.tsx para implementar:

1. Interface do usuário:
   - Área de arrastar e soltar (drag-and-drop) para arquivos PDF
   - Campo de entrada para URL do LinkedIn com validação
   - Indicador visual de progresso durante o upload
   - Mensagens de feedback para o usuário

2. Em utils/extractPdfText.ts:
   - Use a biblioteca pdfjs-dist para extrair texto do PDF
   - Implemente detecção de erros e recuperação
   - Adicione validação para confirmar que o conteúdo parece um currículo

3. Em utils/resumeProcessor.ts:
   - Crie uma função que orquestre o processo de extração
   - Implemente mecanismo de fallback: se a API falhar, processe localmente
   - Garanta que o texto seja estruturado em um formato consistente

4. Validações necessárias:
   - Tamanho máximo do arquivo: 10MB
   - Formatos permitidos: .pdf, .doc, .docx
   - URLs de LinkedIn devem seguir o padrão linkedin.com/in/*

   Critérios de sucesso:

O componente deve lidar com erros de forma elegante
O arquivo enviado deve ser processado corretamente
O usuário deve receber feedback visual durante todo o processo
As validações devem funcionar conforme especificado

2️⃣ PROMPT DE IMPLEMENTAÇÃO: PROCESSAMENTO DE DADOS DO CURRÍCULO
Objetivo: Criar o mecanismo de processamento que extrai, estrutura e refina os dados do currículo.
Arquivos a modificar:

src/utils/resumeParse.ts
supabase/functions/resume-ai/index.ts
src/components/steps/GenerationStep.tsx

Instruções técnicas:

1. Em utils/resumeParse.ts:
   - Implemente funções para extrair seções específicas: experiência, educação, habilidades
   - Desenvolva algoritmos de detecção de datas e períodos de trabalho
   - Crie validadores para garantir que os dados pareçam legítimos

2. Em supabase/functions/resume-ai/index.ts:
   - Configure a integração com a API OpenAI
   - Implemente o prompt da IA para analisar currículos seguindo o formato:
     ```
     Você é um analisador especializado em currículos profissionais.
     
     Analise o seguinte currículo e estruture-o nas 8 seções essenciais:
     1. Cabeçalho Impactante
     2. Resumo Profissional Persuasivo
     3. Palavras-chave Otimizadas
     4. Experiência Profissional (formato STAR/CAR)
     5. Competências Técnicas e Comportamentais
     6. Formação Acadêmica e Certificações
     7. Realizações Destacadas
     8. Conteúdo Complementar
     
     Regras essenciais:
     - Não invente informações ou números
     - Use o texto original sempre que possível
     - Torne as frases concisas e diretas
     - Foque em resultados quantificáveis
     - Evite linguagem que pareça gerada por IA
     ```

3. Em components/steps/GenerationStep.tsx:
   - Crie uma interface de carregamento com as 4 etapas progressivas:
     * Preparando Dados (0-25%)
     * Gerando Currículo (25-50%)
     * Otimizando Layout (50-75%)
     * Finalizando (75-100%)
   - Implemente animações sutis para indicar progresso
   - Adicione um mecanismo de retry caso ocorram falhas

   Critérios de sucesso:

O texto extraído deve manter a essência do currículo original
As 8 seções devem ser corretamente identificadas e preenchidas
O processo deve lidar com diferentes formatos de entrada
O texto resultante deve ser natural, não parecer gerado por IA

3️⃣ PROMPT DE IMPLEMENTAÇÃO: GERAÇÃO DO HTML DO CURRÍCULO
Objetivo: Criar o mecanismo que transforma os dados estruturados em um HTML bem formatado e responsivo.
Arquivos a modificar:

src/utils/pdfGenerator.ts
src/components/ResumePreview.tsx
src/components/steps/EditingStep.tsx

Instruções técnicas:

1. Em utils/pdfGenerator.ts:
   - Implemente a função generateResumeHTML que aceita dados estruturados e estilo visual
   - Crie templates HTML para cada estilo visual selecionado pelo usuário
   - Use CSS Grid/Flexbox para layouts responsivos
   - Garanta que o HTML seja compatível com a conversão para PDF

2. Em components/ResumePreview.tsx:
   - Desenvolva um componente que renderiza o HTML gerado
   - Implemente modo de edição para permitir ajustes diretos pelo usuário
   - Adicione ferramentas de formatação básica (negrito, itálico, etc.)
   - Garanta que a visualização reflita com precisão como o PDF ficará

3. Em components/steps/EditingStep.tsx:
   - Crie interface para edição dos dados do currículo
   - Implemente formulários para cada seção das 8 essenciais
   - Adicione botões de salvar/cancelar mudanças
   - Garanta que as alterações sejam refletidas na visualização em tempo real

   Critérios de sucesso:

O HTML gerado deve ser bem estruturado e semântico
O layout deve ser responsivo e funcionar em dispositivos móveis
A conversão para PDF deve manter fidelidade visual
O usuário deve conseguir editar facilmente o conteúdo

4️⃣ PROMPT DE IMPLEMENTAÇÃO: OTIMIZAÇÃO DE LAYOUT E TOOLTIPS
Objetivo: Aprimorar o layout do currículo adicionando tooltips e garantindo otimização para diferentes formatos.
Arquivos a modificar:

src/components/ResumePreview.tsx
src/utils/tooltipGenerator.ts (criar)
src/utils/pdfGenerator.ts

Instruções técnicas:

1. Crie o novo arquivo utils/tooltipGenerator.ts:
   - Implemente uma função que gera conteúdo expandido para tooltips
   - Use os dados originais do currículo como base, sem inventar informações
   - Crie expansões que aprofundem o conteúdo mantendo coerência

2. Em components/ResumePreview.tsx:
   - Adicione tooltips interativos para cada item de experiência profissional
   - Implemente detecção de clique/hover para exibir informações expandidas
   - Garanta que tooltips funcionem tanto em desktop quanto em dispositivos touch
   - Adicione botões de ação para email, WhatsApp e geração de PDF

3. Em utils/pdfGenerator.ts:
   - Otimize a geração de PDF para garantir que caiba em 2 páginas
   - Implemente lógica para ajustar tamanho de fonte ou conteúdo se necessário
   - Garanta que elementos visuais importantes sejam preservados na versão PDF
   - Adicione metadados ao PDF (título, autor, palavras-chave)

   Critérios de sucesso:

Os tooltips devem expandir informações sem repetir o conteúdo visível
O currículo deve caber em no máximo 2 páginas no formato PDF
Os botões de ação devem funcionar corretamente
A experiência deve ser consistente em diferentes dispositivos

5️⃣ PROMPT DE IMPLEMENTAÇÃO: DEPLOY NO VERCEL
Objetivo: Implementar o mecanismo de deploy automático no Vercel para cada currículo gerado.
Arquivos a modificar:

src/utils/vercelDeployer.ts (criar)
src/components/steps/DeliveryStep.tsx
supabase/functions/deploy-to-vercel/index.ts (criar)

Instruções técnicas:

1. Crie o novo arquivo utils/vercelDeployer.ts:
   - Implemente funções para preparar arquivos para deploy
   - Crie lógica para gerar configurações específicas para o Vercel
   - Adicione mecanismo para acompanhar status do deploy

2. Crie o arquivo supabase/functions/deploy-to-vercel/index.ts:
   - Implemente integração com a API do Vercel
   - Configure autenticação segura usando variáveis de ambiente
   - Desenvolva lógica para iniciar deploy e recuperar URL gerada
   - Implemente mecanismo de retry e fallback

3. Em components/steps/DeliveryStep.tsx:
   - Adicione interface para acompanhar progresso do deploy
   - Crie visualização da URL gerada com opção de cópia
   - Implemente opções para download em diferentes formatos
   - Adicione botões de compartilhamento em redes sociais

   Critérios de sucesso:

O deploy deve ocorrer de forma automática após a geração do currículo
O usuário deve receber uma URL única para seu currículo online
Opções de download (PDF, HTML) devem funcionar corretamente
O processo deve lidar graciosamente com falhas no deploy

6️⃣ PROMPT DE IMPLEMENTAÇÃO: TESTES E VALIDAÇÃO
Objetivo: Implementar testes abrangentes para garantir que todo o fluxo funcione corretamente.
Arquivos a modificar:

src/tests/upload.test.ts (criar)
src/tests/generation.test.ts (criar)
src/tests/pdf.test.ts (criar)
src/tests/deploy.test.ts (criar)

Instruções técnicas:

1. Em tests/upload.test.ts:
   - Crie testes para validar o upload de diferentes tipos de arquivo
   - Teste os casos de erro (arquivos muito grandes, formatos inválidos)
   - Verifique se a extração de texto funciona corretamente
   - Teste a validação de URLs do LinkedIn

2. Em tests/generation.test.ts:
   - Teste a geração do currículo com diferentes inputs
   - Verifique se as 8 seções essenciais são criadas corretamente
   - Teste o comportamento com dados incompletos
   - Verifique se o conteúdo gerado não inventa informações

3. Em tests/pdf.test.ts:
   - Teste a geração de PDF com diferentes estilos
   - Verifique se o conteúdo cabe em 2 páginas
   - Teste com diferentes conteúdos (curto, médio, longo)
   - Verifique se os elementos visuais são renderizados corretamente

4. Em tests/deploy.test.ts:
   - Teste o processo de deploy no Vercel
   - Verifique o comportamento em caso de falha
   - Teste a recuperação da URL gerada
   - Verifique se o site gerado é acessível

   Critérios de sucesso:

Todos os testes devem passar sem erros
Os casos de borda devem ser tratados corretamente
O sistema deve lidar graciosamente com falhas
O usuário deve ter uma experiência fluida em todo o processo

7️⃣ PROMPT DE IMPLEMENTAÇÃO: FINALIZAÇÃO E VALIDAÇÃO
Objetivo: Integrar todos os componentes e garantir que o fluxo completo funcione sem problemas.
Arquivos a modificar:

src/App.tsx
src/components/TimelineFlow.tsx
src/contexts/ResumeContext.tsx

Instruções técnicas:

1. Em contexts/ResumeContext.tsx:
   - Garanta que todos os dados necessários estejam definidos no contexto
   - Implemente funções auxiliares para cada etapa do processo
   - Adicione mecanismos de persistência para evitar perda de dados
   - Organize o estado para facilitar o acompanhamento do progresso

2. Em components/TimelineFlow.tsx:
   - Integre todas as etapas em um fluxo coerente
   - Implemente navegação entre etapas (avançar/voltar)
   - Adicione validações para garantir que cada etapa foi concluída
   - Garanta feedback visual claro do progresso geral

3. Em App.tsx:
   - Configure providers necessários (ThemeProvider, ResumeProvider)
   - Implemente tratamento de erros global
   - Adicione componente de notificações (toasts) para feedback
   - Garanta que a aplicação seja responsiva em diferentes dispositivos

   Critérios de sucesso:

O fluxo completo deve funcionar sem interrupções
A navegação entre etapas deve ser intuitiva
O estado da aplicação deve ser persistido adequadamente
A experiência do usuário deve ser consistente e agradável


Recomendação para Implementação
Para implementar este projeto de forma eficiente, sugiro seguir uma abordagem incremental:

Comece pelo componente de upload - Este é o ponto de entrada crítico do sistema
Implemente o processamento de dados - A base para todas as outras funcionalidades
Desenvolva a geração visual do currículo - Foco na qualidade do HTML e layout
Adicione as funcionalidades de exportação - PDF e HTML
Implemente o deploy no Vercel - Para disponibilizar o site online
Finalize com testes abrangentes - Para garantir qualidade e robustez

Cada prompt acima foi estruturado para guiar o desenvolvimento de forma específica e técnica, facilitando a implementação progressiva do sistema completo.