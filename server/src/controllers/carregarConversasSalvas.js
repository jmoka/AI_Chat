const fs = require('fs');
const path = require('path');

const baseDataPath = path.resolve(__dirname, '../../data'); // Ajuste o caminho conforme necessário
const logDir = path.join(baseDataPath, 'log'); // Diretório de logs

console.log(`Base data path: ${baseDataPath}`); // Caminho base para os dados
console.log(`Base data logDir: ${logDir}`); // Caminho base para os dados


function carregarConversasSalvas(memoriaMensagens) { // Carrega as conversas salvas na memória
    //const logDir = path.join(__dirname, '../../../data/log'); // Diretório de logs
    if (!fs.existsSync(logDir)) {
        console.log('Diretório de logs não encontrado.');
        return;
    }

    const logFiles = fs.readdirSync(logDir).filter(file => file.endsWith('.json'));
    logFiles.forEach(file => {
        try {
            const filePath = path.join(logDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (Array.isArray(fileContent)) {
                fileContent.forEach(message => {
                    if (message && typeof message.content === 'string') {
                        memoriaMensagens.push({
                            role: message.role,
                            content: message.content
                        });
                    }
                });
                console.log(`Conversas carregadas do arquivo (array): ${file}`);
            } else if (typeof fileContent === 'object') {
                Object.keys(fileContent).forEach(key => {
                    const message = fileContent[key];
                    if (message && typeof message === 'string') {
                        memoriaMensagens.push({
                            role: 'assistant',
                            content: message
                        });
                    }
                });
                console.log(`Conversas carregadas do arquivo (objeto): ${file}`);
            } else {
                console.error(`O conteúdo do arquivo ${file} não é um array nem um objeto válido.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar o arquivo de log ${file}:`, error.message);
        }
    });
}

module.exports = carregarConversasSalvas;
