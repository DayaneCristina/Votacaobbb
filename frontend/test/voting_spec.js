{
    "success": true,
    "votes": {
      "participant1": 600,
      "participant2": 400,
      "total": 1000
    },
    "hourly": [
      { "hour": "10:00", "participant1": 60, "participant2": 40 },
      { "hour": "11:00", "participant1": 80, "participant2": 50 },
      { "hour": "12:00", "participant1": 120, "participant2": 90 }
    ]
  }
  
  // cypress/support/commands.js (novo)
  Cypress.Commands.add('voteForFirstParticipant', () => {
    cy.get('[data-testid="vote-button-1"]').click();
    cy.wait('@voteRequest');
  });
  
  Cypress.Commands.add('voteForSecondParticipant', () => {
    cy.get('[data-testid="vote-button-2"]').click();
    cy.wait('@voteRequest');
  });
  
  Cypress.Commands.add('closeModal', () => {
    cy.get('.close-modal').click();
  });
  
  // cypress/integration/voting_spec.js
  
  describe('Página de Votação - BBB', () => {
    beforeEach(() => {
      cy.fixture('votes').then((mockData) => {
        cy.intercept('GET', '/api/votes', {
          statusCode: 200,
          body: mockData
        }).as('getVotesRequest');
  
        cy.intercept('POST', '/api/votes', {
          statusCode: 200,
          body: {
            success: true,
            votes: mockData.votes
          }
        }).as('voteRequest');
      });
  
      cy.visit('/');
    });
  
    it('exibe cabeçalho, participantes e seção de resultados', () => {
      cy.contains('h1', 'Paredão BBB').should('be.visible');
      cy.contains('p', 'Escolha quem você quer eliminar desta vez!').should('be.visible');
      cy.contains('h2', 'Mini Dummies').should('be.visible');
      cy.contains('h2', 'Seu Fifi').should('be.visible');
      cy.get('[data-testid^="vote-button-"]').should('have.length', 2);
      cy.contains('h3', 'Resultados em Tempo Real').should('be.visible');
      cy.get('.results-bar').should('be.visible');
    });
  
    it('exibe modal de confirmação após voto', () => {
      cy.voteForFirstParticipant();
      cy.get('#confirmationModal').should('be.visible').and('have.css', 'display', 'flex');
      cy.contains('h2', 'Voto Registrado!').should('be.visible');
      cy.get('#modalResultsBar').within(() => {
        cy.contains('span', '60%').should('be.visible');
        cy.contains('span', '40%').should('be.visible');
      });
    });
  
    it('fecha modal ao clicar no botão de fechar', () => {
      cy.voteForFirstParticipant();
      cy.closeModal();
      cy.get('#confirmationModal').should('not.be.visible');
    });
  
    it('permite múltiplos votos', () => {
      cy.voteForFirstParticipant();
      cy.get('#voteAgain').click();
      cy.get('#confirmationModal').should('not.be.visible');
      cy.voteForSecondParticipant();
      cy.get('#confirmationModal').should('be.visible');
    });
  
    it('navega para a página de resultados', () => {
      cy.get('#seeFullResults').click();
      cy.url().should('include', 'results.html');
    });
  
    it('exibe alerta de erro ao falhar na API', () => {
      cy.intercept('POST', '/api/votes', {
        statusCode: 500,
        body: { success: false, message: 'Server error' }
      }).as('failedVoteRequest');
  
      cy.window().then((win) => {
        cy.spy(win, 'alert').as('alertSpy');
      });
  
      cy.get('[data-testid="vote-button-1"]').click();
      cy.wait('@failedVoteRequest');
  
      cy.get('@alertSpy').should('have.been.calledWith',
        'Ocorreu um erro ao processar seu voto. Por favor, tente novamente.'
      );
      cy.get('#confirmationModal').should('not.be.visible');
    });
  });
  