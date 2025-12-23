import { useState, useEffect } from "react";
import axios from "../utils/axios";
import "./ReportButton.css";

/**
 * ReportButton - Component báo cáo đa năng
 * @param {string} targetType - Loại báo cáo: "recipe", "comment", "user"
 * @param {number} targetId - ID của đối tượng báo cáo
 * @param {string} initialStatus - Trạng thái ban đầu: "unreported" | "reported"
 * @param {string} buttonStyle - Style nút: "default" | "icon" | "text"
 */
function ReportButton({ 
  targetType = "recipe", 
  targetId, 
  initialStatus = "unreported",
  buttonStyle = "default" 
}) {
  const [isReported, setIsReported] = useState(initialStatus === "reported");
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/report/quota", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuota(res.data);
    } catch (err) {
      console.error("Lỗi lấy quota:", err);
    }
  };

  const handleReportClick = () => {
    if (isReported) {
      handleCancelReport();
    } else {
      setShowModal(true);
    }
  };

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

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do báo cáo!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("reason", reason);
      if (image) {
        formData.append("image", image);
      }

      await axios.post(
        `/report/${targetType}/${targetId}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );

      alert("✅ Báo cáo thành công!");
      setIsReported(true);
      setShowModal(false);
      setReason("");
      setImage(null);
      setImagePreview(null);
      fetchQuota();
    } catch (err) {
      console.error("❌ Lỗi báo cáo:", err);
      const errorMsg = err.response?.data?.message || "Lỗi báo cáo!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async () => {
    if (!window.confirm("Bạn chắc chắn muốn hủy báo cáo này?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/report/${targetType}/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Hủy báo cáo thành công!");
      setIsReported(false);
      fetchQuota();
    } catch (err) {
      console.error("❌ Lỗi hủy báo cáo:", err);
      alert("❌ Lỗi hủy báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case "recipe": return "Bài Viết";
      case "comment": return "Bình Luận";
      case "user": return "Người Dùng";
      default: return "Nội Dung";
    }
  };

  const currentQuota = quota ? quota[targetType] : 3;

  const renderButton = () => {
    if (buttonStyle === "icon") {
      return (
        <button
          className={`btn-report-icon ${isReported ? "reported" : ""}`}
          onClick={handleReportClick}
          disabled={loading}
          title={isReported ? "Hủy báo cáo" : `Báo cáo ${getTargetLabel().toLowerCase()}`}
        >
          {isReported ? "✅" : "🚩"}
        </button>
      );
    }

    if (buttonStyle === "text") {
      return (
        <span
          className={`btn-report-text ${isReported ? "reported" : ""}`}
          onClick={handleReportClick}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
        >
          {isReported ? "Hủy báo cáo" : "Báo cáo"}
        </span>
      );
    }

    return (
      <button
        className={`btn-report ${isReported ? "reported" : ""}`}
        onClick={handleReportClick}
        disabled={loading}
        title={isReported ? "Hủy báo cáo" : `Báo cáo ${getTargetLabel().toLowerCase()}`}
      >
        {isReported ? "✅ Hủy Báo Cáo" : "🚩 Báo Cáo"}
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* MODAL BÁO CÁO */}
      {showModal && (
        <div className="report-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🚩 Báo Cáo {getTargetLabel()}</h3>
            
            {quota && (
              <p className="quota-info">
                Số lượt báo cáo còn lại: <strong>{currentQuota}/3</strong>
              </p>
            )}

            <p>Vui lòng mô tả lý do báo cáo</p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Ví dụ: ${targetType === "comment" ? "Bình luận spam, xúc phạm..." : targetType === "user" ? "Người dùng có hành vi không phù hợp..." : "Bài viết chứa nội dung không phù hợp..."}`}
              maxLength={500}
              rows={5}
            />
            <div className="char-count">{reason.length}/500</div>

            {/* Upload ảnh bằng chứng */}
            <div className="report-image-section">
              <label className="image-upload-label">
                📷 Thêm ảnh bằng chứng (tùy chọn)
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

            <div className="modal-actions">
              <button
                className="btn-submit-report"
                onClick={handleSubmitReport}
                disabled={loading || !reason.trim() || currentQuota <= 0}
              >
                {loading ? "⏳ Đang gửi..." : "✅ Gửi Báo Cáo"}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => {
                  setShowModal(false);
                  setReason("");
                  setImage(null);
                  setImagePreview(null);
                }}
                disabled={loading}
              >
                ❌ Hủy
              </button>
            </div>

            {currentQuota <= 0 && (
              <p className="quota-warning">
                ⚠️ Bạn đã hết lượt báo cáo. Vui lòng chờ báo cáo trước đó được xử lý.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ReportButton;
