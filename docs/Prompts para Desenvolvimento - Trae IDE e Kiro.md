# Prompts para Desenvolvimento - Trae IDE e Kiro
## App de Avaliação de Corredores e Exercícios

**Autor**: Manus AI  
**Data**: 20 de Julho de 2025  
**Versão**: 1.0

---

## Sumário Executivo

Este documento contém prompts detalhados e estruturados para o desenvolvimento do aplicativo de avaliação de corredores e exercícios utilizando as ferramentas Trae IDE e Kiro. Os prompts estão organizados por plataforma (iOS prioritário, Android preparatório) e por módulo funcional, seguindo as melhores práticas de desenvolvimento moderno e as especificações técnicas definidas anteriormente.

Cada prompt inclui contexto técnico completo, especificações de implementação, considerações de performance, e exemplos de código quando aplicável. O foco inicial está no desenvolvimento iOS utilizando React Native, com preparação simultânea para expansão Android.

---


## 1. Prompts para Desenvolvimento iOS (Prioridade)

### 1.1 Configuração Inicial do Projeto React Native

**Prompt para Trae IDE:**

```
Crie um novo projeto React Native para um aplicativo de análise de movimento e fitness chamado "FitAnalyzer Pro". Configure o projeto com as seguintes especificações:

CONFIGURAÇÃO BASE:
- React Native 0.72+ com TypeScript
- Suporte para iOS 14+ e Android 8+ (API 26+)
- Arquitetura modular com separação clara de responsabilidades
- Configuração para desenvolvimento cross-platform com foco inicial em iOS

DEPENDÊNCIAS PRINCIPAIS:
- @react-navigation/native e @react-navigation/stack para navegação
- @reduxjs/toolkit e react-redux para gerenciamento de estado
- react-native-vision-camera para captura de vídeo avançada
- react-native-reanimated para animações fluidas
- @react-native-async-storage/async-storage para persistência local
- react-native-vector-icons para ícones
- react-native-linear-gradient para gradientes
- react-native-gesture-handler para gestos

ESTRUTURA DE PASTAS:
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas do aplicativo
├── navigation/         # Configuração de navegação
├── store/             # Redux store e slices
├── services/          # APIs e serviços externos
├── utils/             # Funções utilitárias
├── hooks/             # Custom hooks
├── types/             # Definições TypeScript
└── assets/            # Imagens, fontes, etc.

CONFIGURAÇÕES ESPECÍFICAS:
- Configurar Metro bundler para otimização
- Setup do Flipper para debugging
- Configuração do ESLint e Prettier
- Configuração do Husky para pre-commit hooks
- Setup do react-native-config para variáveis de ambiente

Inclua configuração inicial para integração com:
- Apple HealthKit (iOS)
- Camera permissions e configurações
- Background processing para análise de vídeo
- Push notifications

Crie também os arquivos de configuração necessários:
- babel.config.js otimizado
- metro.config.js com configurações customizadas
- tsconfig.json com paths absolutos
- .env.example com variáveis necessárias
```

### 1.2 Implementação do Sistema de Autenticação

**Prompt para Trae IDE:**

```
Implemente um sistema completo de autenticação para o aplicativo FitAnalyzer Pro com as seguintes especificações:

FUNCIONALIDADES REQUERIDAS:
- Login com email/senha
- Registro de novos usuários com validação
- Recuperação de senha
- Autenticação biométrica (Face ID/Touch ID no iOS)
- Logout seguro com limpeza de dados
- Persistência de sessão

TIPOS DE USUÁRIO:
- Atleta Individual
- Coach/Treinador
- Fisioterapeuta
- Academia/Centro de Treinamento

IMPLEMENTAÇÃO TÉCNICA:
- Use JWT tokens para autenticação
- Implemente refresh tokens para sessões longas
- Armazene tokens de forma segura usando Keychain (iOS)
- Validação de formulários com react-hook-form
- Máscaras de input para campos específicos
- Feedback visual para estados de loading/erro

TELAS NECESSÁRIAS:
1. Splash Screen com verificação de autenticação
2. Onboarding (primeira vez)
3. Login
4. Registro (multi-step)
5. Recuperação de senha
6. Configuração de biometria

COMPONENTES A CRIAR:
- AuthInput (input customizado com validação)
- AuthButton (botão com estados de loading)
- BiometricPrompt (prompt para autenticação biométrica)
- UserTypeSelector (seleção de tipo de usuário)
- PasswordStrengthIndicator (indicador de força da senha)

VALIDAÇÕES:
- Email: formato válido e unicidade
- Senha: mínimo 8 caracteres, maiúscula, minúscula, número
- Campos obrigatórios com feedback visual
- Validação de CPF/CNPJ para profissionais

INTEGRAÇÃO COM BACKEND:
- Endpoints para login, registro, recuperação
- Interceptors para renovação automática de tokens
- Tratamento de erros de rede e autenticação
- Retry automático para falhas temporárias

SEGURANÇA:
- Criptografia de dados sensíveis
- Proteção contra ataques de força bruta
- Validação de certificados SSL
- Logs de segurança (sem dados sensíveis)

Implemente também:
- Navegação condicional baseada no estado de autenticação
- Deep linking para recuperação de senha
- Suporte a múltiplas contas (futuro)
- Integração com Apple Sign In (iOS)
```

