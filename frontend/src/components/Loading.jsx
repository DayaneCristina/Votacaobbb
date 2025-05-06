import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  margin-top: 15%;
`;

const Dot = styled.div`
  width: 20px;
  height: 20px;
  background-color: #FF7F00;
  border-radius: 50%;
  margin: 0 5px;
  animation: ${bounce} 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

const TextLoading = styled.p`
    text-align: center;
`;

const Loading = () => {
  return (
    <>
        <LoadingContainer>
        {[0, 1, 2, 3].map(index => (
            <Dot key={index} delay={index * 0.15} />
        ))}
        </LoadingContainer>
        <TextLoading>Carregando</TextLoading>
    </>
  );
};

export default Loading;