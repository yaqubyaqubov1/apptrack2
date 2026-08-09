/**
 * ============================================================================
 * App.jsx — Application Root Component
 * ============================================================================
 *
 * PURPOSE:
 *   Defines the entire routing structure of AppTrack.
 *   Determines which page a user sees based on their authentication state,
 *   profile completion status, and role (student or admin).
 *
 * ROUTING FLOW:
 *   1. User visits "/" → RootRedirect decides where to send them:
 *      - Not logged in            → HomePage (landing page)
 *      - Logged in, no profile    → /complete-profile
 *      - Logged in as admin       → /admin
 *      - Logged in as student     → /student
 *
 *   2. Public routes (only for guests):    /login, /register
 *   3. Protected routes (require auth):    /complete-profile
 *   4. Role-based routes (require role):   /student, /admin
 *
 * ROUTE GUARDS:
 *   - <PublicRoute>    → Redirects logged-in users away from login/register
 *   - <ProtectedRoute> → Redirects guests to login
 *   - <RoleRoute>      → Ensures user has the correct role
 * ============================================================================
 */

import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import RoleRoute from './components/RoleRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'

import { useAuth } from './context/AuthContext'

/**
 * RootRedirect Component
 * Directs users depending on authentication and profile completion status.
 */
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  if (!profile?.is_profile_completed) {
    return <Navigate to="/complete-profile" replace />
  }

  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/student" replace />
}

/**
 * NavigationBar Component
 * Styled to match the top navigation and header pill buttons in the UI.
 */
function NavigationBar() {
  const { user, profile, signOut } = useAuth()

  if (!user) return null

  return (
    <header
      style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2.5rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em'
          }}
        >
          Student Manager
        </h1>

        <nav style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link
            to="/home-page"
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            Home
          </Link>
          <Link
            to="/student"
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            Profile
          </Link>

          {/* Admin Panel button - visible ONLY to admin role */}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              Admin Panel
            </Link>
          )}
        </nav>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Styled Pill Buttons matching dashboard controls */}
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '1rem',
            border: 'none',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          🔔 Notifications
        </button>

        <button
          onClick={signOut}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.6rem 1.25rem',
            borderRadius: '1rem',
            border: 'none',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

/**
 * App
 * ---
 * Top-level component defining application routing structure.
 */
function App() {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home-page" element={<HomePage />} />

        {/* Public routes (guests only) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected route */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Role-based routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="student">
                <StudentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App

export default App
