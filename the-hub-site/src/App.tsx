import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/Home/HomePage'
import EnrollmentPage from './pages/Enrollment/EnrollmentPage'
import LoginPage from './pages/Auth/LoginPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import ProfessorDashboard from './pages/Professor/ProfessorDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import { StudentsModule } from './pages/Admin/modules/StudentsModule'
import { ProfessorsModule } from './pages/Admin/modules/ProfessorsModule'
import { StudiosModule } from './pages/Admin/modules/StudiosModule'
import { FinanceModule } from './pages/Admin/modules/FinanceModule'
import { CouponsModule } from './pages/Admin/modules/CouponsModule'
import { CommunicationModule } from './pages/Admin/modules/CommunicationModule'
import { CertificadosModule } from './pages/Admin/modules/CertificadosModule'
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

      <Route element={<ProtectedRoute allowedRoles={['aluno']} />}>
        <Route element={<DashboardLayout variant="student" />}>
          <Route path="/painel" element={<StudentDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['professor']} />}>
        <Route element={<DashboardLayout variant="professor" />}>
          <Route path="/professor" element={<ProfessorDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout variant="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/alunos" element={<StudentsModule />} />
          <Route path="/admin/professores" element={<ProfessorsModule />} />
          <Route path="/admin/studios" element={<StudiosModule />} />
          <Route path="/admin/financeiro" element={<FinanceModule />} />
          <Route path="/admin/cupons" element={<CouponsModule />} />
          <Route path="/admin/comunicacao" element={<CommunicationModule />} />
          <Route path="/admin/certificados" element={<CertificadosModule />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
