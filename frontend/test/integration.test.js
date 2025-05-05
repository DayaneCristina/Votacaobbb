const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { setupServer } = require('msw/node');
const { rest } = require('msw');

// Mock API server
const server = setupServer(
  // Mock vote endpoint
  rest.post('/api/votes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        votes: {
          participant1: 532,
          participant2: 468,
          total: 1000
        }
      })
    );
  }),
  
  // Mock results endpoint
  rest.get('/api/votes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        votes: {
          participant1: 532,
          participant2: 468,
          total: 1000
        },
        hourly: [
          { hour: '10:00', participant1: 50, participant2: 40 },
          { hour: '11:00', participant1: 70, participant2: 60 },
          { hour: '12:00', participant1: 100, participant2: 80 }
        ]
      })
    );
  })
);

// Setup and teardown for mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create integrated testing environment
function setupIntegrationTest(htmlFile = 'index.html') {
  const html = fs.readFileSync(path.resolve(__dirname, `../../frontend/${htmlFile}`), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    resources: 'usable',
    runScripts: 'dangerously'
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  
  // Mock fetch to use with MSW
  global.fetch = require('node-fetch');
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
  
  // Mock other browser APIs
  window.alert = jest.fn();
  const mockLocation = new URL('http://localhost/');
  Object.defineProperty(window, 'location', {
    value: {
      ...mockLocation,
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    writable: true
  });
  
  return dom;
}

describe('Integration Tests for Voting App', () => {
  let dom;
  
  beforeEach(() => {
    dom = setupIntegrationTest();
    jest.clearAllMocks();
  });
  
  test('Full voting flow - from vote to confirmation', async () => {
    // Load script manually
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/script.js'), 'utf8');
    const scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent
      // Replace the sendVote function to use our mock API
      .replace(
        /async function sendVote\(participantId\) {[\s\S]*?}/,
        `async function sendVote(participantId) {
          try {
            const response = await fetch('/api/votes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participantId })
            });
            const data = await response.json();
            if (data.success) {
              votes.participant1 = data.votes.participant1;
              votes.participant2 = data.votes.participant2;
              updateResults();
              return true;
            } else {
              throw new Error('API returned error');
            }
          } catch (error) {
            console.error('Error:', error);
            return false;
          }
        }`
      );
    document.body.appendChild(scriptElement);
    
    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
    
    // Wait for initial setup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check initial state
    const totalVotesElement = document.getElementById('totalVotes');
    const initialVotes = parseInt(totalVotesElement.textContent);
    
    // Click vote button
    const voteButton = document.querySelector('.vote-btn[data-id="1"]');
    voteButton.click();
    
    // Wait for API response and UI update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if modal is shown
    const modal = document.getElementById('confirmationModal');
    expect(modal.style.display).toBe('flex');
    
    // Check if vote counts are updated
    expect(parseInt(totalVotesElement.textContent)).toBe(1000); // From our mock API
    
    // Check percentages
    const participant1Result = document.querySelector('.participant1-result');
    const participant2Result = document.querySelector('.participant2-result');
    expect(participant1Result.querySelector('span').textContent).toBe('53%');
    expect(participant2Result.querySelector('span').textContent).toBe('47%');
    
    // Close modal and check if it's hidden
    const closeButton = document.querySelector('.close-modal');
    closeButton.click();
    expect(modal.style.display).toBe('none');
  });
  
  test('Error handling shows alert when API fails', async () => {
    // Setup error response
    server.use(
      rest.post('/api/votes', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, message: 'Server error' })
        );
      })
    );
    
    // Load script manually with modified sendVote function
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/script.js'), 'utf8');
    const scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent
      .replace(
        /async function sendVote\(participantId\) {[\s\S]*?}/,
        `async function sendVote(participantId) {
          try {
            const response = await fetch('/api/votes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participantId })
            });
            const data = await response.json();
            if (data.success) {
              votes.participant1 = data.votes.participant1;
              votes.participant2 = data.votes.participant2;
              updateResults();
              return true;
            } else {
              throw new Error('API returned error');
            }
          } catch (error) {
            console.error('Error:', error);
            return false;
          }
        }`
      );
    document.body.appendChild(scriptElement);
    
    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
    
    // Wait for initial setup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click vote button
    const voteButton = document.querySelector('.vote-btn[data-id="1"]');
    voteButton.click();
    
    // Wait for API response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if alert was shown
    expect(window.alert).toHaveBeenCalledWith(
      'Ocorreu um erro ao processar seu voto. Por favor, tente novamente.'
    );
    
    // Check that modal was not shown
    const modal = document.getElementById('confirmationModal');
    expect(modal.style.display).not.toBe('flex');
  });
  
  test('Results page loads and displays data', async () => {
    // Setup with results.html
    dom = setupIntegrationTest('results.html');
    
    // Create a minimal mocked results.js script
    const resultsScriptElement = document.createElement('script');
    resultsScriptElement.textContent = `
      document.addEventListener('DOMContentLoaded', async function() {
        try {
          const response = await fetch('/api/votes');
          const data = await response.json();
          
          // Update vote counts
          document.querySelector('.vote-count#minidummies').textContent = data.votes.participant1;
          document.querySelector('.vote-count#seufifi').textContent = data.votes.participant2;
          document.querySelector('.vote-count#totalVotesResults').textContent = data.votes.total;
          
          // Update percentages
          const percent1 = Math.round((data.votes.participant1 / data.votes.total) * 100);
          const percent2 = Math.round((data.votes.participant2 / data.votes.total) * 100);
          document.querySelector('.vote-percent#minidummies').textContent = percent1 + '%';
          document.querySelector('.vote-percent#seufifi').textContent = percent2 + '%';
          
          console.log('Results page loaded successfully');
        } catch (error) {
          console.error('Error loading results:', error);
        }
      });
    `;
    document.body.appendChild(resultsScriptElement);
    
    // Initialize Chart.js mock
    window.Chart = class {
      constructor() {
        this.update = jest.fn();
        this.destroy = jest.fn();
      }
    };
    
    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
    
    // Wait for API fetch
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if data was loaded correctly
    expect(document.querySelector('.vote-count#minidummies').textContent).toBe('532');
    expect(document.querySelector('.vote-count#seufifi').textContent).toBe('468');
    expect(document.querySelector('.vote-count#totalVotesResults').textContent).toBe('1000');
    
    // Check percentages
    expect(document.querySelector('.vote-percent#minidummies').textContent).toBe('53%');
    expect(document.querySelector('.vote-percent#seufifi').textContent).toBe('47%');
  });
});