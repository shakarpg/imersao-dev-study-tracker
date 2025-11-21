# 🚀 Dev Study Tracker: O Projeto Completo da Imersão Dev

Este projeto engloba duas partes principais:
1.  O **Dev Study Tracker** (Frontend), o aplicativo web para rastrear o progresso.
2.  O **Gerador de Base de Conhecimento** (Backend), um script que usa a API Gemini para criar os planos de estudo de forma inteligente.

Desenvolvido durante a **Imersão Dev** em parceria com a **Alura** e o **Google**, ele demonstra o uso de **HTML, CSS e JavaScript Vanilla** (no frontend) e **Node.js/IA** (para o pipeline de dados), atendendo aos critérios de **Utilidade**, **Criatividade** e **Eficácia** da premiação.

---

## I. 🎯 Dev Study Tracker (Frontend - O Aplicativo Web)

O aplicativo web minimalista é a interface principal, focada em ajudar o estudante a planejar, rastrear e concluir suas metas de estudo.

### ✨ Principais Recursos e Funcionalidades do Tracker

| Recurso | Descrição | Foco de Avaliação |
| :--- | :--- | :--- |
| **Importação de Planos** | O usuário pode escolher entre planos de estudo pré-definidos (Plano Base ou Plano de Linguagens de Programação), que são carregados de arquivos **JSON**. | Criatividade e Utilidade |
| **Rastreamento de Progresso** | Cada meta de estudo possui uma **Meta em Minutos** e uma contagem de tempo estudado, atualizada pelos botões de ação (**+ 15 min** / **+ 1 hora**). | Eficácia |
| **Visualização Detalhada** | Cada card exibe a descrição da tecnologia e um **Passo a Passo** detalhado (carregado do JSON). | Utilidade e Apresentação |
| **Barra de Progresso Visual** | Uma barra de progresso em amarelo fornece feedback instantâneo sobre o percentual de conclusão da meta. | Apresentação |
| **Persistência de Dados** | O progresso do usuário é salvo automaticamente no `localStorage` do navegador, garantindo que os dados não sejam perdidos ao fechar a página. | Eficácia |
| **Design Temático** | O projeto utiliza um esquema de cores vibrante (verde, azul e amarelo) e tipografia limpa, demonstrando atenção à **UI/UX** com CSS puro. | Apresentação |

### 🛠️ Tecnologias do Tracker

* **HTML5:** Estrutura e Semântica da Aplicação.
* **CSS3:** Estilização, Responsividade e Layout Temático.
* **JavaScript Vanilla (Puro):** Lógica da aplicação, Manipulação do DOM, Funções Assíncronas (`fetch`) e Persistência de Dados (`localStorage`).

---

## II. 💡 Gerador de Base de Conhecimento (Backend - O Pipeline de Dados)

O Gerador é o script auxiliar que automatiza a criação e expansão da base de dados do projeto (o arquivo `BasedeConhecimento.json`). Ele usa a inteligência artificial para manter os planos de estudo relevantes e diversificados.

### O que o Gerador Faz (Detalhado)

Cria e expande automaticamente a base de conhecimento em JSON adicionando, em cada execução, **25 novas entradas únicas** sobre tecnologias (linguagens, frameworks, ferramentas, bancos de dados, metodologias).

* **Expansão Inteligente:** Gera exatamente 25 novas entradas em formato JSON.
* **Dados Estruturados:** Utiliza o modelo Gemini com um **Schema JSON definido** para garantir que cada entrada tenha os campos `nome`, `descricao`, `passos_estudo` e `meta_minutos`.
* **Evita Repetição:** Compara os nomes já existentes na base e os informa ao modelo para garantir que não haja duplicação de entradas.
* **Segurança e Consistência:** Realiza validação básica da resposta (garante que seja um ARRAY com 25 objetos) e utiliza tentativas com *backoff* exponencial em caso de falhas.
* **Atualização:** Atualiza (sobrescreve) o arquivo `BasedeConhecimento.json` com a base combinada (antigos + 25 novos itens).

### 🛠️ Tecnologias do Gerador

* **Node.js:** Ambiente de execução.
* **Gemini API:** Modelo de IA para geração de conteúdo estruturado.
* **`dotenv`:** Para gerenciamento da variável de ambiente `GEMINI_API_KEY`.

### Como Executar o Gerador

1.  **Instale dependências:**
    ```bash
    npm install
    ```
2.  **Crie um arquivo `.env`** na raiz do projeto com sua chave:
    ```bash
    GEMINI_API_KEY="SUA_CHAVE_AQUI"
    ```
3.  **Execute:**
    ```bash
    npm start
    ```
    *O arquivo `BasedeConhecimento.json` será sobrescrito com os novos dados.*

---

## III. 📦 Configuração e Uso do Projeto Completo

### Pré-requisitos
* Node.js instalado.
* Chave da Gemini API (necessária apenas para rodar o Gerador).

### 🚀 Como Rodar o Tracker (Frontend)

1.  **Clone o Repositório:**
    ```bash
    git clone https://www.github.com/usuario/imersao-dev-study-tracker.git
    ```
2.  **Abra no Navegador:**
    Abra o arquivo `index.html` diretamente no seu navegador.

### 💡 Primeiro Uso do Tracker

Ao iniciar, você será direcionado para escolher um plano:

Clique no botão "Importar Plano de Estudos".

Escolha uma das opções:

1. Plano Base: Focado em fundamentos (HTML, CSS, JS/DOM).

2. Plano de Todas as Linguagens de Programação: Um plano mais extenso com diversas linguagens (Python, Java, Go, Rust, etc.).

O progresso do plano escolhido será exibido, e você pode começar a registrar o tempo de estudo!

---

### 🖼️ Preview
![preview](./preview.png)
-----

### 🧑‍💻 Autor

Feito com 💚 e 💡 por **Rafael Pereira Galhardo**

 * **[LinkedIn]:** (https://www.linkedin.com/in/rpg2011)
 * **[GitHub]:** (https://www.github.com/shakarpg)

