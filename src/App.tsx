import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import CreateProjectListing from './pages/CreateProjectListing'
import DeveloperLanding from './pages/DeveloperLanding'
import DeveloperDashboard from './pages/DeveloperDashboard'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dev" element={<DeveloperLanding />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dev/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><DeveloperDashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-project-listing" 
          element={
            <ProtectedRoute>
              <Layout><CreateProjectListing /></Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App 