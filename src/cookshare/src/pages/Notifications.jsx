import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "./Notifications.css";

function Notifications() {
  const [reports, setReports] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-reports"); // my-reports, admin-notif
  const [processingId, setProcessingId] = useState(null);
  const [rejectReasonId, setRejectReasonId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const promises = [
        axios.get("/report/my-reports", { headers }),
        axios.get("/notification/my", { headers })
      ];
      if (userRole === "admin" || userRole === "moderator") {
        promises.push(axios.get("/report?status=pending", { headers }));
      }

      const results = await Promise.all(promises);
      setReports(results[0]?.data || []);
      setNotifications(results[1]?.data || []);
      if (userRole === "admin" || userRole === "moderator") {
        const adminRes = results[2];
        setAdminNotifications(adminRes?.data || []);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu thông báo/báo cáo:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCancelReport = async (recipeId) => {
    if (!window.confirm("Bạn chắc chứ sẽ hủy báo cáo này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/report/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Hủy báo cáo thành công!");
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi hủy báo cáo:", err);
      alert("❌ Lỗi hủy báo cáo!");
    }
  };

  const handleApproveReport = async (reportId) => {
    if (processingId) return;
    if (!window.confirm("Bạn chắc chứ sẽ xác nhận báo cáo này?")) return;

    setProcessingId(reportId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/report/${reportId}/status`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Xác nhận báo cáo thành công!");
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi xác nhận:", err);
      alert("❌ Lỗi xác nhận báo cáo!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do bác bỏ!");
      return;
    }

    if (processingId) return;
    setProcessingId(reportId);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/report/${reportId}/status`,
        { status: "rejected", rejectedReason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Bác bỏ báo cáo thành công!");
      setRejectReasonId(null);
      setRejectReason("");
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi bác bỏ:", err);
      alert("❌ Lỗi bác bỏ báo cáo!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReplyNotification = async (notifId) => {
    const content = replyContent[notifId] || "";
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung phản hồi");
      return;
    }
    setReplyingId(notifId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/notification/${notifId}/reply`,
        { message: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã gửi phản hồi");
      setReplyContent((prev) => ({ ...prev, [notifId]: "" }));
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi gửi phản hồi:", err);
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        alert("Thông báo này đã được phản hồi rồi");
      } else if (err?.response?.status === 404) {
        alert(msg || "Không tìm thấy thông báo hoặc bạn không phải người nhận");
      } else {
        alert(msg || "❌ Lỗi gửi phản hồi");
      }
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) {
    return <div className="notif-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="notif-container">
      <h1 className="page-title">🔔 Thông Báo</h1>

      {/* TAB NAVIGATION */}
      <div className="notif-tabs">
        <button
          className={`notif-tab ${activeTab === "my-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("my-reports")}
        >
          📝 Báo Cáo Của Tôi
        </button>
        <button
          className={`notif-tab ${activeTab === "inbox" ? "active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          🔔 Thông báo
        </button>
        {(userRole === "admin" || userRole === "moderator") && (
          <button
            className={`notif-tab ${activeTab === "admin-notif" ? "active" : ""}`}
            onClick={() => setActiveTab("admin-notif")}
          >
            ⚠️ Báo Cáo Chưa Xử Lý ({adminNotifications.length})
          </button>
        )}
      </div>

      {/* MY REPORTS TAB */}
      {activeTab === "my-reports" && (
        <section className="notif-section">
          <h2>📝 Báo Cáo Của Tôi</h2>
          {reports.length > 0 ? (
            <div className="notif-list">
              {reports.map((report) => (
                <div key={report.id} className={`notif-card notif-${report.status}`}>
                  <div className="notif-header">
                    <h4>
                      Bài viết:{" "}
                      <span
                        className="link-text"
                        onClick={() => navigate(`/recipe/${report.recipe_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {report.recipe_title}
                      </span>
                    </h4>
                    <span className={`notif-status status-${report.status}`}>
                      {report.status === "pending"
                        ? "⏳ Chờ xử lý"
                        : report.status === "accepted"
                        ? "✅ Được xác nhận"
                        : "❌ Bị bác bỏ"}
                    </span>
                  </div>
                  <div className="notif-body">
                    <p><b>Lý do báo cáo:</b> {report.reason}</p>
                    <p><b>Ngày báo cáo:</b> {new Date(report.created_at).toLocaleDateString("vi-VN")}</p>
                    {report.status === "rejected" && (
                      <p><b>Lý do bác bỏ:</b> {report.rejected_reason || "Không có"}</p>
                    )}
                    {report.processor_name && report.processed_at && (
                      <>
                        <p>
                          <b>Xử lý bởi:</b>{" "}
                          <span
                            onClick={() => navigate(`/user/${report.processor_id}`)}
                            style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                          >
                            {report.processor_name}
                          </span>
                        </p>
                        <p><b>Ngày xử lý:</b> {new Date(report.processed_at).toLocaleDateString("vi-VN")}</p>
                      </>
                    )}
                  </div>
                  {report.status === "pending" && (
                    <button
                      className="btn-cancel-report"
                      onClick={() => handleCancelReport(report.recipe_id)}
                    >
                      ❌ Hủy Báo Cáo
                    </button>
                  )}
                  {report.status === "rejected" && (
                    <p className="notif-hint">💡 Bạn có thể báo cáo lại nếu tìm thấy vấn đề tương tự.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">📭 Bạn chưa báo cáo bài viết nào</p>
          )}
        </section>
      )}

      {/* INBOX NOTIFICATIONS */}
      {activeTab === "inbox" && (
        <section className="notif-section">
          <h2>🔔 Thông báo</h2>
          {notifications.length > 0 ? (
            <div className="notif-list">
              {notifications.map((item) => {
                let meta = {};
                try {
                  meta = item.metadata ? JSON.parse(item.metadata) : {};
                } catch (e) {
                  meta = {};
                }
                const alreadyReplied = meta.has_reply === true;
                const isReplyNotif = item.type === "reply";
                return (
                  <div key={item.id} className="notif-card">
                    <div className="notif-header">
                      <h4>
                        Bạn nhận được một thông báo từ {item.sender_name} {" "}
                        {item.sender_role ? `(${item.sender_role})` : ""}
                      </h4>
                      <span className="notif-status">
                        {item.type === "report_warning" ? "⚠️ Cảnh báo" : item.type === "reply" ? "💬 Phản hồi" : "🔔 Thông báo"}
                      </span>
                    </div>
                    <div className="notif-body">
                      <p><b>Nội dung:</b> {item.message}</p>
                      <p><b>Ngày gửi:</b> {new Date(item.created_at).toLocaleDateString("vi-VN")}</p>
                      {meta.recipe_id && (
                        <p>
                          <b>Bài viết liên quan:</b>{" "}
                          <span
                            className="link-text"
                            onClick={() => navigate(`/recipe/${meta.recipe_id}`)}
                            style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                          >
                            Xem bài viết
                          </span>
                        </p>
                      )}
                    </div>
                    {alreadyReplied || isReplyNotif ? (
                      <p className="notif-hint">
                        {isReplyNotif
                          ? "💬 Đây là phản hồi từ người nhận."
                          : "💬 Bạn đã phản hồi thông báo này."}
                      </p>
                    ) : (
                      <div className="notif-actions">
                        <textarea
                          value={replyContent[item.id] || ""}
                          onChange={(e) => setReplyContent((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Nhập phản hồi..."
                          maxLength={500}
                        />
                        <button
                          className="btn-admin-accept"
                          onClick={() => handleReplyNotification(item.id)}
                          disabled={replyingId === item.id}
                        >
                          {replyingId === item.id ? "⏳ Đang gửi..." : "📨 Gửi phản hồi"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-message">📭 Chưa có thông báo nào</p>
          )}
        </section>
      )}

      {/* ADMIN NOTIFICATIONS TAB */}
      {activeTab === "admin-notif" && (userRole === "admin" || userRole === "moderator") && (
        <section className="notif-section">
          <h2>⚠️ Báo Cáo Chưa Xử Lý</h2>
          {adminNotifications.length > 0 ? (
            <div className="notif-list">
              {adminNotifications.map((notif) => (
                <div key={notif.id} className="notif-card notif-admin">
                  <div className="notif-header">
                    <h4>
                      Bài viết:{" "}
                      <span
                        className="link-text"
                        onClick={() => navigate(`/recipe/${notif.recipe_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {notif.recipe_title}
                      </span>
                    </h4>
                    <span className="notif-count">
                      {notif.total_reports_for_recipe} báo cáo
                    </span>
                  </div>
                  <div className="notif-body">
                    <p>
                      <b>Người báo cáo:</b>{" "}
                      <span
                        className="link-text"
                        onClick={() => navigate(`/user/${notif.reporter_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {notif.reporter_name}
                      </span>
                    </p>
                    <p><b>Lý do:</b> {notif.reason}</p>
                    <p>
                      <b>Tác giả bài viết:</b>{" "}
                      <span
                        className="link-text"
                        onClick={() => navigate(`/user/${notif.author_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {notif.author_name}
                      </span>
                    </p>
                    <p><b>Ngày báo cáo:</b> {new Date(notif.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>

                  {rejectReasonId === notif.id ? (
                    <div className="reject-form-inline">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do bác bỏ..."
                        maxLength={500}
                      />
                      <div className="char-count">{rejectReason.length}/500</div>
                      <div className="reject-actions-inline">
                        <button
                          className="btn-confirm-inline"
                          onClick={() => handleRejectReport(notif.id)}
                          disabled={processingId === notif.id || !rejectReason.trim()}
                        >
                          {processingId === notif.id ? "⏳ Gửi..." : "✅ Gửi"}
                        </button>
                        <button
                          className="btn-cancel-inline"
                          onClick={() => {
                            setRejectReasonId(null);
                            setRejectReason("");
                          }}
                          disabled={processingId === notif.id}
                        >
                          ❌ Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="notif-actions">
                      <button
                        className="btn-admin-accept"
                        onClick={() => handleApproveReport(notif.id)}
                        disabled={processingId === notif.id}
                      >
                        {processingId === notif.id ? "⏳ Xử lý..." : "✅ Xác Nhận"}
                      </button>
                      <button
                        className="btn-admin-reject"
                        onClick={() => setRejectReasonId(notif.id)}
                        disabled={processingId === notif.id}
                      >
                        ❌ Bác Bỏ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">✅ Không có báo cáo chưa xử lý</p>
          )}
        </section>
      )}
    </div>
  );
}

export default Notifications;
