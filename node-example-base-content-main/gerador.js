import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÃO DA GEMINI API ---
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
// Resolve o caminho da base de conhecimento relativo ao arquivo atual.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWLEDGE_FILE = path.join(__dirname, '..', '..', 'imersao-dev-aula-3', 'imersao-dev-aula-3', 'BasedeConhecimento.json');

// --- CONFIGURAÇÃO DE GERAÇÃO (1 CHAMADA) ---
const TOTAL_ITEMS = 25;    // NOVO TOTAL DESEJADO: 25

// Estrutura JSON esperada para cada item da base de conhecimento
// Agora corresponde ao formato: nome, descricao, passos_estudo, meta_minutos
const responseSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            "nome": { "type": "STRING", "description": "Nome do tópico (ex: Fundamentos de HTML e CSS)." },
            "descricao": { "type": "STRING", "description": "Descrição do tópico." },
            "passos_estudo": {
                "type": "ARRAY",
                "description": "Lista de passos de estudo (array de strings).",
                "items": { "type": "STRING" }
            },
            "meta_minutos": { "type": "NUMBER", "description": "Meta de tempo em minutos." }
        },
        "required": ["nome", "descricao", "passos_estudo", "meta_minutos"]
    }
};

/**
 * Espera de forma assíncrona.
 * @param {number} ms - Milissegundos para esperar.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função para gerar o conhecimento em uma única chamada à API.
 * @returns {Promise<Array<Object>>} Array com as 25 novas entradas de conhecimento.
 */
async function generateNewKnowledge(existingKnowledge) {
    // Lista de nomes existentes para não repetição (para incluir no prompt)
    const existingNames = existingKnowledge.map(item => item.nome).join(', ');

    const systemPrompt = `Você é um especialista em tecnologia e linguagens de programação. Sua tarefa é criar ${TOTAL_ITEMS} novas entradas sobre diferentes tecnologias (linguagens, frameworks, ferramentas, bancos de dados, metodologias, etc.) com a mesma estrutura JSON. Garanta que cada entrada seja única e relevante. O foco é em termos atuais e amplamente usados em desenvolvimento de software.`;
    
    // NOVO userQuery: Focado em 25 itens e evitando nomes existentes
    const userQuery = `Gere uma lista de ${TOTAL_ITEMS} novas tecnologias. Siga estritamente a estrutura JSON e o requisito de ser um ARRAY com EXATAMENTE ${TOTAL_ITEMS} objetos. Não inclua as 5 tecnologias iniciais (Python, JavaScript, Java, C++, Ruby) e NÃO use NENHUM dos seguintes nomes: ${existingNames}.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    let response;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    try {
                        const newKnowledge = JSON.parse(jsonText);
                        
                        if (Array.isArray(newKnowledge) && newKnowledge.length === TOTAL_ITEMS) {
                            console.log(`Sucesso! ${TOTAL_ITEMS} novos itens gerados pela API.`);
                            return newKnowledge;
                        } else {
                            // Se o modelo não gerou o número exato, tentamos novamente
                            throw new Error(`O array retornado não contém ${TOTAL_ITEMS} itens. Encontrados: ${Array.isArray(newKnowledge) ? newKnowledge.length : 0}`);
                        }
                    } catch (parseError) {
                        throw new Error("JSON malformado ou incompleto na resposta da API.");
                    }
                } else {
                    throw new Error("Resposta da API vazia ou sem conteúdo textual.");
                }
            } else {
                throw new Error(`Falha na API com status ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            retries++;
            if (retries < maxRetries) {
                const waitTime = Math.pow(2, retries) * 1000; // 2s, 4s, 8s, ...
                await delay(waitTime);
            } else {
                throw new Error(`Falha ao gerar o conhecimento após várias tentativas: ${error.message}`);
            }
        }
    }
}

/**
 * Gera localmente uma base de conhecimento fixa (modo de desenvolvimento).
 * Retorna um array com os itens desejados.
 */
function generateLocalKnowledge() {
    return [
        {
            "nome": "Fundamentos de HTML e CSS",
            "descricao": "Estrutura básica de páginas e estilização, incluindo Flexbox e Responsividade.",
            "passos_estudo": [
                "Revisar tags e semântica do HTML5.",
                "Aprender seletores avançados de CSS.",
                "Dominar o Flexbox para layouts complexos.",
                "Praticar Media Queries para design responsivo."
            ],
            "meta_minutos": 420
        }
    ];
}


/**
 * Função principal para executar o fluxo de trabalho.
 */
async function main() {
    // Se ativado o modo local, não precisamos da chave da API
    const useLocal = String(process.env.LOCAL_GENERATE || process.env.LOCAL_KNOWLEDGE || '').toLowerCase() === 'true';
    if (!useLocal && !apiKey) {
        console.error("\n❌ ERRO: A variável de ambiente GEMINI_API_KEY não está definida.");
        console.log("Por favor, crie um arquivo '.env' na raiz do projeto e defina a chave:");
        console.log("GEMINI_API_KEY=\"SUA_CHAVE_AQUI\"");
        console.log("Ou habilite o modo local definindo LOCAL_GENERATE=true para gerar uma base local sem chamar a API.");
        return;
    }

    try {
        // 1. Carregar a base de conhecimento existente
        let existingKnowledge = [];
        try {
            const data = await fs.readFile(KNOWLEDGE_FILE, 'utf-8');
            existingKnowledge = JSON.parse(data);
            console.log(`Base de conhecimento inicial carregada. Total de itens: ${existingKnowledge.length}`);
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.log(`O arquivo ${KNOWLEDGE_FILE} não foi encontrado. Iniciando com uma base vazia.`);
            } else {
                throw new Error(`Erro ao ler/analisar ${KNOWLEDGE_FILE}: ${e.message}`);
            }
        }

        let newKnowledge;
        if (useLocal) {
            console.log("Modo LOCAL ativado: gerando base local fornecida.");
            newKnowledge = generateLocalKnowledge();
        } else {
            // 2. Gerar as 25 novas entradas (passando a base existente para o prompt)
            console.log("Aumentando sua base de conhecimento via API!");
            newKnowledge = await generateNewKnowledge(existingKnowledge);
        }

        // 3. Combinar as bases
        const totalKnowledge = [...existingKnowledge, ...newKnowledge];
        console.log(`Base de conhecimento combinada. Total final de itens: ${totalKnowledge.length}`);

        // 4. Salvar a nova base no arquivo
        await fs.writeFile(KNOWLEDGE_FILE, JSON.stringify(totalKnowledge, null, 2), 'utf-8');
        console.log(`\n🎉 SUCESSO!`);
        console.log(`O arquivo '${KNOWLEDGE_FILE}' foi atualizado com ${totalKnowledge.length} itens.`);

    } catch (error) {
        console.error("\n❌ ERRO FATAL:", error.message);
        console.log("Verifique se sua chave de API está correta e se há conectividade.");
    }
}

main();