### 1.3 Módulo de Captura e Processamento de Vídeo

**Prompt para Kiro:**

```
Desenvolva um módulo completo de captura e processamento de vídeo para análise de movimento com as seguintes especificações avançadas:

CAPTURA DE VÍDEO:
- Utilize react-native-vision-camera para máxima qualidade
- Suporte a resoluções: 720p, 1080p, 4K (baseado no dispositivo)
- Frame rates: 30fps, 60fps, 240fps (slow motion)
- Orientação automática e manual
- Foco automático contínuo
- Controle de exposição
- Estabilização de imagem

INTERFACE DE CAPTURA:
- Overlay com guias de posicionamento
- Contador de tempo em tempo real
- Indicadores de qualidade de captura
- Botões de controle intuitivos
- Preview em tempo real
- Zoom digital suave

PROCESSAMENTO EM TEMPO REAL:
- Integração com MediaPipe para detecção de pose
- Overlay de skeleton em tempo real
- Cálculo de ângulos articulares básicos
- Detecção de qualidade da pose
- Alertas visuais para reposicionamento

FUNCIONALIDADES AVANÇADAS:
- Gravação em múltiplos ângulos (se múltiplos dispositivos)
- Marcadores temporais durante gravação
- Pausar/retomar gravação
- Trim de vídeo pós-gravação
- Compressão inteligente para upload

ANÁLISE PÓS-PROCESSAMENTO:
- Decisão automática: processamento local vs nuvem
- Análise completa com MediaPipe
- Cálculo de métricas biomecânicas:
  * Cadência (para corrida)
  * Amplitude de movimento
  * Velocidade de movimento
  * Simetria corporal
  * Estabilidade postural

TIPOS DE EXERCÍCIO SUPORTADOS:
1. Corrida/Caminhada:
   - Análise de pisada
   - Cadência e comprimento de passada
   - Postura corporal
   - Movimento dos braços

2. Salto Vertical:
   - Altura do salto
   - Técnica de decolagem
   - Aterrissagem
   - Força explosiva

3. Agachamento:
   - Profundidade
   - Alinhamento dos joelhos
   - Postura das costas
   - Distribuição de peso

4. Exercícios Gerais:
   - Contagem de repetições
   - Amplitude de movimento
   - Velocidade de execução
   - Padrões de compensação

OTIMIZAÇÕES DE PERFORMANCE:
- Processamento em background threads
- Cache inteligente de frames
- Redução de resolução para análise em tempo real
- Garbage collection otimizado
- Uso eficiente de memória

INTEGRAÇÃO COM IA:
- Modelos TensorFlow Lite para processamento local
- Fallback para processamento em nuvem
- Versionamento de modelos de IA
- A/B testing de algoritmos

FEEDBACK VISUAL:
- Skeleton overlay colorido
- Indicadores de ângulos articulares
- Métricas em tempo real
- Alertas de posicionamento
- Progresso de análise

EXPORTAÇÃO E COMPARTILHAMENTO:
- Vídeo com overlay de análise
- Dados em formato JSON
- Relatórios em PDF
- Compartilhamento em redes sociais
- Envio para coaches/fisioterapeutas

Implemente com arquitetura modular para facilitar:
- Adição de novos tipos de exercício
- Atualização de algoritmos de análise
- Personalização por tipo de usuário
- Integração com dispositivos externos
```

### 1.4 Sistema de Análise e Relatórios

**Prompt para Trae IDE:**

```
Crie um sistema completo de análise e geração de relatórios para o FitAnalyzer Pro com as seguintes especificações:

DASHBOARD PRINCIPAL:
- Visão geral do progresso semanal/mensal
- Gráficos interativos de evolução
- Métricas principais em cards visuais
- Últimas análises realizadas
- Metas e objetivos de progresso
- Notificações e lembretes

ANÁLISE INDIVIDUAL DE VÍDEO:
- Score geral de 0-100 com breakdown por categoria
- Métricas específicas por tipo de exercício
- Comparação com análises anteriores
- Identificação de padrões e tendências
- Recomendações personalizadas de melhoria
- Visualização 3D do movimento (premium)

RELATÓRIOS TEMPORAIS:
1. Relatório Semanal:
   - Resumo de atividades
   - Evolução de scores
   - Exercícios mais praticados
   - Metas alcançadas
   - Recomendações para próxima semana

2. Relatório Mensal:
   - Análise de tendências
   - Comparação com mês anterior
   - Identificação de padrões sazonais
   - Progresso em direção a objetivos
   - Sugestões de ajustes no treinamento

3. Relatório Customizado:
   - Período definido pelo usuário
   - Filtros por tipo de exercício
   - Comparação entre diferentes períodos
   - Análise de correlações
   - Exportação em múltiplos formatos

VISUALIZAÇÕES DE DADOS:
- Gráficos de linha para evolução temporal
- Gráficos de radar para análise multidimensional
- Heat maps para identificação de padrões
- Gráficos de barras para comparações
- Scatter plots para correlações
- Histogramas para distribuições

MÉTRICAS ESPECÍFICAS POR EXERCÍCIO:

Corrida:
- Cadência (passos por minuto)
- Comprimento de passada
- Tempo de contato com solo
- Ângulo de aterrissagem
- Oscilação vertical
- Assimetria entre pernas
- Eficiência energética

Salto Vertical:
- Altura máxima alcançada
- Tempo de voo
- Força de decolagem
- Velocidade de movimento
- Ângulo de flexão dos joelhos
- Estabilidade na aterrissagem

Agachamento:
- Profundidade máxima
- Velocidade de descida/subida
- Alinhamento dos joelhos
- Ângulo do tronco
- Distribuição de peso
- Estabilidade lateral

FUNCIONALIDADES PREMIUM vs GRATUITO:

Gratuito:
- Score geral básico
- 3 métricas principais
- Histórico de 30 dias
- Relatórios básicos
- Comparação simples

Premium:
- Análise completa com todas as métricas
- Histórico ilimitado
- Relatórios avançados e customizados
- Análise preditiva
- Comparação com benchmarks
- Exportação em múltiplos formatos
- Análise de risco de lesão

INTEGRAÇÃO COM DADOS EXTERNOS:
- Apple HealthKit (frequência cardíaca, passos)
- Dispositivos wearables (Garmin, Fitbit)
- Apps de corrida (Strava, Nike Run Club)
- Dados meteorológicos (para corrida externa)

ALGORITMOS DE ANÁLISE:
- Detecção de anomalias nos padrões
- Análise de tendências com machine learning
- Predição de performance futura
- Identificação de risco de lesão
- Recomendações personalizadas baseadas em IA

COMPONENTES DE UI:
- ChartComponent (gráficos reutilizáveis)
- MetricCard (cards de métricas)
- ProgressIndicator (indicadores de progresso)
- ComparisonView (visualização de comparações)
- ReportExporter (exportação de relatórios)
- FilterPanel (painel de filtros)

PERFORMANCE E OTIMIZAÇÃO:
- Lazy loading de dados históricos
- Cache inteligente de relatórios
- Processamento assíncrono de análises
- Compressão de dados para armazenamento
- Otimização de queries de banco

ACESSIBILIDADE:
- Suporte a leitores de tela
- Descrições alternativas para gráficos
- Navegação por teclado
- Contraste adequado
- Textos redimensionáveis

Implemente também:
- Sistema de metas personalizáveis
- Notificações inteligentes baseadas em progresso
- Compartilhamento de conquistas
- Integração com calendário para planejamento
- Backup automático de dados
```

### 1.5 Interface de Usuário e Experiência (UI/UX)

**Prompt para Trae IDE:**

