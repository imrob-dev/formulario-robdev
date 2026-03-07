# 📋 Formulário RobDev

Um sistema moderno de formulários desenvolvido para agilizar a coleta de dados e geração de documentos, focado em performance e experiência do usuário.

## ✨ Tecnologias

Este projeto utiliza o que há de mais moderno no desenvolvimento web:

- **⚡ Next.js 16** - Framework React para produção com App Router
- **📘 TypeScript 5** - Tipagem estática para maior segurança no desenvolvimento
- **🎨 Tailwind CSS 4** - Estilização moderna e responsiva
- **🧩 shadcn/ui** - Componentes de interface acessíveis e elegantes
- **🗄️ Prisma** - ORM de próxima geração para integração com banco de dados
- **📄 PDF Generation** - API integrada para geração de documentos PDF

## 🛠️ Como Iniciar

### Pré-requisitos
- Node.js / NPM (ou Bun)
- Banco de Dados configurado (via Prisma)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar o banco de dados
npx prisma generate
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação em execução.

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Rotas e páginas do Next.js
├── components/          # Componentes React reutilizáveis
│   └── ui/             # Componentes base do shadcn/ui
├── hooks/              # Hooks React customizados
├── lib/                # Funções utilitárias e configurações (DB, utils)
└── ...
```

## 🚀 Scripts Disponíveis

- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Cria a versão de produção otimizada.
- `npm run start`: Inicia o servidor em modo de produção.
- `npm run lint`: Executa a verificação de linting.

---

Desenvolvido por **Rob Dev** 🚀
