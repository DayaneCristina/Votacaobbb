import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VotacaoPage from './pages/VotacaoPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (  
    <BrowserRouter>
      <Routes>
        <Route path='/' index element={<VotacaoPage />} />
        <Route path='/resultados' element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;