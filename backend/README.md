# TechRun Backend API

Backend Node.js/Express para o aplicativo TechRun de análise de exercícios com IA.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor de desenvolvimento
npm start

# Ou com nodemon para desenvolvimento
npm run dev
```

### Configuração do Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Servidor
NODE_ENV=development
PORT=5000

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/techrun

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRE=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

## 📚 Documentação da API

### Base URL
```
http://localhost:5000/api
```

### Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Obter perfil (autenticado)
- `PUT /auth/profile` - Atualizar perfil (autenticado)
- `PUT /auth/change-password` - Alterar senha (autenticado)

#### Vídeos
- `POST /videos/upload` - Upload de vídeo (autenticado)
- `GET /videos` - Listar vídeos do usuário (autenticado)
- `GET /videos/:id` - Obter vídeo específico (autenticado)
- `PUT /videos/:id` - Atualizar vídeo (autenticado)
- `DELETE /videos/:id` - Deletar vídeo (autenticado)
- `GET /videos/stats/overview` - Estatísticas de vídeos (autenticado)

#### Análise
- `POST /analysis/start` - Iniciar análise de vídeo (autenticado)
- `GET /analysis/:id` - Obter resultado da análise (autenticado)
- `GET /analysis` - Listar análises do usuário (autenticado)
- `GET /analysis/stats/overview` - Estatísticas de análises (autenticado)
- `PUT /analysis/:id` - Atualizar análise (favoritar, notas) (autenticado)
- `DELETE /analysis/:id` - Deletar análise (autenticado)

#### Usuários
- `GET /users/profile` - Perfil do usuário (autenticado)
- `PUT /users/profile` - Atualizar perfil (autenticado)
- `PUT /users/change-password` - Alterar senha (autenticado)
- `PUT /users/privacy` - Configurações de privacidade (autenticado)
- `PUT /users/notifications` - Configurações de notificação (autenticado)
- `GET /users/stats` - Estatísticas do usuário (autenticado)
- `DELETE /users/account` - Deletar conta (autenticado)

#### Dashboard
- `GET /dashboard/overview` - Dados gerais do dashboard (autenticado)
- `GET /dashboard/progress` - Progresso do usuário (autenticado)
- `GET /dashboard/recent-analyses` - Análises recentes (autenticado)
- `GET /dashboard/recent-videos` - Vídeos recentes (autenticado)
- `GET /dashboard/achievements` - Conquistas do usuário (autenticado)

### Health Check
- `GET /health` - Status do servidor

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu-jwt-token>
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── database.js          # Configuração do MongoDB
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   └── errorHandler.js      # Tratamento de erros
├── models/
│   ├── User.js              # Modelo de usuário
│   ├── Video.js             # Modelo de vídeo
│   └── Analysis.js          # Modelo de análise
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── videos.js            # Rotas de vídeos
│   ├── analysis.js          # Rotas de análise
│   ├── users.js             # Rotas de usuários
│   └── dashboard.js         # Rotas do dashboard
└── server.js                # Servidor principal
```

## 🛡️ Segurança

- **Helmet**: Proteção de headers HTTP
- **CORS**: Configuração de origem cruzada
- **Rate Limiting**: Limitação de requisições
- **JWT**: Autenticação segura
- **Bcrypt**: Hash de senhas
- **Validação**: express-validator para validação de dados

## 📊 Modelos de Dados

### User
- Informações pessoais e perfil
- Configurações de privacidade e notificações
- Estatísticas de uso
- Sistema de roles (user, admin)

### Video
- Metadados do arquivo
- Informações do exercício
- Status de processamento
- Configurações de privacidade

### Analysis
- Resultados da análise de pose
- Métricas específicas por exercício
- Feedback detalhado
- Dados de landmarks do MediaPipe

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🚀 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=jwt-secret-super-seguro-producao
CORS_ORIGIN=https://seudominio.com
```

### Scripts Disponíveis

- `npm start` - Iniciar servidor
- `npm run dev` - Desenvolvimento com nodemon
- `npm test` - Executar testes
- `npm run lint` - Verificar código com ESLint

## 📝 Logs

O servidor usa Morgan para logging HTTP em desenvolvimento e produção.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.