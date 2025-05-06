import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Chart from 'chart.js/auto';
import api from '../services/api'
import Loading from '../components/Loading';

const ResultsPage = () => {
  const [totalFirstParticipante, setTotalFirstParticipante] = useState(0);
  const [totalSecondParticipante, setTotalSecondParticipante] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const votesChartRef = useRef(null);
  const hourlyChartRef = useRef(null);
  const votesChartInstance = useRef(null);
  const hourlyChartInstance = useRef(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const result = await api.get('/votes/results');
        const data = result.data;

        data.forEach((item) => {
          switch (item.option_id) {
            case 1:
              setTotalFirstParticipante(item.count);
              break;
            case 2:
              setTotalSecondParticipante(item.count);
              break;
            default:
              throw new Error("Option not defined");
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching votes:", error);
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, []);

  // Dados horários - agora reage às mudanças nos totais
  const hourlyData = React.useMemo(() => {
    const now = new Date();
    const data = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i);

      const hourString = hour.getHours().toString().padStart(2, '0') + ':00';

      data.push({
        hour: hourString,
        seufifi: totalFirstParticipante,
        minidummies: totalSecondParticipante,
      });
    }

    return data;
  }, [totalFirstParticipante, totalSecondParticipante]);

  const percentages = React.useMemo(() => {
    const totalVotos = totalFirstParticipante + totalSecondParticipante;

    return {
      participant1: totalFirstParticipante > 0 ? (totalFirstParticipante / totalVotos) * 100 : 0,
      participant2: totalSecondParticipante > 0 ? (totalSecondParticipante / totalVotos) * 100 : 0,
    };
  }, [totalFirstParticipante, totalSecondParticipante]);

  useEffect(() => {
    if (isLoading || (totalFirstParticipante === 0 && totalSecondParticipante === 0)) {
      return;
    }

    if (votesChartRef.current) {
      if (votesChartInstance.current) {
        votesChartInstance.current.destroy();
      }

      votesChartInstance.current = new Chart(votesChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Seu Fifi', 'Mini Dummies'],
          datasets: [{
            data: [totalFirstParticipante, totalSecondParticipante],
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
                label: function (context) {
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
    }

    if (hourlyChartRef.current) {
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy();
      }

      const labels = hourlyData.map(entry => entry.hour);
      const minidummiesData = hourlyData.map(entry => entry.minidummies);
      const seufifiData = hourlyData.map(entry => entry.seufifi);

      hourlyChartInstance.current = new Chart(hourlyChartRef.current, {
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
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    }

    return () => {
      if (votesChartInstance.current) {
        votesChartInstance.current.destroy();
      }
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy();
      }
    };
  }, [hourlyData, isLoading, totalFirstParticipante, totalSecondParticipante]);

  if (isLoading) {
    return <div><Loading /></div>;
  }

  return (
    <>
      <Header
        title="Resultado do Paredão"
        subtitle="Confira como está a votação até o momento"
      />

      <div className="container">
        <main id="main-content" className="results-page">
          <div className="results-summary">
            <div className="summary-card minidummies">
              <h2>Seu Fifi</h2>
              <div className="vote-count">
                {totalFirstParticipante.toLocaleString('pt-BR')}
              </div>
              <div className="vote-percent">
                {percentages.participant1.toFixed(2)}%
              </div>
            </div>

            <div className="summary-card total-summary">
              <h2>Total de Votos</h2>
              <div className="vote-count">
                {(totalFirstParticipante + totalSecondParticipante).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="summary-card seufifi">
              <h2>Mini Dummies</h2>
              <div className="vote-count">
                {totalSecondParticipante.toLocaleString('pt-BR')}
              </div>
              <div className="vote-percent">
                {percentages.participant2.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="results-chart">
            <h2>Distribuição de Votos</h2>
            <div className="chart-container" style={{ position: 'relative', height: '300px', marginTop: '20px' }}>
              <canvas ref={votesChartRef}></canvas>
            </div>
          </div>

          <div className="hourly-results">
            <h2>Votos por Hora</h2>
            <div className="chart-container" style={{ position: 'relative', height: '300px', marginTop: '20px' }}>
              <canvas ref={hourlyChartRef}></canvas>
            </div>
          </div>
        </main>

        <div className="back-to-vote">
          <Link to="/" className="ver-resultados">
            Voltar para votação
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResultsPage;