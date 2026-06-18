import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // 会員登録処理
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      // パスワードが短すぎる場合などのエラーを日本語で表示
      if (error.message.includes('Password')) {
        setError('パスワードは6文字以上で入力してください。')
      } else if (error.message.includes('already registered')) {
        setError('このメールアドレスはすでに登録されています。')
      } else {
        setError('登録に失敗しました。入力内容を確認してください。')
      }
    } else {
      // 確認メール送信済みの状態
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>登録完了</h1>
          <p className="subtitle">確認メールを送信しました</p>
          <div className="success-message">
            {email} に確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
          </div>
          <div className="auth-link">
            <Link to="/login">ログイン画面へ戻る</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>新規登録</h1>
        <p className="subtitle">アカウントを作成してください</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード（6文字以上）</label>
            <input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成する'}
          </button>
        </form>

        <div className="auth-link">
          すでにアカウントをお持ちの方は
          <Link to="/login"> ログイン</Link>
        </div>
      </div>
    </div>
  )
}