```
Desenvolva uma interface de usuário completa e intuitiva para o FitAnalyzer Pro seguindo as diretrizes de design do iOS e melhores práticas de UX:

DESIGN SYSTEM:
- Paleta de cores: Azul primário (#007AFF), Verde sucesso (#34C759), Laranja alerta (#FF9500)
- Tipografia: SF Pro (iOS nativo) com hierarquia clara
- Espaçamentos: Sistema de 8px base (8, 16, 24, 32, 40px)
- Bordas: Radius de 8px para cards, 16px para modais
- Sombras: Elevação sutil para profundidade

COMPONENTES REUTILIZÁVEIS:

1. Navegação:
   - TabNavigator customizado com ícones animados
   - HeaderComponent com título e ações
   - BackButton com gesto de swipe
   - SearchBar com filtros

2. Inputs e Formulários:
   - CustomTextInput com validação visual
   - PasswordInput com toggle de visibilidade
   - SelectInput com modal picker
   - DateTimePicker customizado
   - SliderInput para configurações

3. Botões e Ações:
   - PrimaryButton com estados (normal, loading, disabled)
   - SecondaryButton para ações secundárias
   - FloatingActionButton para ação principal
   - IconButton para ações rápidas

4. Cards e Containers:
   - MetricCard para exibição de dados
   - VideoCard para histórico de análises
   - ProgressCard para metas
   - InfoCard para dicas e informações

5. Feedback e Estados:
   - LoadingSpinner customizado
   - EmptyState com ilustrações
   - ErrorState com ações de retry
   - SuccessToast para confirmações
   - AlertModal para confirmações importantes

TELAS PRINCIPAIS:

1. Onboarding (3 telas):
   - Introdução ao app com animações
   - Explicação de funcionalidades
   - Configuração inicial de perfil

2. Dashboard:
   - Header com saudação personalizada
   - Cards de métricas principais
   - Gráfico de progresso semanal
   - Ações rápidas (Nova análise, Ver histórico)
   - Lista de análises recentes

3. Captura de Vídeo:
   - Interface de câmera fullscreen
   - Controles overlay transparentes
   - Indicadores de qualidade em tempo real
   - Guias de posicionamento
   - Timer e controles de gravação

4. Análise de Resultados:
   - Vídeo com overlay de análise
   - Score principal destacado
   - Breakdown de métricas em cards
   - Gráficos de comparação
   - Recomendações personalizadas

5. Histórico:
   - Lista filtrada de análises
   - Busca e filtros avançados
   - Visualização em grid/lista
   - Ações de compartilhamento
   - Comparação entre análises

6. Relatórios:
   - Seletor de período
   - Gráficos interativos
   - Métricas de progresso
   - Exportação de dados
   - Compartilhamento de conquistas

7. Perfil e Configurações:
   - Informações pessoais editáveis
   - Configurações de privacidade
   - Preferências de notificação
   - Integração com dispositivos
   - Gestão de assinatura

ANIMAÇÕES E TRANSIÇÕES:
- Transições suaves entre telas (300ms)
- Animações de loading com skeleton screens
- Micro-interações em botões e cards
- Parallax scroll em listas longas
- Animações de entrada/saída de modais

RESPONSIVIDADE:
- Layout adaptativo para iPhone SE até iPhone Pro Max
- Suporte a orientação landscape para análise de vídeo
- Ajuste automático de fonte para acessibilidade
- Otimização para diferentes densidades de tela

ESTADOS DE CARREGAMENTO:
- Skeleton screens para carregamento de listas
- Progress indicators para uploads
- Shimmer effects para cards
- Loading overlays para operações longas

FEEDBACK HÁPTICO:
- Vibração sutil para confirmações
- Feedback tátil em botões importantes
- Alertas hápticos para erros
- Confirmação tátil para ações críticas

ACESSIBILIDADE:
- VoiceOver support completo
- Dynamic Type support
- Contraste adequado (WCAG AA)
- Navegação por switch control
- Reduced motion support

TEMAS:
- Tema claro (padrão)
- Tema escuro com cores adaptadas
- Alternância automática baseada no sistema
- Persistência da preferência do usuário

PERSONALIZAÇÃO:
- Cores de marca para coaches
- Logo customizado para academias
- Temas personalizados (premium)
- Layout adaptável por tipo de usuário

PERFORMANCE DE UI:
- Lazy loading de imagens
- Virtualização de listas longas
- Otimização de re-renders
- Debounce em inputs de busca
- Cache de componentes pesados

INTEGRAÇÃO NATIVA iOS:
- Suporte a Shortcuts da Siri
- Widget para tela inicial
- Integração com Spotlight Search
- Suporte a Handoff entre dispositivos
- Integração com Apple Watch (futuro)

Implemente também:
- Sistema de notificações in-app
- Onboarding contextual para novas funcionalidades
- Tooltips e hints para primeira utilização
- Modo offline com sincronização automática
- Suporte a múltiplos idiomas (i18n)
```


## 2. Prompts para Preparação Android (Desenvolvimento Futuro)

