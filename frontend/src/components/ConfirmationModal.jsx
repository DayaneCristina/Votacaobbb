import React from 'react';
import ResultsBar from './ResultsBar';

const ConfirmationModal = ({ onClose, onVoteAgain, percentages }) => {
  return (
    <div className="confirmation-modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Voto Registrado!</h2>
        <p>Seu voto foi computado com sucesso.</p>
        
        <div className="modal-results">
          <h3>Panorama Atual:</h3>
          <ResultsBar 
            percentParticipant1={percentages.participant1}
            percentParticipant2={percentages.participant2}
          />
        </div>
        
        <button id="voteAgain" onClick={onVoteAgain}>
          Votar Novamente
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;