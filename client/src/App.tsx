import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EvaluationPage from './pages/EvaluationPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EvaluationPage />} />
      </Routes>
    </Router>
  )
}

export default App
