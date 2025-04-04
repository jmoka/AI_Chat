
// scriptComponetsMensagem.js
const chat = document.getElementById('chat');
const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('message');
const saveLogButton = document.getElementById('saveLogButton');
const refreshLogButton = document.getElementById('refreshLogButton');
const logFileList = document.getElementById('logFileList');

// Array para armazenar as mensagens trocadas
const messageLog = [];

function getTimestamp() {
    return new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function appendMessage(message, isUser = true, isError = false) {
    const containerDiv = document.createElement('div');
    containerDiv.className = `message-container ${isUser ? 'user-message-container' : 'assistant-message-container'}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'} ${isError ? 'error-message' : ''}`;
    messageDiv.textContent = message;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'timestamp';
    timeDiv.textContent = getTimestamp();

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = isUser ? 'row-reverse' : 'row';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';

    wrapper.appendChild(messageDiv);
    wrapper.appendChild(timeDiv);
    containerDiv.appendChild(wrapper);

    chat.appendChild(containerDiv);
    chat.scrollTop = chat.scrollHeight;

    // Salva a mensagem no array de log
    messageLog.push({ message, isUser, timestamp: getTimestamp() });
}

// não ta funcionando
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    messageInput.disabled = isLoading;
    sendButton.textContent = isLoading ? 'Enviando...' : 'Enviar';
}
//não ta funcionando
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    setLoading(true);
    messageInput.value = "";

    try {
        appendMessage(message);

        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const data = await response.json();
        appendMessage(data.response, false);
    } catch (error) {
        console.error('Erro:', error);
        appendMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', false, true);
    } finally {
        setLoading(false);
    }
}

const fileList = document.getElementById('fileList');
const refreshButton = document.getElementById('refreshButton');

async function loadFileList() {
    try {
        const response = await fetch('http://localhost:3000/files');
        if (!response.ok) {
            throw new Error('Erro ao carregar a lista de arquivos.');
        }

        const files = await response.json();
        fileList.innerHTML = '';

        if (files.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum arquivo salvo.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            fileList.appendChild(emptyMessage);
            return;
        }

        files.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '10px';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '10px';
            listItem.style.border = '1px solid #ddd';
            listItem.style.borderRadius = '5px';
            listItem.style.backgroundColor = '#fff';

            const fileNameSpan = document.createElement('span');
            fileNameSpan.style.paddingInlineEnd= '5px';
            fileNameSpan.textContent = file;
            fileNameSpan.style.flex = '1';
            fileNameSpan.style.color = 'black'; // Define a cor do texto como preto
            fileNameSpan.style.fontWeight = 'bold'; // Opcional: deixa o texto em negrito

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Deletar';
            deleteButton.style.padding = '5px 10px';
            deleteButton.style.backgroundColor = '#ff4d4d';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.borderRadius = '5px';
            deleteButton.style.cursor = 'pointer';
            deleteButton.onclick = async () => {
                await deleteFile(file);
            };

            listItem.appendChild(fileNameSpan);
            listItem.appendChild(deleteButton);
            fileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao carregar a lista de arquivos:', error);
    }
}

