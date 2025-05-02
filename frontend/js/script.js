document.addEventListener('DOMContentLoaded', function() {
    // Elementos da página
    const voteButtons = document.querySelectorAll('.vote-btn');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModal = document.querySelector('.close-modal');
    const voteAgainBtn = document.getElementById('voteAgain');
    const seeFullResultsBtn = document.getElementById('seeFullResults');
    const totalVotesElement = document.getElementById('totalVotes');
    const participant1Result = document.querySelector('.participant1-result');
    const participant2Result = document.querySelector('.participant2-result');
    const modalResultsBar = document.getElementById('modalResultsBar');
    
    // Variáveis de estado
    let votes = {
        participant1: 0,
        participant2: 0
    };
    let totalVotes = 0;
    
    // Simular dados iniciais (será substituído pela API)
    function initializeVotes() {
        // Valores fictícios para demonstração
        votes.participant1 = Math.floor(Math.random() * 1000);
        votes.participant2 = Math.floor(Math.random() * 1000);
        totalVotes = votes.participant1 + votes.participant2;
        updateResults();
    }
    
    // Atualizar resultados na tela
    function updateResults() {
        totalVotes = votes.participant1 + votes.participant2;
        
        if (totalVotes > 0) {
            const percent1 = Math.round((votes.participant1 / totalVotes) * 100);
            const percent2 = 100 - percent1;
            
            participant1Result.style.width = `${percent1}%`;
            participant1Result.querySelector('span').textContent = `${percent1}%`;
            
            participant2Result.style.width = `${percent2}%`;
            participant2Result.querySelector('span').textContent = `${percent2}%`;
        } else {
            participant1Result.style.width = '50%';
            participant1Result.querySelector('span').textContent = '50%';
            
            participant2Result.style.width = '50%';
            participant2Result.querySelector('span').textContent = '50%';
        }
        
        totalVotesElement.textContent = totalVotes;
    }
    
    // Enviar voto para a API
    async function sendVote(participantId) {
        try {
            // Simular chamada à API
            // Na implementação real, substituir por fetch()
            console.log(`Voto enviado para participante ${participantId}`);
            
            // Simular atraso de rede
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Simular resposta da API
            const success = Math.random() > 0.1; // 90% de chance de sucesso
            
            if (success) {
                // Atualizar contagem local (na implementação real, usar dados da API)
                if (participantId === '1') {
                    votes.participant1++;
                } else {
                    votes.participant2++;
                }
                
                updateResults();
                return true;
            } else {
                throw new Error('Falha ao enviar voto');
            }
        } catch (error) {
            console.error('Erro ao enviar voto:', error);
            return false;
        }
    }
    
    // Manipuladores de eventos
    voteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const participantId = this.getAttribute('data-id');
            
            // Desativar botões durante o processamento
            voteButtons.forEach(btn => btn.disabled = true);
            
            // Enviar voto
            const success = await sendVote(participantId);
            
            // Reativar botões
            voteButtons.forEach(btn => btn.disabled = false);
            
            if (success) {
                // Mostrar modal de confirmação
                confirmationModal.style.display = 'flex';
                
                // Atualizar resultados no modal
                const percent1 = Math.round((votes.participant1 / totalVotes) * 100);
                const percent2 = 100 - percent1;
                
                modalResultsBar.innerHTML = `
                    <div class="result participant1-result" style="width: ${percent1}%;">
                        <span>${percent1}%</span>
                    </div>
                    <div class="result participant2-result" style="width: ${percent2}%;">
                        <span>${percent2}%</span>
                    </div>
                `;
            } else {
                alert('Ocorreu um erro ao processar seu voto. Por favor, tente novamente.');
            }
        });
    });
    
    // Fechar modal
    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
    voteAgainBtn.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
    // Ver resultados completos
    seeFullResultsBtn.addEventListener('click', function() {
        window.location.href = 'results.html';
    });
    
    // Simular atualização em tempo real
    function simulateRealTimeUpdates() {
        // Na implementação real, usar WebSockets ou polling para atualizações
        setInterval(() => {
            // Simular novos votos aleatórios
            if (Math.random() > 0.5) {
                votes.participant1 += Math.floor(Math.random() * 10);
            } else {
                votes.participant2 += Math.floor(Math.random() * 10);
            }
            updateResults();
        }, 5000); // Atualizar a cada 5 segundos
    }
    
    // Inicializar
    initializeVotes();
    simulateRealTimeUpdates();
    
    // Simular conexão com a API para obter dados iniciais
    setTimeout(() => {
        // Aqui seria a chamada real à API
        console.log('Obtendo dados iniciais da API...');
    }, 1000);
});