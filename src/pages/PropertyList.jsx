import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PropertyForm from '../components/PropertyForm'

// カードの背景グラデーション（インデックスで循環）
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

export default function PropertyList({ session }) {
  const [properties, setProperties]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [showForm, setShowForm]           = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  // マウント時に物件一覧を取得
  useEffect(() => {
    fetchProperties()
  }, [])

  // 物件一覧を取得（SELECT）
  const fetchProperties = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError('物件の取得に失敗しました。')
    } else {
      setProperties(data)
    }
    setLoading(false)
  }

  // 物件を新規登録（INSERT）または更新（UPDATE）
  // 成功時は null、失敗時はエラーメッセージ文字列を返す
  const handleSubmit = async (formData) => {
    if (editingProperty) {
      // 更新（UPDATE）
      const { error } = await supabase
        .from('properties')
        .update(formData)
        .eq('id', editingProperty.id)

      if (error) return '物件の更新に失敗しました。'
    } else {
      // 新規登録（INSERT）：ログイン中ユーザーのIDを付与
      const { error } = await supabase
        .from('properties')
        .insert({ ...formData, user_id: session.user.id })

      if (error) return '物件の登録に失敗しました。'
    }

    // 成功後に一覧を再取得してモーダルを閉じる
    await fetchProperties()
    setShowForm(false)
    setEditingProperty(null)
    return null
  }

  // 物件を削除（DELETE）
  const handleDelete = async (id) => {
    if (!window.confirm('この物件を削除しますか？')) return

    const { error } = await supabase.from('properties').delete().eq('id', id)

    if (error) {
      setError('削除に失敗しました。')
    } else {
      // 再フェッチせずローカルのstateから除外（即時反映）
      setProperties((prev) => prev.filter((p) => p.id !== id))
    }
  }

  // 編集モードでフォームを開く
  const handleEdit = (property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  // 新規登録モードでフォームを開く
  const handleAdd = () => {
    setEditingProperty(null)
    setShowForm(true)
  }

  // フォームを閉じる
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProperty(null)
  }

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-logo">不動産<span>管理</span></div>
        <div className="header-right">
          <span className="header-email">{session.user.email}</span>
          <button className="btn-logout" onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">物件一覧</h2>
            {!loading && (
              <p className="page-subtitle">登録物件：{properties.length}件</p>
            )}
          </div>
          <button className="btn-add" onClick={handleAdd}>＋ 物件を登録する</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-text">読み込み中...</div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <p>物件がまだ登録されていません。</p>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: '1rem' }}
              onClick={handleAdd}
            >
              最初の物件を登録する
            </button>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((property, index) => (
              <div key={property.id} className="property-card">
                <div
                  className="property-card-image"
                  style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }}
                >
                  🏠
                </div>
                <div className="property-card-body">
                  <h3 className="property-name">{property.name}</h3>
                  <p className="property-floor-plan">{property.floor_plan}</p>
                  <p className="property-rent">
                    {property.rent.toLocaleString()}円<span> / 月</span>
                  </p>
                  <p className="property-area">📍 {property.area}</p>

                  <div className="property-actions">
                    <button className="btn-edit" onClick={() => handleEdit(property)}>
                      編集
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(property.id)}>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 登録・編集モーダル */}
      {showForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
