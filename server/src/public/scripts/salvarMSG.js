const fs = require('fs');
const path = require('path');

const baseDataPath = path.resolve(__dirname, '../../../data');
// Diretório onde os logs serão salvos
const logDir = path.join(baseDataPath, 'log');

console.log("Diretório de logs:", logDir);

// Função para salvar mensagens em um arquivo .json
function salvarMensagens(messages) {
    try {
        // Verifica se o diretório existe, caso contrário, cria-o
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
            console.log(`Diretório criado: ${logDir}`);
        }

        // Gera um nome único para o arquivo com base no timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFileName = `log-${timestamp}.json`;
        const logFilePath = path.join(logDir, logFileName);

        // Salva as mensagens no arquivo .json
        fs.writeFileSync(logFilePath, JSON.stringify(messages, null, 2), 'utf-8');
        console.log(`Mensagens salvas com sucesso no arquivo: ${logFileName}`);

        return logFileName; // Retorna o nome do arquivo salvo
    } catch (error) {
        console.error('Erro ao salvar mensagens:', error.message);
        throw error;
    }
}

// Exporta a função para ser usada em outros módulos
module.exports = { salvarMensagens };