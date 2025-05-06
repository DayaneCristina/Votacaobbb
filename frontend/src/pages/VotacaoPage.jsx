import React, { useState, useEffect } from 'react'
import ParticipantCard from '../components/ParticipantCard'
import SeuFifiImg from '../assets/images/seufifi.png'
import MiniDummieImg from '../assets/images/minidummies.png'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import ReCAPTCHA from "react-google-recaptcha";

const VotacaoPage = () => {
  const [participantes] = useState([
    {
      id: 1,
      name: 'Seu Fifi',
      image: SeuFifiImg
    },
    {
      id: 2,
      name: 'Mini Dummies',
      image: MiniDummieImg
    }
  ]);

  const [modalAtivo, setModalAtivo] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [participanteSelecionado, setParticipanteSelecionado] = useState(null);

  const [captchaToken, setCaptchaToken] = useState(process.env.CAPTCHA_KEY);

  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const [contador, setContador] = useState({
    horas: 23,
    minutos: 59,
    segundos: 59
  });

  useEffect(() => {
    console.log("Teste")
    console.log(process.env.REACT_APP_SITE_KEY)
    const timer = setInterval(() => {
      setContador(prevState => {
        const novoSegundos = prevState.segundos - 1;

        if (novoSegundos < 0) {
          const novoMinutos = prevState.minutos - 1;

          if (novoMinutos < 0) {
            const novoHoras = prevState.horas - 1;

            if (novoHoras < 0) {
              clearInterval(timer);
              return { horas: 0, minutos: 0, segundos: 0 };
            }

            return { horas: novoHoras, minutos: 59, segundos: 59 };
          }

          return { ...prevState, minutos: novoMinutos, segundos: 59 };
        }

        return { ...prevState, segundos: novoSegundos };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVote = (id) => {
    const participante = participantes.find(p => p.id === id);
    setParticipanteSelecionado(participante);
    setModalAtivo(true);
  };

  const confirmarVoto = () => {
    if (!captchaToken) {
      alert("Por favor, complete o CAPTCHA!");
      return;
    }

    setConfirmDisable(true)

    api.post('/votes', {
      option_id: participanteSelecionado.id
    }, {
      headers: {
        'X-Request-Id': uuidv4(),
        'X-Captcha-Token': captchaToken
      }
    }).finally(() => {
      setCaptchaToken(null);

      setModalAtivo(false);
      setMensagemSucesso(true);

      criarConfete();

      setTimeout(() => {
        setMensagemSucesso(false);
      }, 3000)

      setConfirmDisable(false)
    });
  };

  const cancelarVoto = () => {
    setCaptchaToken(null);

    setModalAtivo(false);
  };

  const criarConfete = () => {
    for (let i = 0; i < 50; i++) {
      const confete = document.createElement('div');
      confete.className = 'confete';

      confete.style.left = `${Math.random() * 100}%`;
      confete.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
      confete.style.animationDelay = `${Math.random() * 2}s`;

      document.body.appendChild(confete);

      setTimeout(() => {
        confete.remove();
      }, 3000);
    }
  };

  return (
    <div>
      <Header title="Votação BBB" />

      <div className="container">
        <main>
          <div className="contador-container">
            <h2 className="contador-titulo">VOTAÇÃO ENCERRA EM</h2>
            <div className="contador">
              <div className="contador-item">
                <div className="contador-numero">{contador.horas.toString().padStart(2, '0')}</div>
                <span className="contador-label">HORAS</span>
              </div>
              <div className="contador-item">
                <div className="contador-numero">{contador.minutos.toString().padStart(2, '0')}</div>
                <span className="contador-label">MINUTOS</span>
              </div>
              <div className="contador-item">
                <div className="contador-numero">{contador.segundos.toString().padStart(2, '0')}</div>
                <span className="contador-label">SEGUNDOS</span>
              </div>
            </div>
          </div>

          <section>
            <h2 className="votacao-titulo">Quem você quer eliminar?</h2>

            <div className="participantes-container">
              {participantes.map(participante => (
                <ParticipantCard
                  key={participante.id}
                  id={participante.id}
                  name={participante.name}
                  image={participante.image}
                  onVote={handleVote}
                />
              ))}
            </div>
          </section>

          <Link to="/resultados" className='ver-resultados'> Ver Resultados </Link>
        </main>

        <div className={`modal-overlay ${modalAtivo ? 'ativo' : ''}`}>
          <div className="modal">
            <h3 className="modal-titulo">Confirmar Voto</h3>

            {participanteSelecionado && (
              <div className="modal-participante">
                <img
                  src={participanteSelecionado.image}
                  alt={participanteSelecionado.name}
                  className="modal-img"
                />
                <span className="modal-nome">{participanteSelecionado.name}</span>
              </div>
            )}

            <div className="modal-captcha">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>


            <div className="modal-botoes">
              <button className="botao-confirmar" onClick={confirmarVoto} disabled={confirmDisable}>
                Confirmar
              </button>
              <button className="botao-cancelar" onClick={cancelarVoto}>
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <div className={`mensagem ${mensagemSucesso ? 'ativo' : ''}`}>
          Voto computado com sucesso!
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VotacaoPage;