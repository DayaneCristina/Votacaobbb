import React, { useEffect, useRef } from 'react';

const CaptchaModal = ({ onSubmit, onClose }) => {
  const [captchaToken, setCaptchaToken] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const captchaRef = useRef(null);
  
  useEffect(() => {
    // Simulação da inicialização do reCAPTCHA
    const timeoutId = setTimeout(() => {
      if (captchaRef.current) {
        // Em uma implementação real, o grecaptcha seria carregado via script
        console.log('CAPTCHA carregado');
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  const handleVerifyCaptcha = () => {
    // Simulação de verificação do CAPTCHA
    // Em uma implementação real, verificaria com grecaptcha.getResponse()
    const token = 'simulated-captcha-token-' + Math.random().toString(36).substring(2);
    setCaptchaToken(token);
  };
  
  const handleSubmit = () => {
    if (!captchaToken) {
      alert('Por favor, complete o CAPTCHA para votar.');
      return;
    }
    
    setIsLoading(true);
    onSubmit(captchaToken);
  };
  
  return (
    <div className="captcha-modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Verificação de Segurança</h2>
        <p>Para confirmar seu voto, por favor complete a verificação abaixo:</p>
        
        <div className="captcha-container" ref={captchaRef}>
          {/* Simulação do componente reCAPTCHA */}
          <div 
            style={{ 
              width: '300px', 
              height: '80px', 
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={handleVerifyCaptcha}
          >
            {captchaToken ? '✓ Verificação completa' : 'Clique para verificar'}
          </div>
        </div>
        
        <button 
          id="submitVote" 
          className="vote-btn"
          disabled={isLoading || !captchaToken}
          onClick={handleSubmit}
        >
          {isLoading ? 'Processando...' : 'Confirmar Voto'}
        </button>
      </div>
    </div>
  );
};

export default CaptchaModal;