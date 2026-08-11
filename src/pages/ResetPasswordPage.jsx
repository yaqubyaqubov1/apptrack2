import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setError('')
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!session) {
      setLoading(false)
      setError('This password reset link is invalid or has expired. Please request a new one.')
      return
    }

    if (password.length < 8) {
      setLoading(false)
      setError('Your new password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setLoading(false)
      setError('The passwords do not match.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setMessage('Your password has been updated successfully. You can now sign in with your new password.')
    setPassword('')
    setConfirmPassword('')

    window.setTimeout(() => navigate('/login', { replace: true }), 1800)
  }

  return (
    <main className="login-page">
      <div className="login-orb login-orb--1" />
      <div className="login-orb login-orb--2" />
      <div className="login-orb login-orb--3" />

      <div className="login-container login-container--single">
        <div className="login-form-wrap login-form-wrap--centered">
          <div className="login-form-card">
            <div className="login-form-header">
              <Link to="/" className="login-logo login-logo--form">
                <span className="login-logo-icon">A</span>
                AppTrack
              </Link>
              <h2>Set a new password</h2>
              <p>Choose a new password for your AppTrack account.</p>
            </div>

            {message && (
              <div className="login-msg login-msg--success" role="status">
                <span>✓</span> {message}
              </div>
            )}

            {error && (
              <div className="login-msg login-msg--error" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            {!authLoading && !session ? (
              <div className="login-reset-invalid">
                <p>Your reset session is not available. Please request another password reset email.</p>
                <Link to="/forgot-password" className="login-submit-btn login-link-btn">Request a new link</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="reset-password">New password</label>
                  <div className="login-password-wrap">
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="login-pw-toggle"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="reset-password-confirm">Confirm new password</label>
                  <div className="login-password-wrap">
                    <input
                      id="reset-password-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="login-pw-toggle"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                    >
                      {showConfirmPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-submit-btn" disabled={loading || !!message}>
                  {loading ? <span className="login-spinner" /> : 'Update password'}
                </button>
              </form>
            )}

            <p className="login-footer-text">
              <Link to="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
