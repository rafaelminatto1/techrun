# Diagramas e Fluxogramas do Sistema
## App de Avaliação de Corredores e Exercícios

**Autor**: Manus AI  
**Data**: 20 de Julho de 2025  
**Versão**: 1.0

---

## Sumário

Este documento apresenta os diagramas e fluxogramas essenciais para o desenvolvimento do aplicativo de avaliação de corredores e exercícios. Os diagramas foram criados para facilitar a compreensão da arquitetura do sistema, fluxos de usuário, e estrutura de dados.

---

## 1. Fluxograma Principal do Aplicativo

O fluxograma principal ilustra o fluxo completo de navegação do usuário desde o primeiro acesso até as funcionalidades principais do aplicativo. Este diagrama mostra:

- Processo de autenticação e registro
- Diferentes tipos de usuário (atleta, coach, fisioterapeuta)
- Fluxo de captura e análise de vídeo
- Sistema freemium com ofertas de upgrade
- Funcionalidades de histórico e relatórios

![Fluxograma Principal](https://private-us-east-1.manuscdn.com/sessionFile/EX9dK4ZVnYez1MPQmLaTvD/sandbox/ZIvS1T6Hj1KyUl3AmQc7RU-images_1752983958401_na1fn_L2hvbWUvdWJ1bnR1L2ZsdXhvZ3JhbWFfcHJpbmNpcGFs.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRVg5ZEs0WlZuWWV6MU1QUW1MYVR2RC9zYW5kYm94L1pJdlMxVDZIajFLeVVsM0FtUWM3UlUtaW1hZ2VzXzE3NTI5ODM5NTg0MDFfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyWnNkWGh2WjNKaGJXRmZjSEpwYm1OcGNHRnMucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LLBzMdNldAWL9eCRE8j1~ZEPpn2ICIkRGWvf9mJXE~mE16GFFg5FPCF9nFxWXlbEQJ820uIjnlNr6kitF5adufmaIAhy29qjtf3OmKvjaBaFeyQn2UqlnLJ8wgQmxTQcg6HBMLbRMNCIQlnyTYIbW-mbXnzrIxqdDDgwJuwaCP0fRFqqokUsd9CBHGObjVhZh9FIIWOIrHW5dNBX6SEMCSJdpTUlqPUyRyaLbCFw3vxVhhpqNORLKAImkzam~HkZY9Aal3QbL7UcNgTONaSWQIRZ42m-89VqtXltJTVHjUBpMgzKrR61jFYHeefLgjTgQ36l8~BuQY1pcuIJzpgSRA__)

### Pontos Principais:
- **Onboarding Simplificado**: O processo de registro é direto, com diferenciação clara entre tipos de usuário
- **Análise Inteligente**: O sistema decide automaticamente entre processamento local ou em nuvem
- **Monetização Integrada**: Ofertas de upgrade são apresentadas naturalmente no fluxo
- **Experiência Personalizada**: Funcionalidades adaptadas ao tipo de usuário

---

## 2. Arquitetura do Sistema

O diagrama de arquitetura apresenta a estrutura técnica completa do sistema, incluindo todos os componentes de frontend, backend, e infraestrutura necessários.

![Arquitetura do Sistema](https://private-us-east-1.manuscdn.com/sessionFile/EX9dK4ZVnYez1MPQmLaTvD/sandbox/ZIvS1T6Hj1KyUl3AmQc7RU-images_1752983958402_na1fn_L2hvbWUvdWJ1bnR1L2FycXVpdGV0dXJhX3Npc3RlbWE.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRVg5ZEs0WlZuWWV6MU1QUW1MYVR2RC9zYW5kYm94L1pJdlMxVDZIajFLeVVsM0FtUWM3UlUtaW1hZ2VzXzE3NTI5ODM5NTg0MDJfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyRnljWFZwZEdWMGRYSmhYM05wYzNSbGJXRS5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Y7aSWSGgiMiBNJFzfJ1Ny1crSSfqKXz3NiPTi6j4X4IkGaVitCmxfW10x-uVpXA1l0b9fmyP-wEAkP1dfsmafvhIC8y32VOtjT-Ub4fOgpPIOgCon4DLYy90mLMzzlbJKwZpNg8hXTuPyiTzveZBKcQUsWVPd4~Ti90pIqHA1pD1t7PzkFB7hGoofBL2vBX3xcruVZ7Hzv9KyYL9MhOil3kpXsRtcPfq-MGC6mm-w9OTWCNtLFZkayZfCQ5HTAqKsZYt~ykCJvyUgG3yV0Ec2SI~hrUImSCrHkscUscCR9T-zc4zCzPhTEhhvEwkSsrlbu6vBo1caDti3lz4qoq2Rw__)

### Componentes Principais:

**Frontend Mobile:**
- Aplicativo React Native único para iOS e Android
- Interface adaptativa para diferentes tipos de usuário

**API Gateway:**
- Load balancer para distribuição de carga
- Serviço de autenticação centralizado
- Rate limiting e versionamento de APIs

**Microserviços:**
- Serviços especializados para cada funcionalidade
- Escalabilidade independente de cada componente
- Comunicação via APIs REST e filas de mensagem

**AI/ML Services:**
- MediaPipe para análise de pose
- OpenCV para processamento de vídeo
- Modelos customizados para análises específicas

**Infraestrutura:**
- Containerização com Docker
- Orquestração com Kubernetes
- Monitoramento e CI/CD integrados

---

## 3. Modelo de Dados (Diagrama ER)

O diagrama entidade-relacionamento mostra a estrutura completa do banco de dados, incluindo todas as entidades principais e seus relacionamentos.

![Diagrama de Banco de Dados](https://private-us-east-1.manuscdn.com/sessionFile/EX9dK4ZVnYez1MPQmLaTvD/sandbox/ZIvS1T6Hj1KyUl3AmQc7RU-images_1752983958403_na1fn_L2hvbWUvdWJ1bnR1L2RpYWdyYW1hX2JhbmNv.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRVg5ZEs0WlZuWWV6MU1QUW1MYVR2RC9zYW5kYm94L1pJdlMxVDZIajFLeVVsM0FtUWM3UlUtaW1hZ2VzXzE3NTI5ODM5NTg0MDNfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyUnBZV2R5WVcxaFgySmhibU52LnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=gR5-uv758NsUM9~ZmXr9NMpCCVd3WKz4-I6pcuhRQWQEkHpj0LExG2EaAJWiYFGVwd4pDaQqLEsnLK7QdgK0dyLspLVgZ3o9T6fH~LNmvId1J7ORuEBdMV~-t5caGtV2IV~ithhRn-SvqO-L7s3V6NSwhJAGqudtAJUrQBM7SYuTXtCc8bTiicMpNfbr~3zeQyMie5pcHuHXAZyqV4GaDqGXvfespMSq6YbmlcM5SQa1BqzeAJrcqvs3X4DuXUWJ~ACWXwbR90fcrSoe6mzuqhI6Da23Gesa7jHXsCZG2LRSjYHmFKrm75ZGquqQm-p39OSLT1-LSQVNzOOT8YPjPA__)

### Entidades Principais:

**USERS**: Informações centrais dos usuários com suporte a múltiplos tipos
**VIDEOS**: Armazenamento de vídeos com metadados completos
**ANALYSES**: Resultados das análises de IA com versionamento
**TRAINING_SESSIONS**: Sessões de treinamento com métricas
**REPORTS**: Relatórios gerados automaticamente
**SUBSCRIPTIONS**: Gestão do modelo freemium

### Relacionamentos Chave:
- Usuários podem ter múltiplos vídeos e análises
- Coaches podem gerenciar múltiplos atletas
- Sistema de assinaturas flexível
- Integrações com dispositivos externos

---

## 4. Fluxo de Análise de Vídeo

Este fluxograma detalha o processo core do aplicativo: a captura e análise de vídeos de exercícios.

![Fluxo de Análise de Vídeo](https://private-us-east-1.manuscdn.com/sessionFile/EX9dK4ZVnYez1MPQmLaTvD/sandbox/ZIvS1T6Hj1KyUl3AmQc7RU-images_1752983958403_na1fn_L2hvbWUvdWJ1bnR1L2ZsdXhvX2FuYWxpc2VfdmlkZW8.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRVg5ZEs0WlZuWWV6MU1QUW1MYVR2RC9zYW5kYm94L1pJdlMxVDZIajFLeVVsM0FtUWM3UlUtaW1hZ2VzXzE3NTI5ODM5NTg0MDNfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyWnNkWGh2WDJGdVlXeHBjMlZmZG1sa1pXOC5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Pn0S-IIviyjoJH1YXtOD03T7wYPU7bP0N9IheBi4nNY1FNSOqe7J2aS34N8fWPiCyBRe7l~pOMXhF6He08LSFV5CC2v5WeLzflknZknWAtdWZhzxiHSg9gus3bIwDdX5ZBulyLdi2yj3J332Pmg1m8BzE2z7kNYd9fxtPGSe5Dv9jZpI0Qep1sZwRs1RjTipLg61Mh5aF2Msdion7y-s0LU3jiqYdXGTuRXByG-4Bfo6dhVTYhGdrscW3PDSwJewHOoMfzbP5lYl1ZKC8fv49OEvyCy72PYSIm6VWxIJCvlqTf7cMYXWRQQ7PT79pf39tAgvGCfTYNidr0rRfsSwxQ__)

### Etapas do Processo:

**Configuração e Calibração:**
- Ajuste automático de parâmetros da câmera
- Calibração baseada no ambiente
- Validação de qualidade em tempo real

**Processamento em Tempo Real:**
- Detecção de pose com MediaPipe
- Feedback visual imediato
- Alertas de reposicionamento quando necessário

**Análise Pós-Processamento:**
- Decisão inteligente entre processamento local/nuvem
- Cálculo de métricas biomecânicas avançadas
- Geração de recomendações personalizadas

**Apresentação de Resultados:**
- Diferenciação entre usuários gratuitos e premium
- Múltiplos formatos de exportação
- Integração com histórico e relatórios

---

## 5. Wireframes Conceituais

### 5.1 Tela Principal (Dashboard)

```
┌─────────────────────────────────┐
│ ☰  FitAnalyzer Pro         👤  │
├─────────────────────────────────┤
│                                 │
│  📊 Seu Progresso Esta Semana   │
│  ┌─────────────────────────────┐ │
│  │ Score Médio: 78/100        │ │
│  │ Análises: 5                │ │
│  │ Melhoria: +12%             │ │
│  └─────────────────────────────┘ │
│                                 │
│  🎯 Ações Rápidas               │
│  ┌─────────┐ ┌─────────┐       │
│  │ 📹 Nova │ │ 📊 Ver  │       │
│  │ Análise │ │ Histórico│       │
│  └─────────┘ └─────────┘       │
│                                 │
│  📈 Últimas Análises            │
│  ┌─────────────────────────────┐ │
│  │ 🏃 Corrida - 82/100        │ │
│  │ 🦵 Agachamento - 75/100    │ │
│  │ 🏃 Corrida - 79/100        │ │
│  └─────────────────────────────┘ │
│                                 │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 🏠  │ │ 📹  │ │ 📊  │ │ ⚙️  │ │
│ │Home │ │Gravar│ │Dados│ │Conf │ │
│ └─────┘ └─────┘ └─────┘ └─────┘ │
└─────────────────────────────────┘
```

### 5.2 Tela de Análise de Vídeo

```
┌─────────────────────────────────┐
│ ← Análise de Corrida            │
├─────────────────────────────────┤
│                                 │
│  🎥 [Vídeo com Overlay]         │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │    👤 Skeleton Overlay      │ │
│  │    📐 Ângulos Articulares   │ │
│  │    📏 Métricas em Tempo Real│ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                 │
│  📊 Resultados da Análise       │
│  ┌─────────────────────────────┐ │
│  │ Score Geral: 82/100         │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐     │ │
│  │ │Postura│Cadência│Pisada│     │ │
│  │ │ 85/100│ 78/100│ 84/100│     │ │
│  │ └─────┘ └─────┘ └─────┘     │ │
│  └─────────────────────────────┘ │
│                                 │
│  💡 Recomendações               │
│  • Aumentar cadência em 5%      │
│  • Melhorar postura do tronco   │
│  • Exercícios de fortalecimento │
│                                 │
│ ┌─────────┐ ┌─────────┐         │
│ │ 💾 Salvar│ │ 📤 Compartilhar│   │
│ └─────────┘ └─────────┘         │
└─────────────────────────────────┘
```

### 5.3 Tela de Relatórios

```
┌─────────────────────────────────┐
│ ← Relatórios de Progresso       │
├─────────────────────────────────┤
│                                 │
│  📅 Período: Últimos 30 dias    │
│  ┌─────────────────────────────┐ │
│  │ 📈 Gráfico de Evolução      │ │
│  │     Score                   │ │
│  │ 100 ┌─────────────────────┐ │ │
│  │  80 │     ╱╲    ╱╲       │ │ │
│  │  60 │   ╱    ╲ ╱   ╲     │ │ │
│  │  40 │ ╱       ╲      ╲   │ │ │
│  │  20 └─────────────────────┘ │ │
│  │     1  7  14  21  28  30    │ │
│  └─────────────────────────────┘ │
│                                 │
│  📊 Estatísticas                │
│  ┌─────────────────────────────┐ │
│  │ Análises Realizadas: 12     │ │
│  │ Score Médio: 78/100         │ │
│  │ Melhoria Total: +15%        │ │
│  │ Exercício Favorito: Corrida │ │
│  └─────────────────────────────┘ │
│                                 │
│  🎯 Metas e Objetivos           │
│  ┌─────────────────────────────┐ │
│  │ ✅ Score > 80: 8/12         │ │
│  │ 🔄 Consistência: 75%        │ │
│  │ 🎯 Próxima Meta: Score 85   │ │
│  └─────────────────────────────┘ │
│                                 │
│ ┌─────────┐ ┌─────────┐         │
│ │ 📄 PDF  │ │ 📧 Enviar│         │
│ └─────────┘ └─────────┘         │
└─────────────────────────────────┘
```

---

## 6. Considerações de Design

### 6.1 Princípios de UX/UI

**Simplicidade**: Interface limpa focada nas funcionalidades essenciais
**Feedback Visual**: Informações claras sobre o status das operações
**Acessibilidade**: Suporte a diferentes tamanhos de tela e necessidades especiais
**Consistência**: Padrões visuais uniformes em todo o aplicativo

### 6.2 Responsividade

Os wireframes devem ser adaptados para:
- **Smartphones**: Layout vertical otimizado
- **Tablets**: Aproveitamento do espaço adicional
- **Diferentes Resoluções**: Escalabilidade automática

### 6.3 Temas e Personalização

- **Tema Claro/Escuro**: Alternância baseada na preferência do usuário
- **Cores de Marca**: Paleta consistente com identidade visual
- **Personalização**: Opções de customização para coaches e academias

---

## 7. Próximos Passos

### 7.1 Validação dos Diagramas

- Revisão com stakeholders técnicos
- Validação da arquitetura com especialistas
- Teste de usabilidade dos wireframes

### 7.2 Detalhamento Técnico

- Especificação detalhada de APIs
- Definição de schemas de banco de dados
- Documentação de algoritmos de análise

### 7.3 Prototipagem

- Criação de protótipos interativos
- Testes com usuários reais
- Iteração baseada em feedback

---

**Documento preparado por Manus AI**  
**Data: 20 de Julho de 2025**  
**Versão: 1.0**

