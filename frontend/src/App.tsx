import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { FilterProvider } from './contexts/FilterContext'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </DashboardLayout>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  )
}

export default App