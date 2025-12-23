import { useState } from "react";
import axios from "../utils/axios";
import "./BroadcastNotification.css";

function BroadcastNotification({ onSuccess }) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Ảnh không được vượt quá 5MB!");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Vui lòng nhập nội dung thông báo!");
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn gửi thông báo này đến TẤT CẢ người dùng?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("message", message);
      if (image) {
        formData.append("image", image);
      }

      await axios.post("/notification/broadcast", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Đã gửi thông báo đến tất cả người dùng!");
      setMessage("");
      setImage(null);
      setImagePreview(null);
      setShowForm(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("❌ Lỗi gửi broadcast:", err);
      alert(err.response?.data?.message || "❌ Lỗi gửi thông báo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="broadcast-container">
      {!showForm ? (
        <button className="btn-show-broadcast" onClick={() => setShowForm(true)}>
          📢 Gửi Thông Báo Hàng Loạt
        </button>
      ) : (
        <div className="broadcast-form">
          <h3>📢 Gửi Thông Báo Đến Tất Cả Người Dùng</h3>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            maxLength={1000}
            rows={5}
          />
          <div className="char-count">{message.length}/1000</div>

          <div className="broadcast-image-section">
            <label className="image-upload-label">
              📷 Thêm ảnh (tùy chọn)
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
            
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button className="remove-image-btn" onClick={removeImage}>✕</button>
              </div>
            )}
          </div>

          <div className="broadcast-actions">
            <button
              className="btn-send-broadcast"
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
            >
              {loading ? "⏳ Đang gửi..." : "📤 Gửi Thông Báo"}
            </button>
            <button
              className="btn-cancel-broadcast"
              onClick={() => {
                setShowForm(false);
                setMessage("");
                setImage(null);
                setImagePreview(null);
              }}
              disabled={loading}
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BroadcastNotification;
