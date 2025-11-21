// Referências aos elementos DOM
const pendingContainer = document.querySelector("#pending-tasks");
const completedContainer = document.querySelector("#completed-tasks");
const importPlanBtn = document.querySelector("#import-plan-btn");

let tasks = []; // Array principal para armazenar todas as tarefas
let availablePlans = {}; // Objeto para armazenar os dados dos JSONs

// Constantes
const LOCAL_STORAGE_KEY = 'devStudyTrackerTasks';

// --- Funções de Inicialização e Carregamento de Dados ---

async function loadPlansData() {
    try {
        // Carrega o plano de estudos baseado no conteúdo básico
        const baseResponse = await fetch("BaseDeConhecimento.json");
        availablePlans.base = await baseResponse.json();

        // Carrega o plano de estudos baseado nas linguagens de programação
        const linguagensResponse = await fetch("linguagens.json");
        availablePlans.linguagens = await linguagensResponse.json();

    } catch (error) {
        console.error("Falha ao buscar Planos de Estudos JSON:", error);
        alert("Erro ao carregar os planos de estudo. Verifique os arquivos JSON (BaseDeConhecimento.json e linguagens.json).");
    }
}

function loadTasks() {
    // Carrega o estado atual do localStorage
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Se for a primeira vez, carrega o plano base por padrão (se existir)
        if (availablePlans.base && availablePlans.base.length > 0) {
             tasks = availablePlans.base.map(task => ({
                ...task,
                id: Date.now() + Math.random(), 
                minutos_estudados: 0,
                concluida: false
            }));
            saveTasks();
        }
    }
    renderTasks();
}

// Inicializa o projeto
async function initialize() {
    // 1. Carrega os dados dos arquivos JSON
    await loadPlansData();
    // 2. Carrega as tarefas salvas ou inicializa o plano
    loadTasks();
}

// --- Funções de Seleção de Plano ---

function showPlanSelection() {
    if (!availablePlans.base || !availablePlans.linguagens) {
        alert("Os planos de estudo não foram carregados. Tente recarregar a página.");
        return;
    }

    if (!confirm("Isso apagará seu progresso atual. Deseja continuar e escolher um novo plano?")) {
        return;
    }

    const availableOptions = 
        "1. Plano Base (HTML, CSS, JS e Integração)\n" +
        "2. Plano de Todas as Linguagens de Programação";

    const choice = prompt(`Escolha o plano para importar (digite o número):\n\n${availableOptions}`);

    if (choice === '1') {
        importPlan('base');
    } else if (choice === '2') {
        importPlan('linguagens');
    } else if (choice !== null) {
        alert("Opção inválida. Nenhuma alteração foi feita.");
    }
}

function importPlan(planKey) {
    const plan = availablePlans[planKey];

    if (!plan || plan.length === 0) {
        alert("O plano selecionado está vazio ou não foi carregado corretamente.");
        return;
    }

    // Mapeia o plano JSON para o formato de tarefa do tracker
    tasks = plan.map(task => ({
        ...task,
        id: Date.now() + Math.random(), // Novo ID único
        minutos_estudados: 0,
        concluida: false
    }));
    
    saveTasks();
    renderTasks();
    alert(`Plano "${planKey.toUpperCase()}" importado com sucesso! Progresso resetado.`);
}

// --- Funções de Persistência e Renderização ---

function saveTasks() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    const pendingTasks = tasks.filter(t => !t.concluida);
    const completedTasks = tasks.filter(t => t.concluida).reverse(); 

    if (pendingTasks.length === 0) {
        pendingContainer.innerHTML = `<p style="text-align: center; color: var(--text-color);">🎉 Todas as metas de estudo concluídas! Parabéns!</p>`;
    } else {
        pendingTasks.forEach(task => pendingContainer.appendChild(createTaskCard(task)));
    }

    if (completedTasks.length === 0) {
        completedContainer.innerHTML = `<p style="text-align: center; color: var(--text-color);">Nenhum histórico de conclusão.</p>`;
    } else {
        completedTasks.forEach(task => completedContainer.appendChild(createTaskCard(task)));
    }
}

function createTaskCard(task) {
    let article = document.createElement("article");
    article.classList.add("card");
    article.classList.add(task.concluida ? "card-completed" : "card-pending");
    
    const progresso = Math.min(100, (task.minutos_estudados / task.meta_minutos) * 100);

    let buttonsHTML = '';
    if (!task.concluida) {
        buttonsHTML = `
            <button class="card-action-btn" onclick="addStudyTime(${task.id}, 15)">+ 15 min</button>
            <button class="card-action-btn" onclick="addStudyTime(${task.id}, 60)">+ 1 hora</button>
        `;
    } else {
        buttonsHTML = `
            <p style="color: var(--text-color); font-size: 0.9rem; margin-bottom: 0;">Concluído em: ${new Date().toLocaleDateString('pt-BR')}</p>
        `;
    }

    const horasEstudadas = Math.floor(task.minutos_estudados / 60);
    const minutosRestantes = task.minutos_estudados % 60;
    const tempoEstudadoFormatado = horasEstudadas > 0 
        ? `${horasEstudadas}h ${minutosRestantes}min` 
        : `${minutosRestantes}min`;

    let passosHTML = '';
    if (task.passos_estudo && task.passos_estudo.length > 0) {
        passosHTML = `
            <h3>Passo a Passo:</h3>
            <ul class="step-list">
                ${task.passos_estudo.map(passo => `<li>${passo}</li>`).join('')}
            </ul>
        `;
    }

    article.innerHTML = `
        <h2>${task.nome}</h2>
        <p><strong>Descrição:</strong> ${task.descricao}</p>
        
        ${passosHTML}

        <p><strong>Meta:</strong> ${Math.floor(task.meta_minutos / 60)}h ${task.meta_minutos % 60}min</p>
        <p><strong>Progresso:</strong> ${tempoEstudadoFormatado} estudados</p>
        
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progresso}%;"></div>
        </div>

        <div>
            ${buttonsHTML}
        </div>
    `;
    return article;
}

function addStudyTime(id, minutes) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        
        task.minutos_estudados += minutes;

        if (task.minutos_estudados >= task.meta_minutos && !task.concluida) {
            task.minutos_estudados = task.meta_minutos; 
            task.concluida = true;
            alert(`✅ Parabéns! Você concluiu a meta: ${task.nome}!`); 
        }
        
        saveTasks();
        renderTasks();
    }
}

// Inicia o carregamento dos planos e tarefas
initialize();