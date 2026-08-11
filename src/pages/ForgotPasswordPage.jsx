import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setLoading(false)
      setError('Please enter your email address.')
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage('Check your email for a password reset link. The link will open AppTrack so you can choose a new password.')
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
              <h2>Forgot your password?</h2>
              <p>Enter your email and we&apos;ll send you a secure link to reset it.</p>
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

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : 'Send reset link'}
              </button>
            </form>

            <p className="login-footer-text">
              Remember your password? <Link to="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
