async function carregarArquivosProcessados(processedDir, memoriaMensagens) {
    if (!fs.existsSync(processedDir)) {
        console.log('Diretório de arquivos processados não encontrado.');
        return;
    }

    const processedFiles = fs.readdirSync(processedDir).filter(file => file.endsWith('.json'));
    console.log('Arquivos encontrados no diretório processado:', processedFiles);

    processedFiles.forEach(file => {
        try {
            const filePath = path.join(processedDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log(`Conteúdo do arquivo ${file}:`, fileContent);

            if (Array.isArray(fileContent)) {
                fileContent.forEach(message => {
                    if (message && typeof message.content === 'string') {
                        memoriaMensagens.push({ role: 'assistant', content: message.content });
                        console.log('Mensagem adicionada à memória:', { role: 'assistant', content: message.content });
                    }
                });
            } else if (typeof fileContent === 'object') {
                Object.keys(fileContent).forEach(key => {
                    const message = fileContent[key];
                    if (typeof message === 'string') {
                        memoriaMensagens.push({ role: 'assistant', content: message });
                        console.log('Mensagem adicionada à memória:', { role: 'assistant', content: message });
                    }
                });
            } else {
                console.error(`O conteúdo do arquivo ${file} não é um array nem um objeto válido.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar o arquivo processado ${file}:`, error.message);
        }
    });

    // Limitar mensagens para o modelo
    const mensagensParaModelo = limitarMemoriaMensagens(6000, memoriaMensagens);
    console.log('Mensagens limitadas para o modelo:', mensagensParaModelo);
}