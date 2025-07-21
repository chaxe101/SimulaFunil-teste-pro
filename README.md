pm run# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.







# SimulaFunil 🚀

SimulaFunil é uma aplicação web construída com Next.js que permite aos usuários criar, visualizar e simular funis de vendas de forma interativa. O projeto utiliza um backend robusto com Prisma e autenticação JWT para gerenciar os dados dos usuários de forma segura.

## Principais Tecnologias

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Banco de Dados (ORM):** [Prisma](https://www.prisma.io/)
- **Autenticação:** [JWT](https://jwt.io/) (JSON Web Tokens) + `bcrypt` para hash de senhas

## Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm` (geralmente instalado junto com o Node.js)

### 1. Clone o Repositório

Primeiro, clone o repositório do GitHub para a sua máquina local:

```bash
git clone https://github.com/fabricio2fb/SimulaFunil--PRO.git
cd SimulaFunil--PRO
```

### 2. Instale as Dependências

Execute o seguinte comando na raiz do projeto para instalar todas as dependências listadas no `package.json`:

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto. Você pode copiar o arquivo de exemplo `.env.example` (se existir) ou criá-lo do zero. Adicione as seguintes variáveis:

```env
# URL para o banco de dados. Para desenvolvimento local com SQLite, o caminho é este.
DATABASE_URL="file:./dev.db"

# Chave secreta para gerar os tokens JWT. Use uma string longa e aleatória.
JWT_SECRET="SUA_CHAVE_SECRETA_SUPER_FORTE_AQUI"
```
> **Importante:** Substitua `"SUA_CHAVE_SECRETA_SUPER_FORTE_AQUI"` por uma chave segura de sua escolha.

### 4. Configure o Banco de Dados com Prisma

Com o arquivo `.env` configurado, execute os seguintes comandos do Prisma para gerar o cliente e criar as tabelas no seu banco de dados local (`dev.db`):

```bash
# Gera o cliente Prisma com base no seu schema
npx prisma generate

# Sincroniza seu schema com o banco de dados, criando as tabelas
npx prisma db push
```

### 5. Inicie o Servidor de Desenvolvimento

Agora você está pronto para rodar a aplicação!

```bash
npm run dev
```

O servidor será iniciado, e você poderá acessar a aplicação no seu navegador, geralmente em [http://localhost:3000](http://localhost:3000).
