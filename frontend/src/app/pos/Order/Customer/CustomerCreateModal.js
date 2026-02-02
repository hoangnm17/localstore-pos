import { useState } from "react"
import { customerCreate } from "../../../../services/Customer/customer.service"

export default function CustomerCreateModal({ phone, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    phone: phone,
  })

  const [saving, setSaving] = useState(false)

const handleSubmit = async () => {
  try {
    const res = await customerCreate(form)
    onCreated(res.data) // 🔥 data từ backend
  } catch (err) {
    console.error(err)
    alert("Tạo khách hàng thất bại")
  }
}

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="bg-white p-3 rounded" style={{ width: 400 }}>
        <h5 className="mb-3">Thêm khách hàng</h5>

        <input
          className="form-control mb-2"
          placeholder="Tên khách hàng"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="form-control mb-3"
          value={form.phone}
          disabled
        />

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  )
}