### 2.1 Adaptações Específicas para Android

**Prompt para Trae IDE:**

```
Prepare o projeto React Native FitAnalyzer Pro para expansão Android com as seguintes adaptações específicas:

CONFIGURAÇÕES ANDROID:
- Target SDK: Android 13 (API 33)
- Minimum SDK: Android 8.0 (API 26)
- Gradle configuration otimizada
- ProGuard/R8 para ofuscação de código
- Configuração de signing para release

PERMISSÕES NECESSÁRIAS:
- CAMERA: Captura de vídeo
- RECORD_AUDIO: Gravação de áudio (opcional)
- WRITE_EXTERNAL_STORAGE: Salvamento de vídeos
- INTERNET: Comunicação com backend
- ACCESS_NETWORK_STATE: Verificação de conectividade
- WAKE_LOCK: Manter tela ativa durante gravação
- VIBRATE: Feedback háptico

INTEGRAÇÕES ANDROID-ESPECÍFICAS:
- Health Connect (substituto do Google Fit)
- Android Keystore para armazenamento seguro
- WorkManager para processamento em background
- Notification channels para notificações
- Adaptive icons para diferentes launchers

OTIMIZAÇÕES DE PERFORMANCE:
- Hermes JavaScript engine
- Bundle splitting por arquitetura (arm64, x86)
- Proguard rules para bibliotecas específicas
- Memory leak prevention
- Battery optimization whitelist

DESIGN ADAPTATIONS:
- Material Design 3 components
- Android-specific navigation patterns
- Floating Action Button positioning
- Status bar and navigation bar handling
- Adaptive layouts for different screen sizes

TESTING CONFIGURATION:
- Detox para testes E2E
- Jest para testes unitários
- Flipper integration para debugging
- Firebase Test Lab configuration
- Performance monitoring setup

DEPLOYMENT PREPARATION:
- Google Play Console configuration
- App Bundle generation
- Staged rollout strategy
- Crash reporting with Firebase Crashlytics
- Analytics with Firebase Analytics

COMPATIBILITY CONSIDERATIONS:
- Shared codebase maintenance
- Platform-specific code organization
- Conditional rendering for platform differences
- Native module bridging when needed
- Performance parity with iOS version
```

### 2.2 Configuração de Backend e APIs

**Prompt para Kiro:**

```
Desenvolva a arquitetura de backend completa para o FitAnalyzer Pro com microserviços escaláveis:

ARQUITETURA GERAL:
- API Gateway com Kong ou AWS API Gateway
- Microserviços em Node.js com Express/Fastify
- Banco de dados PostgreSQL para dados relacionais
- Redis para cache e sessões
- MongoDB para logs e analytics
- S3/CloudFlare R2 para armazenamento de vídeos

MICROSERVIÇOS PRINCIPAIS:

1. Authentication Service:
   - JWT token generation/validation
   - User registration and login
   - Password reset functionality
   - OAuth integration (Apple, Google)
   - Rate limiting and security

2. User Management Service:
   - User profile CRUD operations
   - User preferences and settings
   - Coach-athlete relationships
   - Subscription management
   - Data privacy controls

3. Video Processing Service:
   - Video upload handling
   - Compression and optimization
   - Metadata extraction
   - Queue management for processing
   - CDN integration for delivery

4. Analysis Service:
   - AI/ML model integration
   - Pose detection with MediaPipe
   - Biomechanical calculations
   - Results storage and retrieval
   - Model versioning and A/B testing

5. Reporting Service:
   - Report generation (PDF, Excel)
   - Data aggregation and analytics
   - Progress tracking
   - Comparative analysis
   - Export functionality

6. Notification Service:
   - Push notifications (FCM/APNS)
   - Email notifications
   - In-app notifications
   - Notification preferences
   - Delivery tracking

7. Payment Service:
   - Stripe integration for payments
   - Subscription lifecycle management
   - Invoice generation
   - Refund processing
   - Revenue analytics

API ENDPOINTS STRUCTURE:

Authentication:
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password

Users:
GET /users/profile
PUT /users/profile
GET /users/preferences
PUT /users/preferences
GET /users/subscription
POST /users/subscription/upgrade

Videos:
POST /videos/upload
GET /videos/:id
DELETE /videos/:id
GET /videos/user/:userId
POST /videos/:id/analyze

Analysis:
GET /analysis/:id
GET /analysis/user/:userId
POST /analysis/compare
GET /analysis/metrics/:videoId

Reports:
GET /reports/user/:userId
POST /reports/generate
GET /reports/:id/download
GET /reports/analytics

SECURITY IMPLEMENTATION:
- JWT with RS256 signing
- API rate limiting (100 req/min per user)
- Input validation with Joi/Yup
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js for security headers

DATABASE SCHEMA:
- Users table with encrypted PII
- Videos table with metadata
- Analysis results with JSON storage
- Subscriptions with payment history
- Audit logs for compliance
- Indexes for performance optimization

CACHING STRATEGY:
- Redis for session storage
- API response caching (5-60 minutes)
- Database query result caching
- CDN caching for static assets
- Cache invalidation strategies

MONITORING AND LOGGING:
- Structured logging with Winston
- Error tracking with Sentry
- Performance monitoring with New Relic
- Health check endpoints
- Metrics collection with Prometheus

DEPLOYMENT:
- Docker containerization
- Kubernetes orchestration
- CI/CD with GitHub Actions
- Blue-green deployment strategy
- Auto-scaling configuration
- Load balancing setup

TESTING:
- Unit tests with Jest
- Integration tests with Supertest
- Load testing with Artillery
- Security testing with OWASP ZAP
- API documentation with Swagger
```

