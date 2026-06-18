import { useState } from 'react'

// 間取りの選択肢
const FLOOR_PLANS = ['1K', '1DK', '1LDK', '2LDK', '3LDK', '4LDK以上']

// モーダルフォーム（新規登録・編集の両方で使う）
export default function PropertyForm({ property, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name:       property?.name       || '',
    rent:       property?.rent       || '',
    area:       property?.area       || '',
    floor_plan: property?.floor_plan || '1LDK',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const submitData = {
      ...formData,
      rent: parseInt(formData.rent, 10), // 文字列→数値に変換
    }

    // 親コンポーネントの保存処理を呼び出し、エラー文字列が返ったら表示
    const err = await onSubmit(submitData)
    if (err) setError(err)

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* クリックが内側で止まるよう伝播を止める */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{property ? '物件を編集する' : '物件を登録する'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>物件名</label>
            <input
              type="text"
              name="name"
              placeholder="例：渋谷マンション 101号室"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>家賃（円）</label>
              <input
                type="number"
                name="rent"
                placeholder="例：150000"
                value={formData.rent}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>間取り</label>
              <select name="floor_plan" value={formData.floor_plan} onChange={handleChange}>
                {FLOOR_PLANS.map((fp) => (
                  <option key={fp} value={fp}>{fp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>エリア</label>
            <input
              type="text"
              name="area"
              placeholder="例：東京都渋谷区"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '保存中...' : property ? '更新する' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
