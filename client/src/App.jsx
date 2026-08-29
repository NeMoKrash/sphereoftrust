import { Route, Routes } from 'react-router-dom'
import { SurveyProvider } from './context/SurveyContext'
import { LanguageProvider } from './context/LanguageContext'
import HomePage from './pages/HomePage'
import StartPage from './pages/StartPage'
import AboutPage from './pages/AboutPage'
import AuthorPage from './pages/AuthorPage'
import ClimateMapPage from './pages/ClimateMapPage'
import SurveyPage from './pages/SurveyPage'
import ThankYouPage from './pages/ThankYouPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminLayout from './pages/AdminLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminQuestionsPage from './pages/AdminQuestionsPage'
import SuperAdminLayout from './pages/SuperAdminLayout'
import SuperAdminStatsPage from './pages/SuperAdminStatsPage'
import SuperAdminAdminsPage from './pages/SuperAdminAdminsPage'

export default function App() {
  return (
    <LanguageProvider>
      <SurveyProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/author" element={<AuthorPage />} />
          <Route path="/climate-map" element={<ClimateMapPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="questions" element={<AdminQuestionsPage />} />
          </Route>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminStatsPage />} />
            <Route path="admins" element={<SuperAdminAdminsPage />} />
          </Route>
        </Routes>
      </SurveyProvider>
    </LanguageProvider>
  )
}