### 2.3 Integração com Serviços de IA e Machine Learning

**Prompt para Kiro:**

```
Implemente a integração completa com serviços de IA e Machine Learning para análise de movimento:

PROCESSAMENTO LOCAL (ON-DEVICE):
- MediaPipe integration para detecção de pose
- TensorFlow Lite para modelos customizados
- Core ML (iOS) para otimização nativa
- ML Kit (Android) para funcionalidades básicas
- OpenCV para processamento de imagem

MODELOS DE IA CUSTOMIZADOS:

1. Pose Detection Model:
   - 33 landmarks corporais em 3D
   - Confiança por landmark
   - Tracking temporal entre frames
   - Normalização para diferentes alturas
   - Calibração automática de câmera

2. Exercise Classification Model:
   - Identificação automática do tipo de exercício
   - Classificação em tempo real
   - Suporte para múltiplos exercícios simultâneos
   - Adaptação para diferentes ângulos de câmera

3. Quality Assessment Model:
   - Avaliação da qualidade da gravação
   - Detecção de oclusões
   - Análise de iluminação
   - Verificação de enquadramento
   - Score de confiabilidade da análise

4. Biomechanical Analysis Model:
   - Cálculo de ângulos articulares
   - Análise de velocidade e aceleração
   - Detecção de assimetrias
   - Avaliação de padrões de movimento
   - Identificação de compensações

ALGORITMOS ESPECÍFICOS POR EXERCÍCIO:

Corrida/Caminhada:
- Detecção de ciclo de passada
- Cálculo de cadência automático
- Análise de aterrissagem do pé
- Medição de oscilação vertical
- Avaliação de eficiência energética

Salto Vertical:
- Detecção de fases (preparação, voo, aterrissagem)
- Cálculo de altura baseado em tempo de voo
- Análise de força explosiva
- Avaliação de técnica de decolagem
- Medição de estabilidade na aterrissagem

Agachamento:
- Detecção de amplitude de movimento
- Análise de alinhamento dos joelhos
- Avaliação da postura do tronco
- Medição de velocidade de execução
- Detecção de compensações laterais

PROCESSAMENTO EM NUVEM:
- Análises mais complexas que requerem maior poder computacional
- Modelos de deep learning pesados
- Análise comparativa com grandes datasets
- Machine learning para recomendações personalizadas
- Processamento de vídeos em lote

PIPELINE DE PROCESSAMENTO:

1. Pré-processamento:
   - Estabilização de vídeo
   - Normalização de iluminação
   - Redimensionamento para análise
   - Extração de frames-chave
   - Detecção de região de interesse

2. Análise Principal:
   - Detecção de pose frame por frame
   - Tracking temporal de landmarks
   - Cálculo de métricas biomecânicas
   - Identificação de padrões
   - Geração de scores

3. Pós-processamento:
   - Suavização de dados temporais
   - Correção de outliers
   - Interpolação de dados faltantes
   - Cálculo de métricas agregadas
   - Geração de recomendações

OTIMIZAÇÕES DE PERFORMANCE:
- Processamento paralelo de frames
- Uso eficiente de GPU quando disponível
- Cache de resultados intermediários
- Processamento adaptativo baseado no dispositivo
- Fallback para processamento em nuvem

QUALIDADE E VALIDAÇÃO:
- Validação científica dos algoritmos
- Comparação com sistemas gold standard
- Testes com diferentes populações
- Calibração para diferentes tipos corporais
- Métricas de precisão e recall

VERSIONAMENTO DE MODELOS:
- Sistema de versionamento semântico
- A/B testing de novos modelos
- Rollback automático em caso de problemas
- Métricas de performance por versão
- Atualização gradual de modelos

INTEGRAÇÃO COM DISPOSITIVOS EXTERNOS:
- Sensores IMU para dados complementares
- Sincronização com wearables
- Fusão de dados multi-sensor
- Calibração automática de sensores
- Compensação de drift temporal

PRIVACIDADE E SEGURANÇA:
- Processamento local quando possível
- Criptografia de dados em trânsito
- Anonimização para análises agregadas
- Consentimento explícito para uso de dados
- Compliance com LGPD/GDPR

APIS DE MACHINE LEARNING:
- Endpoint para análise de vídeo único
- Batch processing para múltiplos vídeos
- Real-time analysis para feedback ao vivo
- Model inference com diferentes configurações
- Custom model deployment para clientes enterprise
```

