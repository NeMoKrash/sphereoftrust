import { Route, Routes } from 'react-router-dom'
import { SurveyProvider } from './context/SurveyContext'
import HomePage from './pages/HomePage'
import SurveyPage from './pages/SurveyPage'
import ThankYouPage from './pages/ThankYouPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminLayout from './pages/AdminLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminQuestionsPage from './pages/AdminQuestionsPage'

export default function App() {
  return (
    <SurveyProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
        </Route>
      </Routes>
    </SurveyProvider>
  )
}
