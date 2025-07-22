# TechRun

Aplicativo React Native para análise de exercícios físicos com IA.

## 🚀 Funcionalidades Implementadas

### ✅ Módulo de Captura de Vídeo
- 📱 Interface de gravação com react-native-vision-camera
- 🎯 Seletor de tipo de exercício (Geral, Agachamento, Flexão, Prancha)
- ⏱️ Timer de gravação em tempo real
- 🎨 Guias visuais de posicionamento
- 📱 Animações fluidas com Reanimated

### 🤖 Análise de Movimento com IA
- 🔍 Detecção de pose usando ML Kit
- 📊 Análise específica por tipo de exercício
- 💯 Pontuação de forma e técnica
- 📈 Métricas detalhadas (repetições, duração, calorias)
- 💬 Feedback personalizado em tempo real

### 🏗️ Arquitetura Robusta
- 🔄 Gerenciamento de estado com Redux Toolkit
- 🧭 Navegação com React Navigation
- 🎨 Sistema de design consistente
- 🔧 Hooks personalizados reutilizáveis
- 📱 Componentes de UI modulares

### 🔐 Sistema de Autenticação
- 👤 Login e registro de usuários
- 🔒 Autenticação segura
- 👥 Gerenciamento de perfil
- 🔄 Persistência de sessão

### 📊 Dashboard e Relatórios
- 📈 Métricas de progresso
- 📋 Histórico de exercícios
- 🎯 Metas e objetivos
- 📊 Visualização de dados

## 🔐 Permissões Necessárias

### Android
- Câmera
- Microfone
- Armazenamento (leitura/escrita)
- Internet

### iOS
- Câmera
- Microfone
- Galeria de fotos

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **TypeScript** - Tipagem estática
- **Redux Toolkit** - Gerenciamento de estado
- **React Navigation** - Navegação
- **React Native Vision Camera** - Captura de vídeo
- **ML Kit Pose Detection** - Análise de movimento
- **React Native Reanimated** - Animações
- **React Native Permissions** - Gerenciamento de permissões

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS - apenas macOS)

### Instalação Rápida

```bash
# Clone o repositório
git clone <repository-url>
cd techrun

# Execute o script de configuração automática
node setup.js
```

### Instalação Manual

```bash
# Instalar dependências
npm install

# Para iOS (apenas macOS)
cd ios && pod install && cd ..

# Para Android - certifique-se de ter o Android SDK configurado
```

### Executar o Projeto

```bash
# Iniciar o Metro bundler
npm start

# Em outro terminal:
# Para Android
npx react-native run-android

# Para iOS
npx react-native run-ios
```

## 🔐 Permissões Necessárias

### Android
- Câmera
- Microfone
- Armazenamento (leitura/escrita)
- Internet

### iOS
- Câmera
- Microfone
- Galeria de fotos

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── base/           # Componentes básicos (Button, Input, Card)
│   └── common/         # Componentes comuns (Header, LoadingSpinner)
├── screens/            # Telas do aplicativo
│   ├── auth/          # Telas de autenticação
│   ├── dashboard/     # Dashboard principal
│   ├── profile/       # Perfil do usuário
│   └── video/         # Gravação e análise de vídeo
├── navigation/         # Configuração de navegação
├── store/             # Redux store e slices
├── services/          # Serviços (API, análise de pose)
├── hooks/             # Hooks personalizados
├── utils/             # Utilitários e helpers
├── types/             # Definições de tipos TypeScript
└── assets/            # Imagens, ícones, etc.
```

## 🚀 Próximos Passos (Roadmap)

### Fase 1 - MVP (Concluída) ✅
- [x] Estrutura base do projeto
- [x] Sistema de navegação
- [x] Componentes de UI básicos
- [x] Captura de vídeo
- [x] Análise de pose com ML Kit
- [x] Sistema de autenticação
- [x] Configurações de permissões

### Fase 2 - Melhorias (Em Desenvolvimento) 🔄
- [ ] Backend completo com API REST
- [ ] Sincronização em nuvem
- [ ] Análise avançada de exercícios
- [ ] Sistema de gamificação
- [ ] Notificações push
- [ ] Modo offline

### Fase 3 - Recursos Avançados (Planejado) 📋
- [ ] IA personalizada por usuário
- [ ] Integração com wearables
- [ ] Análise biomecânica avançada
- [ ] Planos de treino personalizados
- [ ] Comunidade e social features
- [ ] Marketplace de treinos

## 🐛 Solução de Problemas

### Problemas Comuns

```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Limpar build Android
cd android && ./gradlew clean && cd ..

# Limpar build iOS
cd ios && xcodebuild clean && cd ..

# Reinstalar dependências
rm -rf node_modules && npm install

# Reinstalar pods (iOS)
cd ios && rm -rf Pods && pod install && cd ..
```

### Permissões não funcionando
- Verifique se as permissões estão declaradas corretamente
- Teste em dispositivo físico (permissões podem não funcionar no simulador)
- Reinstale o app após adicionar novas permissões

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através dos issues do GitHub.

---

**TechRun** - Transformando a forma como você treina! 🏃‍♂️💪