## 3. Prompts para Integração e Deployment

### 3.1 Sistema de Pagamentos e Monetização

**Prompt para Trae IDE:**

```
Implemente um sistema completo de pagamentos e monetização para o modelo freemium do FitAnalyzer Pro:

INTEGRAÇÃO COM STRIPE:
- Configuração de webhook endpoints
- Processamento de pagamentos recorrentes
- Gestão de assinaturas e upgrades
- Handling de falhas de pagamento
- Suporte a múltiplas moedas (BRL, USD, EUR)

PLANOS DE ASSINATURA:
1. Gratuito (Starter):
   - 5 análises por mês
   - Funcionalidades básicas
   - Suporte por email

2. Básico (R$ 19,90/mês):
   - Análises ilimitadas
   - Relatórios avançados
   - Integração com wearables

3. Pro (R$ 39,90/mês):
   - Análise multi-ângulo
   - Planos personalizados
   - API access

4. Coach (R$ 79,90/mês):
   - Gestão de atletas
   - Dashboard de grupo
   - White-label options

FUNCIONALIDADES DE PAGAMENTO:
- Upgrade/downgrade de planos
- Cancelamento com retenção
- Reembolsos automáticos
- Gestão de cartões de crédito
- Histórico de faturas
- Notificações de cobrança

PAYWALL IMPLEMENTATION:
- Soft paywall para funcionalidades premium
- Trial periods para novos usuários
- Usage-based limitations
- Graceful degradation de funcionalidades
- Clear value proposition

ANALYTICS DE MONETIZAÇÃO:
- Conversion funnel tracking
- Churn analysis
- Revenue per user (ARPU)
- Lifetime value (LTV)
- Payment success rates

COMPLIANCE:
- PCI DSS compliance
- LGPD compliance para dados de pagamento
- Secure storage de informações sensíveis
- Audit trails para transações
- Fraud detection integration
```

### 3.2 Deployment e DevOps

**Prompt para Kiro:**

```
Configure um pipeline completo de CI/CD e infraestrutura para o FitAnalyzer Pro:

CI/CD PIPELINE:
- GitHub Actions para automação
- Automated testing (unit, integration, E2E)
- Code quality checks (ESLint, SonarQube)
- Security scanning (Snyk, OWASP)
- Automated deployment para staging/production

INFRASTRUCTURE AS CODE:
- Terraform para provisionamento
- Kubernetes manifests para deployment
- Helm charts para configuração
- Environment-specific configurations
- Secrets management com Vault

MONITORING E OBSERVABILITY:
- Application Performance Monitoring (APM)
- Error tracking e alerting
- Log aggregation e analysis
- Metrics collection e dashboards
- Uptime monitoring

BACKUP E DISASTER RECOVERY:
- Automated database backups
- Cross-region replication
- Point-in-time recovery
- Disaster recovery procedures
- Business continuity planning

SECURITY:
- Network security groups
- SSL/TLS termination
- WAF (Web Application Firewall)
- DDoS protection
- Vulnerability scanning

SCALABILITY:
- Horizontal pod autoscaling
- Database read replicas
- CDN para static assets
- Load balancing strategies
- Performance optimization
```

## 4. Prompts para Funcionalidades Avançadas

### 4.1 Sistema de Coaching e Comunidade

**Prompt para Trae IDE:**

