import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlanCuentasPage } from './pages/plan-cuentas/PlanCuentasPage'
import { ComprobantesPage } from './pages/comprobantes/ComprobantesPage'
import { NuevoComprobantePage } from './pages/comprobantes/NuevoComprobantePage'
import { VerComprobantePage } from './pages/comprobantes/VerComprobantePage'
import { BalanceComprobacionPage } from './pages/reportes/BalanceComprobacionPage'
import { BalanceGeneralPage } from './pages/reportes/BalanceGeneralPage'
import { EstadoResultadosPage } from './pages/reportes/EstadoResultadosPage'
import { EstadoCuentaPage } from './pages/reportes/EstadoCuentaPage'
import { RealVsPresupuestoPage } from './pages/reportes/RealVsPresupuestoPage'
import { PresupuestoPage } from './pages/presupuesto/PresupuestoPage'
import { CierreContablePage } from './pages/cierre/CierreContablePage'
import { IntegracionQIPage } from './pages/integracion/IntegracionQIPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout>
                        <Navigate to="/dashboard" replace />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/plan-cuentas" element={
                <ProtectedRoute>
                    <Layout><PlanCuentasPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/comprobantes" element={
                <ProtectedRoute>
                    <Layout><ComprobantesPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/comprobantes/nuevo" element={
                <ProtectedRoute>
                    <Layout><NuevoComprobantePage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/comprobantes/:id" element={
                <ProtectedRoute>
                    <Layout><VerComprobantePage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reportes/balance-comprobacion" element={
                <ProtectedRoute>
                    <Layout><BalanceComprobacionPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reportes/balance-general" element={
                <ProtectedRoute>
                    <Layout><BalanceGeneralPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reportes/estado-resultados" element={
                <ProtectedRoute>
                    <Layout><EstadoResultadosPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reportes/estado-cuenta" element={
                <ProtectedRoute>
                    <Layout><EstadoCuentaPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reportes/real-vs-presupuesto" element={
                <ProtectedRoute>
                    <Layout><RealVsPresupuestoPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/presupuesto" element={
                <ProtectedRoute>
                    <Layout><PresupuestoPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/cierre-contable" element={
                <ProtectedRoute>
                    <Layout><CierreContablePage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/integracion-qi" element={
                <ProtectedRoute>
                    <Layout><IntegracionQIPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/configuracion" element={
                <ProtectedRoute>
                    <Layout><ConfiguracionPage /></Layout>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}
