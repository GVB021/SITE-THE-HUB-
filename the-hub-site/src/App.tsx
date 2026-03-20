import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/Home/HomePage'
import EnrollmentPage from './pages/Enrollment/EnrollmentPage'
import LoginPage from './pages/Auth/LoginPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import DashboardLayout from './layouts/DashboardLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />

      <Route element={<MainLayout />}>
        <Route path="/matricula" element={<EnrollmentPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout variant="student" />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout variant="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