```
Desenvolva funcionalidades avançadas de coaching e comunidade para o FitAnalyzer Pro:

DASHBOARD DO COACH:
- Visão geral de todos os atletas
- Métricas de performance agregadas
- Alertas de progresso e regressão
- Ferramentas de comunicação
- Planejamento de treinos

GESTÃO DE ATLETAS:
- Perfis detalhados de atletas
- Histórico completo de análises
- Comparação entre atletas
- Definição de metas individuais
- Tracking de progresso

PLANOS DE TREINAMENTO:
- Criação de planos personalizados
- Biblioteca de exercícios
- Progressão automática
- Adaptação baseada em performance
- Compartilhamento entre coaches

COMUNICAÇÃO:
- Chat integrado coach-atleta
- Feedback em vídeos específicos
- Notificações de progresso
- Agendamento de sessões
- Videoconferência integrada

MARKETPLACE:
- Venda de planos de treinamento
- Sistema de avaliações
- Revenue sharing
- Certificação de coaches
- Programa de afiliados

COMUNIDADE:
- Grupos de treinamento
- Desafios e competições
- Ranking de performance
- Compartilhamento de conquistas
- Fóruns de discussão

GAMIFICAÇÃO:
- Sistema de pontos e badges
- Streaks de consistência
- Leaderboards
- Desafios semanais
- Recompensas por progresso
```

### 4.2 Análise Preditiva e IA Avançada

**Prompt para Kiro:**

```
Implemente funcionalidades avançadas de análise preditiva e IA para o FitAnalyzer Pro:

ANÁLISE PREDITIVA:
- Predição de risco de lesão
- Estimativa de performance futura
- Recomendações de treinamento
- Identificação de padrões de fadiga
- Otimização de periodização

MACHINE LEARNING AVANÇADO:
- Modelos de deep learning para análise complexa
- Transfer learning para novos exercícios
- Reinforcement learning para recomendações
- Ensemble methods para maior precisão
- AutoML para otimização de modelos

ANÁLISE COMPARATIVA:
- Benchmarking com população similar
- Comparação com atletas elite
- Análise de progressão típica
- Identificação de outliers
- Recomendações baseadas em similaridade

INSIGHTS PERSONALIZADOS:
- Análise de padrões individuais
- Identificação de pontos fortes/fracos
- Recomendações de melhoria específicas
- Alertas de regressão
- Sugestões de exercícios complementares

INTEGRAÇÃO COM DADOS EXTERNOS:
- Dados meteorológicos para corrida
- Informações de sono e recuperação
- Dados nutricionais
- Stress e bem-estar
- Ciclo menstrual (para atletas femininas)

RESEARCH E DESENVOLVIMENTO:
- Colaboração com universidades
- Validação científica de algoritmos
- Publicação de estudos
- Contribuição para conhecimento científico
- Ethical AI practices
```

---

## 5. Considerações Finais e Melhores Práticas

### 5.1 Vibe Coding e Desenvolvimento Ágil

Para maximizar a eficiência do desenvolvimento utilizando Trae IDE e Kiro em um ambiente de "vibe coding", recomenda-se:

**Iteração Rápida**: Utilize os prompts em ciclos curtos de desenvolvimento, testando funcionalidades incrementalmente antes de prosseguir para a próxima.

**Feedback Contínuo**: Implemente analytics desde o início para coletar dados de uso real e iterar baseado em comportamento dos usuários.

**Prototipagem Rápida**: Use os prompts para criar protótipos funcionais rapidamente, validando conceitos antes do desenvolvimento completo.

**Colaboração Efetiva**: Compartilhe prompts e resultados entre membros da equipe para manter consistência e acelerar o desenvolvimento.

### 5.2 Qualidade e Manutenibilidade

**Testes Automatizados**: Cada prompt deve incluir considerações para testes unitários, integração e E2E.

**Documentação Viva**: Mantenha documentação atualizada automaticamente através de comentários no código e ferramentas de documentação.

**Code Review**: Estabeleça processo de revisão de código mesmo em ambiente de desenvolvimento rápido.

**Refatoração Contínua**: Reserve tempo para refatoração e otimização do código gerado pelos prompts.

### 5.3 Escalabilidade e Performance

**Arquitetura Modular**: Utilize os prompts para criar componentes e serviços independentes que possam escalar separadamente.

**Otimização Prematura**: Evite otimizações prematuras, mas mantenha considerações de performance em mente desde o início.

**Monitoramento**: Implemente monitoramento e métricas desde as primeiras versões para identificar gargalos cedo.

---

**Documento preparado por Manus AI**  
**Data: 20 de Julho de 2025**  
**Versão: 1.0**

