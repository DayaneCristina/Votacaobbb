/**
 * Sistema de Resultados do Paredão BBB
 * Exibe gráficos e estatísticas detalhadas da votação
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da página
    const elements = {
        voteCountMinidummies: document.querySelector('.vote-count#minidummies'),
        voteCountSeufifi: document.querySelector('.vote-count#seufifi'),
        votePercentMinidummies: document.querySelector('.vote-percent#minidummies'),
        votePercentSeufifi: document.querySelector('.vote-percent#seufifi'),
        totalVotes: document.getElementById('totalVotesResults'),
        votesChart: document.getElementById('votesChart'),
        hourlyChart: document.getElementById('hourlyChart')
    };

    // Dados da votação (simulados)
    const votingData = {
        // Votos totais
        votes: {
            minidummies: 0,
            seufifi: 0
        },
        
        // Histórico de votos por hora (últimas 24 horas)
        hourlyVotes: [],
        
        // Inicializa dados simulados
        initializeData() {
            // Simular votos totais
            this.votes.minidummies = Math.floor(Math.random() * 50000) + 20000;
            this.votes.seufifi = Math.floor(Math.random() * 50000) + 20000;
            
            // Gerar dados históricos por hora
            const now = new Date();
            this.hourlyVotes = [];
            
            for (let i = 23; i >= 0; i--) {
                const hour = new Date(now);
                hour.setHours(now.getHours() - i);
                
                const hourString = hour.getHours().toString().padStart(2, '0') + ':00';
                
                this.hourlyVotes.push({
                    hour: hourString,
                    minidummies: Math.floor(Math.random() * 2000) + 500,
                    seufifi: Math.floor(Math.random() * 2000) + 500
                });
            }
        },
        
        // Atualiza a interface com os dados
        updateUI() {
            const totalVotes = this.votes.minidummies + this.votes.seufifi;
            const percentMinidummies = Math.round((this.votes.minidummies / totalVotes) * 100);
            const percentSeufifi = 100 - percentMinidummies;
            
            // Atualizar contadores
            elements.voteCountMinidummies.textContent = this.votes.minidummies.toLocaleString('pt-BR');
            elements.voteCountSeufifi.textContent = this.votes.seufifi.toLocaleString('pt-BR');
            elements.votePercentMinidummies.textContent = `${percentMinidummies}%`;
            elements.votePercentSeufifi.textContent = `${percentSeufifi}%`;
            
            elements.totalVotes.textContent = totalVotes.toLocaleString('pt-BR');
            
            // Criar gráficos
            this.createMainChart();
            this.createHourlyChart();
        },
        
        // Cria o gráfico principal de pizza
        createMainChart() {
            const ctx = elements.votesChart.getContext('2d');
            
            // Destruir gráfico anterior se existir
            if (window.mainChart) {
                window.mainChart.destroy();
            }
            
            window.mainChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Mini Dummies', 'Seu Fifi'],
                    datasets: [{
                        data: [this.votes.minidummies, this.votes.seufifi],
                        backgroundColor: ['#3498db', '#e74c3c'],
                        borderColor: ['#2980b9', '#c0392b'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const value = context.raw;
                                    const percentage = Math.round((value / total) * 100);
                                    return `${context.label}: ${value.toLocaleString('pt-BR')} votos (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        // Cria o gráfico de votos por hora
        createHourlyChart() {
            const ctx = elements.hourlyChart.getContext('2d');
            
            // Destruir gráfico anterior se existir
            if (window.hourlyChart) {
                window.hourlyChart.destroy();
            }
            
            // Extrair dados para o gráfico
            const labels = this.hourlyVotes.map(entry => entry.hour);
            const minidummiesData = this.hourlyVotes.map(entry => entry.minidummies);
            const seufifiData = this.hourlyVotes.map(entry => entry.seufifi);
            
            window.hourlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Mini Dummies',
                            data: minidummiesData,
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.2)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Seu Fifi',
                            data: seufifiData,
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.2)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Número de Votos'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Hora'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw.toLocaleString('pt-BR')} votos`;
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        },
        
        // Simula atualizações em tempo real
        startRealTimeUpdates() {
            setInterval(() => {
                // Adicionar votos aleatórios a cada atualização
                if (Math.random() > 0.5) {
                    this.votes.minidummies += Math.floor(Math.random() * 100);
                } else {
                    this.votes.seufifi += Math.floor(Math.random() * 100);
                }
                
                // Adicionar à hora atual
                const currentHour = this.hourlyVotes[this.hourlyVotes.length - 1];
                if (Math.random() > 0.5) {
                    currentHour.minidummies += Math.floor(Math.random() * 20);
                } else {
                    currentHour.seufifi += Math.floor(Math.random() * 20);
                }
                
                this.updateUI();
            }, 3000);
        }
    };

    // Inicializar a página
    function init() {
        votingData.initializeData();
        votingData.updateUI();
        votingData.startRealTimeUpdates();
        
        // Ajustar altura dos gráficos
        elements.votesChart.height = 300;
        elements.hourlyChart.height = 300;
    }
    
    // Iniciar
    init();
});