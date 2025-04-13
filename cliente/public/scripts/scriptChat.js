document.addEventListener('DOMContentLoaded', () => {
    // Seleciona elementos do DOM relacionados ao chat
    const chat = document.getElementById('chat');
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('message');

    // Array para armazenar o log das mensagens
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

        messageLog.push({ message, isUser, timestamp: getTimestamp() });
    }

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

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            alert('Por favor, digite uma mensagem.');
            return;
        }

        setLoading(true);
        messageInput.value = "";
        messageInput.focus();
        messageInput.style.height = 'auto';

        try {
            appendMessage(message);

            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) throw new Error('Erro na resposta do servidor');

            const data = await response.json();
            if (!data.response) throw new Error('Resposta inválida do servidor');

            appendMessage(data.response, false);
        } catch (error) {
            console.error('Erro:', error);
            appendMessage('Erro ao processar sua mensagem.', false, true);
        } finally {
            setLoading(false);
        }
    }

    // ⬇️ Esses agora funcionam corretamente porque o DOM já carregou ⬇️
    sendButton.addEventListener('click', (event) => {
        event.preventDefault(); // Evita o recarregamento da página
        sendMessage();
    });

    messageInput.addEventListener('keydown', handleKeyPress);
});
