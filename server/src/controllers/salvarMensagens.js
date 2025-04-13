// Importa o módulo 'fs' para trabalhar com o sistema de arquivos (ler, escrever, criar diretórios, etc.)
import fs from 'fs';

// Importa o módulo 'path' para manipulação de caminhos de arquivos e diretórios
import path from 'path';

// Importa função para converter a URL do módulo em um caminho de arquivo (em ESM, __dirname não existe por padrão)
import { fileURLToPath } from 'url';

// Converte a URL do arquivo atual em um caminho de arquivo
const __filename = fileURLToPath(import.meta.url);

// Extrai o diretório a partir do caminho do arquivo atual (substitui o uso de __dirname)
const __dirname = path.dirname(__filename);

// Define o caminho base para os dados, indo 3 pastas acima até chegar em /data
const baseDataPath = path.resolve(__dirname, '../../data');

// Define o caminho completo para o diretório de logs: /data/log
const logDir = path.join(baseDataPath, 'log');

// Exporta a função padrão que salva mensagens recebidas no formato JSON em um arquivo
export default function salvarConversa(messages) {
    try {
        // Verifica se o diretório de logs existe. Se não existir, cria ele (e os pais, se necessário)
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true }); // Cria diretório recursivamente
            console.log(`Diretório criado: ${logDir}`); // Confirma criação
        }

        // Cria um timestamp único baseado na data atual, substituindo : e . por - para ser válido no nome de arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Monta o nome do arquivo usando o timestamp. Exemplo: log-2025-04-08T15-32-10-123Z.json
        const logFileName = `log-${timestamp}.json`;

        // Cria o caminho completo do arquivo a ser salvo, juntando o diretório de logs e o nome do arquivo
        // Exemplo: /data/log/log-2025-04-08T15-32-10-123Z.json
        const logFilePath = path.join(logDir, logFileName);

        // Salva as mensagens no arquivo como JSON, formatado com 2 espaços de indentação para legibilidade
        fs.writeFileSync(logFilePath, JSON.stringify(messages, null, 2), 'utf-8');

        // Mostra no console onde o arquivo foi salvo
        console.log(`Mensagens salvas em: ${logFilePath}`);

        // Retorna o nome do arquivo salvo, útil para log ou confirmação
        return logFileName;

    } catch (error) {
        // Se der erro em qualquer parte (como permissão, disco cheio, etc), mostra no console
        console.error('Erro ao salvar mensagens:', error.message);

        // Repassa o erro para que outras partes do sistema possam lidar com ele se necessário
        throw error;
    }
}
