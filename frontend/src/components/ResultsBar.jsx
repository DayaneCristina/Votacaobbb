import React from 'react';

const ResultsBar = ({ percentParticipant1, percentParticipant2 }) => {
  return (
    <div className="results-bar">
      <div 
        className="result participant1-result" 
        style={{ width: `${percentParticipant1}%` }}
      >
        <span>{percentParticipant1}%</span>
      </div>
      <div 
        className="result participant2-result" 
        style={{ width: `${percentParticipant2}%` }}
      >
        <span>{percentParticipant2}%</span>
      </div>
    </div>
  );
};

export default ResultsBar;
