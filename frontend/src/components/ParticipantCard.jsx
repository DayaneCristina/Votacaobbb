import React, { useState } from 'react';

const ParticipantCard = ({ id, name, image, onVote }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="participante"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem do participante com moldura */}
      <div className="photo-frame">
        <img 
          src={image} 
          alt={name} 
          className="participante-img" 
        />
      </div>
      
      <div className="participante-info">
        {/* Nome do participante - exibido diretamente do prop */}
        <h2 className="participante-nome">{name}</h2>
        
        {/* Botão de votar */}
        <button 
          className="botao-votar" 
          onClick={() => onVote(id)}
          aria-label={`Votar para eliminar ${name}`}
        >
          {isHovered ? 'CONFIRMAR' : 'VOTAR PARA ELIMINAR'}
        </button>
      </div>
    </div>
  );
};

export default ParticipantCard;