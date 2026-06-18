import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import PropertyList from './pages/PropertyList'

export default function App() {
  const [session, setSession] = useState(null)
  // 初回セッション確認中はローディング表示
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 認証状態の変化（ログイン・ログアウト）を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#888' }}>
        読み込み中...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン済みなら物件一覧へリダイレクト */}
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        {/* ログイン済みなら物件一覧へリダイレクト */}
        <Route
          path="/register"
          element={session ? <Navigate to="/" replace /> : <Register />}
        />
        {/* 未ログインならログイン画面へリダイレクト（認証ガード） */}
        <Route
          path="/"
          element={session ? <PropertyList session={session} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
