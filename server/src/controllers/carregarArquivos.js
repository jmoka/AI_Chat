const fs = require('fs');
const path = require('path');

function carregarArquivosProcessados(processedDir, memoriaMensagens) {
    if (!fs.existsSync(processedDir)) {
        console.log('Diretório de arquivos processados não encontrado.');
        return;
    }

    const processedFiles = fs.readdirSync(processedDir).filter(file => file.endsWith('.json'));
    processedFiles.forEach(file => {
        try {
            const filePath = path.join(processedDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (Array.isArray(fileContent)) { // Verifica se o conteúdo é um array
                fileContent.forEach(message => { //
                    if (message && typeof message.content === 'string') { // 
                        memoriaMensagens.push(
                            { 
                                role: 'assistant',                             
                                content: message.content }); // Adiciona a mensagem à memória
                    }
                });
                console.log(`Arquivos carregados do arquivo (array): ${file}`);
            } else if (typeof fileContent === 'object') {
                Object.keys(fileContent).forEach(key => {
                    const message = fileContent[key];
                    if (typeof message === 'string') {
                        memoriaMensagens.push({ role: 'assistant', content: message });
                    }
                });
            } else {
                console.error(`O conteúdo do arquivo ${file} não é um array nem um objeto válido.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar o arquivo processado ${file}:`, error.message);
        }
    });
}

module.exports = { carregarArquivosProcessados };