async function deleteFile(fileName) {
    try {
        const response = await fetch(`http://localhost:3000/files/${fileName}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar o arquivo.');
        }

        alert(`Arquivo "${fileName}" deletado com sucesso.`);
        loadFileList();
    } catch (error) {
        console.error('Erro ao deletar o arquivo:', error);
    }
}

refreshButton.addEventListener('click', loadFileList);
loadFileList();

const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const uploadStatus = document.getElementById('uploadStatus');

// Função para lidar com o envio de arquivos
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o comportamento padrão do formulário

    const file = fileInput.files[0];
    if (!file) {
        uploadStatus.textContent = 'Por favor, selecione um arquivo.';
        uploadStatus.style.color = 'red';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    uploadButton.disabled = true;
    uploadStatus.textContent = 'Enviando arquivo...';
    uploadStatus.style.color = '#555';

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar o arquivo.');
        }

        const data = await response.json();
        uploadStatus.textContent = `Arquivo "${data.fileName}" enviado com sucesso.`;
        uploadStatus.style.color = 'green';

        // Atualiza a lista de arquivos após o upload
        loadFileList();
    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
        uploadStatus.textContent = 'Erro ao enviar o arquivo.';
        uploadStatus.style.color = 'red';
    } finally {
        uploadButton.disabled = false;
    }
});

const processButton = document.getElementById('processButton');
const refreshProcessedButton = document.getElementById('refreshProcessedButton');
const processedFileList = document.getElementById('processedFileList');
const loadProcessedButton = document.getElementById('loadProcessedButton');

// Função para carregar arquivos processados e alimentar a memória
loadProcessedButton.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/load-processed', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar arquivos processados.');
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erro ao carregar arquivos processados:', error.message);
        alert('Erro ao carregar arquivos processados.');
    }
});

// Função para processar arquivos
processButton.addEventListener('click', async () => {
    try {
        // Faz a requisição para o endpoint de processamento
        const response = await fetch('http://localhost:3000/process-files', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao processar os arquivos.');
        }

        const processedFiles = await response.json();
        processedFileList.innerHTML = ''; // Limpa a lista antes de exibir os arquivos processados

        if (processedFiles.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum arquivo processado.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            processedFileList.appendChild(emptyMessage);
            return;
        }

        // Exibe os arquivos processados
        processedFiles.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '10px';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '10px';
            listItem.style.border = '1px solid #ddd';
            listItem.style.borderRadius = '5px';
            listItem.style.backgroundColor = '#fff';

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file;
            fileNameSpan.style.flex = '1';
            fileNameSpan.style.color = 'black';
            fileNameSpan.style.fontWeight = 'bold';

            listItem.appendChild(fileNameSpan);
            processedFileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao processar os arquivos:', error.message);
        alert(`Erro ao processar os arquivos: ${error.message}`);
    }
});

// Função para carregar a lista de arquivos processados
async function loadProcessedFileList() {
    try {
        const response = await fetch('http://localhost:3000/processed-files');
        if (!response.ok) {
            throw new Error('Erro ao carregar a lista de arquivos processados.');
        }

        const files = await response.json();
        processedFileList.innerHTML = ''; // Limpa a lista antes de exibir os arquivos

        if (files.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum arquivo processado.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            processedFileList.appendChild(emptyMessage);
            return;
        }

        files.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '10px';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '10px';
            listItem.style.border = '1px solid #ddd';
            listItem.style.borderRadius = '5px';
            listItem.style.backgroundColor = '#fff';

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file;
            fileNameSpan.style.flex = '1';
            fileNameSpan.style.color = 'black';
            fileNameSpan.style.fontWeight = 'bold';

            listItem.appendChild(fileNameSpan);
            processedFileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao carregar a lista de arquivos processados:', error);
    }
}

// Adiciona o evento ao botão de atualizar a lista de processados
refreshProcessedButton.addEventListener('click', loadProcessedFileList);

// Carrega a lista de arquivos processados ao iniciar
loadProcessedFileList();

// Função para salvar as mensagens no servidor
saveLogButton.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/save-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: messageLog }),
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar as mensagens.');
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erro ao salvar as mensagens:', error.message);
        alert('Erro ao salvar as mensagens.');
    }
});

// Função para carregar o conteúdo de um arquivo de log
async function loadLogFileContent(fileName) {
    try {
        const response = await fetch(`http://localhost:3000/logs/${fileName}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar o conteúdo do log.');
        }

        const messages = await response.json();

        // Limpa o chat atual
        chat.innerHTML = '';

        // Adiciona as mensagens do log ao chat
        messages.forEach((msg) => {
            appendMessage(msg.message, msg.isUser);
        });

        alert(`Mensagens do log "${fileName}" carregadas no chat.`);
    } catch (error) {
        console.error('Erro ao carregar o conteúdo do log:', error.message);
        alert('Erro ao carregar o conteúdo do log.');
    }
}

// Função para carregar a lista de logs
async function loadLogFileList() {
    try {
        const response = await fetch('http://localhost:3000/logs');
        if (!response.ok) {
            throw new Error('Erro ao carregar a lista de logs.');
        }

        const files = await response.json();
        logFileList.innerHTML = ''; // Limpa a lista antes de exibir os arquivos

        if (files.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum log salvo.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            logFileList.appendChild(emptyMessage);
            return;
        }

        files.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '10px';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '10px';
            listItem.style.border = '1px solid #ddd';
            listItem.style.borderRadius = '5px';
            listItem.style.backgroundColor = '#fff';
            listItem.style.cursor = 'pointer';

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file;
            fileNameSpan.style.flex = '1';
            fileNameSpan.style.color = 'black';
            fileNameSpan.style.fontWeight = 'bold';

            // Adiciona evento de clique para carregar o conteúdo do log
            listItem.addEventListener('click', () => loadLogFileContent(file));

            listItem.appendChild(fileNameSpan);
            logFileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao carregar a lista de logs:', error.message);
    }
}

// Adiciona o evento ao botão de atualizar a lista de logs
refreshLogButton.addEventListener('click', loadLogFileList);

// Carrega a lista de logs ao iniciar
loadLogFileList();

// Salvar mensagens automaticamente ao sair ou recarregar a página
window.addEventListener('beforeunload', async (event) => {
    if (messageLog.length > 0) {
        try {
            await fetch('http://localhost:3000/save-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: messageLog }),
            });
            console.log('Mensagens salvas automaticamente.');
        } catch (error) {
            console.error('Erro ao salvar mensagens automaticamente:', error.message);
        }
    }
});
