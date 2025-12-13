import { useState } from "react";
import axios from "../utils/axios";
import "./ReportButton.css";

function ReportButton({ recipeId, initialStatus = "unreported" }) {
  const [isReported, setIsReported] = useState(initialStatus === "reported");
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReportClick = () => {
    if (isReported) {
      handleCancelReport();
    } else {
      setShowModal(true);
    }
  };

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do báo cáo!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/report/recipe/${recipeId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Báo cáo bài viết thành công!");
      setIsReported(true);
      setShowModal(false);
      setReason("");
    } catch (err) {
      console.error("❌ Lỗi báo cáo:", err);
      const errorMsg = err.response?.data?.message || "Lỗi báo cáo bài viết!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async () => {
    if (!window.confirm("Bạn chắc chứ sẽ hủy báo cáo này?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/report/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Hủy báo cáo thành công!");
      setIsReported(false);
    } catch (err) {
      console.error("❌ Lỗi hủy báo cáo:", err);
      alert("❌ Lỗi hủy báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`btn-report ${isReported ? "reported" : ""}`}
        onClick={handleReportClick}
        disabled={loading}
        title={isReported ? "Hủy báo cáo" : "Báo cáo bài viết"}
      >
        {isReported ? "✅ Hủy Báo Cáo" : "🚩 Báo Cáo"}
      </button>

      {/* MODAL BÁO CÁO */}
      {showModal && (
        <div className="report-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🚩 Báo Cáo Bài Viết</h3>
            <p>Vui lòng mô tả lý do báo cáo bài viết này</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Bài viết chứa nội dung không phù hợp, spam, v.v."
              maxLength={500}
              rows={6}
            />
            <div className="char-count">{reason.length}/500</div>
            <div className="modal-actions">
              <button
                className="btn-submit-report"
                onClick={handleSubmitReport}
                disabled={loading || !reason.trim()}
              >
                {loading ? "⏳ Đang gửi..." : "✅ Gửi Báo Cáo"}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportButton;
