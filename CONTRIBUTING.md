# 🤝 Contribuindo para o TechRun

Obrigado por considerar contribuir para o TechRun! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

Este projeto adere ao código de conduta. Ao participar, você deve manter este código.

## 🚀 Como Contribuir

### 🐛 Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/rafaelminatto1/techrun/issues)
2. Se não encontrar, crie uma nova issue usando o template de bug report
3. Inclua o máximo de detalhes possível

### ✨ Sugerindo Funcionalidades

1. Verifique se a funcionalidade já foi sugerida nas [Issues](https://github.com/rafaelminatto1/techrun/issues)
2. Crie uma nova issue usando o template de feature request
3. Descreva claramente a funcionalidade e sua justificativa

### 💻 Contribuindo com Código

#### Configuração do Ambiente

1. **Fork** o repositório
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/SEU_USUARIO/techrun.git
   cd techrun
   ```

3. **Instale as dependências**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

4. **Configure o ambiente**:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

#### Fluxo de Desenvolvimento

1. **Crie uma branch** para sua funcionalidade:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Faça suas alterações** seguindo as convenções do projeto

3. **Teste suas alterações**:
   ```bash
   npm test
   npm run lint
   ```

4. **Commit suas alterações**:
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   ```

5. **Push para sua branch**:
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```

6. **Abra um Pull Request** usando o template fornecido

## 📝 Convenções de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `test:` adição ou correção de testes
- `chore:` mudanças no build, CI, etc

### Código

- Use **TypeScript** para tipagem
- Siga as regras do **ESLint** e **Prettier**
- Escreva **testes** para novas funcionalidades
- Use **nomes descritivos** para variáveis e funções
- Adicione **comentários** em código complexo

### Estrutura de Arquivos

```
src/
├── components/     # Componentes reutilizáveis
├── screens/        # Telas da aplicação
├── services/       # Serviços e APIs
├── hooks/          # Hooks customizados
├── utils/          # Utilitários
├── types/          # Tipos TypeScript
└── store/          # Estado global (Redux)
```

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes acima de 80%
- Use **Jest** para testes unitários
- Use **React Native Testing Library** para testes de componentes

## 📱 Testando em Dispositivos

### Android
```bash
npx react-native run-android
```

### iOS
```bash
npx react-native run-ios
```

## 🔍 Revisão de Código

Todos os PRs passam por revisão. Certifique-se de:

- [ ] Código está bem documentado
- [ ] Testes estão passando
- [ ] Não há conflitos de merge
- [ ] Segue as convenções do projeto

## 📞 Precisa de Ajuda?

- Abra uma [Issue](https://github.com/rafaelminatto1/techrun/issues) com a tag `question`
- Entre em contato com os mantenedores

## 🎉 Reconhecimento

Todos os contribuidores serão reconhecidos no README do projeto!

Obrigado por contribuir! 🚀