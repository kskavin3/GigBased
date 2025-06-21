import { Routes, Route } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      </Routes>
    </div>
  )
}

export default App 