import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "./Notifications.css";

function Notifications() {
  const [reports, setReports] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-reports");
  const [processingId, setProcessingId] = useState(null);
  const [rejectReasonId, setRejectReasonId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [replyImage, setReplyImage] = useState({});
  const [replyImagePreview, setReplyImagePreview] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const promises = [
        axios.get("/report/my-reports", { headers }),
        axios.get("/notification/my", { headers }),
        axios.get("/notification/unread-count", { headers })
      ];
      if (userRole === "admin" || userRole === "moderator") {
        promises.push(axios.get("/report?status=pending", { headers }));
      }

      const results = await Promise.all(promises);
      setReports(results[0]?.data || []);
      setNotifications(results[1]?.data || []);
      setUnreadCount(results[2]?.data?.unread || 0);
      if (userRole === "admin" || userRole === "moderator") {
        setAdminNotifications(results[3]?.data || []);
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

  const handleCancelReport = async (reportId, targetType) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy báo cáo này?")) return;

    try {
      const token = localStorage.getItem("token");
      const report = reports.find(r => r.id === reportId);
      let targetId;
      if (targetType === "recipe") {
        targetId = report.recipe_id;
      } else if (targetType === "comment") {
        targetId = report.comment_id;
      } else if (targetType === "user") {
        targetId = report.reported_user_id;
      }
      
      await axios.delete(`/report/${targetType}/${targetId}`, {
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
    if (!window.confirm("Bạn chắc chắn muốn xác nhận báo cáo này?")) return;

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

  const handleReplyImageChange = (notifId, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Ảnh không được vượt quá 5MB!");
        return;
      }
      setReplyImage(prev => ({ ...prev, [notifId]: file }));
      setReplyImagePreview(prev => ({ ...prev, [notifId]: URL.createObjectURL(file) }));
    }
  };

  const removeReplyImage = (notifId) => {
    setReplyImage(prev => ({ ...prev, [notifId]: null }));
    setReplyImagePreview(prev => ({ ...prev, [notifId]: null }));
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
      const formData = new FormData();
      formData.append("message", content);
      if (replyImage[notifId]) {
        formData.append("image", replyImage[notifId]);
      }

      await axios.post(
        `/notification/${notifId}/reply`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      alert("✅ Đã gửi phản hồi");
      setReplyContent(prev => ({ ...prev, [notifId]: "" }));
      setReplyImage(prev => ({ ...prev, [notifId]: null }));
      setReplyImagePreview(prev => ({ ...prev, [notifId]: null }));
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi gửi phản hồi:", err);
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        alert("Thông báo này đã được phản hồi rồi");
      } else {
        alert(msg || "❌ Lỗi gửi phản hồi");
      }
    } finally {
      setReplyingId(null);
    }
  };

  const handleMarkBroadcastRead = async (broadcastId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/notification/broadcast/${broadcastId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.notification_type === "broadcast" && n.id === broadcastId 
          ? { ...n, is_read: true } 
          : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkPersonalRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/notification/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.notification_type !== "broadcast" && n.id === notifId 
          ? { ...n, is_read: true } 
          : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("/notification/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
      alert("❌ Lỗi đánh dấu tất cả đã đọc!");
    }
  };

  const getTargetTypeLabel = (type) => {
    switch (type) {
      case "recipe": return "📝 Bài viết";
      case "comment": return "💬 Bình luận";
      case "user": return "👤 Người dùng";
      default: return type;
    }
  };

  if (loading) {
    return <div className="notif-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="notif-container">
      <h1 className="page-title">🔔 Thông Báo</h1>

      <div className="notif-tabs">
        <button className={`notif-tab ${activeTab === "my-reports" ? "active" : ""}`} onClick={() => setActiveTab("my-reports")}>
          📝 Báo Cáo Của Tôi
        </button>
        <button className={`notif-tab ${activeTab === "inbox" ? "active" : ""}`} onClick={() => setActiveTab("inbox")}>
          🔔 Thông báo ({notifications.filter(n => !n.is_read).length})
        </button>
        {(userRole === "admin" || userRole === "moderator") && (
          <button className={`notif-tab ${activeTab === "admin-notif" ? "active" : ""}`} onClick={() => setActiveTab("admin-notif")}>
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
                      {getTargetTypeLabel(report.target_type)}:{" "}
                      {report.target_type === "recipe" && (
                        <span className="link-text" onClick={() => navigate(`/recipe/${report.recipe_id}`)}>
                          {report.recipe_title}
                        </span>
                      )}
                      {report.target_type === "comment" && (
                        <span>"{report.comment_content?.substring(0, 50)}..."</span>
                      )}
                      {report.target_type === "user" && (
                        <span className="link-text" onClick={() => navigate(`/user/${report.reported_user_id}`)}>
                          {report.reported_username}
                        </span>
                      )}
                    </h4>
                    <span className={`notif-status status-${report.status}`}>
                      {report.status === "pending" ? "⏳ Chờ xử lý" : report.status === "accepted" ? "✅ Được xác nhận" : "❌ Bị bác bỏ"}
                    </span>
                  </div>
                  <div className="notif-body">
                    <p><b>Lý do báo cáo:</b> {report.reason}</p>
                    {report.image_url && (
                      <div className="report-image-preview">
                        <p><b>Ảnh đính kèm:</b></p>
                        <img src={`${API_BASE}${report.image_url}`} alt="Bằng chứng" />
                      </div>
                    )}
                    <p><b>Ngày báo cáo:</b> {new Date(report.created_at).toLocaleDateString("vi-VN")}</p>
                    {report.status === "rejected" && (
                      <p><b>Lý do bác bỏ:</b> {report.rejected_reason || "Không có"}</p>
                    )}
                    {report.processor_name && (
                      <p><b>Xử lý bởi:</b> {report.processor_name}</p>
                    )}
                  </div>
                  {report.status === "pending" && (
                    <button className="btn-cancel-report" onClick={() => handleCancelReport(report.id, report.target_type)}>
                      ❌ Hủy Báo Cáo
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">📭 Bạn chưa báo cáo nội dung nào</p>
          )}
        </section>
      )}

      {/* INBOX NOTIFICATIONS */}
      {activeTab === "inbox" && (
        <section className="notif-section">
          <div className="notif-section-header">
            <h2>🔔 Thông báo</h2>
            {unreadCount > 0 && (
              <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                ✓ Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          {notifications.length > 0 ? (
            <div className="notif-list">
              {notifications.map((item) => {
                const isBroadcast = item.notification_type === "broadcast";
                let meta = {};
                try {
                  meta = item.metadata ? JSON.parse(item.metadata) : {};
                } catch (e) {
                  meta = {};
                }
                const alreadyReplied = meta.has_reply === true;
                const isReplyNotif = item.type === "reply";
                const isUnread = !item.is_read;

                return (
                  <div 
                    key={`${item.notification_type || "personal"}-${item.id}`} 
                    className={`notif-card ${isUnread ? "unread" : ""} ${isBroadcast ? "broadcast" : ""}`}
                  >
                    <div className="notif-header">
                      <h4>
                        {isBroadcast ? "📢 Thông báo chung" : `Từ ${item.sender_name}`}
                        {item.sender_role && !isBroadcast ? ` (${item.sender_role})` : ""}
                      </h4>
                      <div className="notif-header-right">
                        {isUnread && (
                          <span className="unread-badge">Chưa đọc</span>
                        )}
                        <span className="notif-status">
                          {isBroadcast ? "📢 Broadcast" : item.type === "report_warning" ? "⚠️ Cảnh báo" : item.type === "reply" ? "💬 Phản hồi" : "🔔 Thông báo"}
                        </span>
                      </div>
                    </div>
                    <div className="notif-body">
                      <p><b>Nội dung:</b> {item.message}</p>
                      {item.image_url && (
                        <div className="notif-image">
                          <img src={`${API_BASE}${item.image_url}`} alt="Ảnh đính kèm" />
                        </div>
                      )}
                      <p><b>Ngày gửi:</b> {new Date(item.created_at).toLocaleDateString("vi-VN")}</p>
                      {meta.recipe_id && (
                        <p>
                          <b>Bài viết liên quan:</b>{" "}
                          <span className="link-text" onClick={() => navigate(`/recipe/${meta.recipe_id}`)}>
                            Xem bài viết
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Nút đánh dấu đã đọc */}
                    {isUnread && (
                      <button 
                        className="btn-mark-read"
                        onClick={() => isBroadcast ? handleMarkBroadcastRead(item.id) : handleMarkPersonalRead(item.id)}
                      >
                        ✓ Đánh dấu đã đọc
                      </button>
                    )}
                    
                    {!isBroadcast && !alreadyReplied && !isReplyNotif && (
                      <div className="notif-actions">
                        <textarea
                          value={replyContent[item.id] || ""}
                          onChange={(e) => setReplyContent(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Nhập phản hồi..."
                          maxLength={500}
                        />
                        
                        {/* Upload ảnh phản hồi */}
                        <div className="reply-image-section">
                          <label className="reply-image-label">
                            📷 Thêm ảnh
                            <input type="file" accept="image/*" onChange={(e) => handleReplyImageChange(item.id, e)} style={{ display: "none" }} />
                          </label>
                          {replyImagePreview[item.id] && (
                            <div className="reply-image-preview">
                              <img src={replyImagePreview[item.id]} alt="Preview" />
                              <button onClick={() => removeReplyImage(item.id)}>✕</button>
                            </div>
                          )}
                        </div>

                        <button className="btn-admin-accept" onClick={() => handleReplyNotification(item.id)} disabled={replyingId === item.id}>
                          {replyingId === item.id ? "⏳ Đang gửi..." : "📨 Gửi phản hồi"}
                        </button>
                      </div>
                    )}
                    
                    {(alreadyReplied || isReplyNotif) && !isBroadcast && (
                      <p className="notif-hint">{isReplyNotif ? "💬 Đây là phản hồi." : "💬 Bạn đã phản hồi."}</p>
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
                      {getTargetTypeLabel(notif.target_type)}:{" "}
                      {notif.target_type === "recipe" && (
                        <span className="link-text" onClick={() => navigate(`/recipe/${notif.recipe_id}`)}>
                          {notif.recipe_title}
                        </span>
                      )}
                      {notif.target_type === "comment" && `"${notif.comment_content?.substring(0, 50)}..."`}
                      {notif.target_type === "user" && (
                        <span className="link-text" onClick={() => navigate(`/user/${notif.reported_user_id}`)}>
                          {notif.reported_username}
                        </span>
                      )}
                    </h4>
                    <span className="notif-count">{notif.total_reports_for_target} báo cáo</span>
                  </div>
                  <div className="notif-body">
                    <p><b>Người báo cáo:</b>{" "}
                      <span className="link-text" onClick={() => navigate(`/user/${notif.reporter_id}`)}>
                        {notif.reporter_name}
                      </span>
                    </p>
                    <p><b>Lý do:</b> {notif.reason}</p>
                    {notif.image_url && (
                      <div className="report-image-preview">
                        <p><b>Bằng chứng:</b></p>
                        <img src={`${API_BASE}${notif.image_url}`} alt="Bằng chứng" />
                      </div>
                    )}
                    <p><b>Ngày báo cáo:</b> {new Date(notif.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>

                  {rejectReasonId === notif.id ? (
                    <div className="reject-form-inline">
                      <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhập lý do bác bỏ..." maxLength={500} />
                      <div className="char-count">{rejectReason.length}/500</div>
                      <div className="reject-actions-inline">
                        <button className="btn-confirm-inline" onClick={() => handleRejectReport(notif.id)} disabled={processingId === notif.id || !rejectReason.trim()}>
                          {processingId === notif.id ? "⏳ Gửi..." : "✅ Gửi"}
                        </button>
                        <button className="btn-cancel-inline" onClick={() => { setRejectReasonId(null); setRejectReason(""); }} disabled={processingId === notif.id}>
                          ❌ Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="notif-actions">
                      <button className="btn-admin-accept" onClick={() => handleApproveReport(notif.id)} disabled={processingId === notif.id}>
                        {processingId === notif.id ? "⏳ Xử lý..." : "✅ Xác Nhận"}
                      </button>
                      <button className="btn-admin-reject" onClick={() => setRejectReasonId(notif.id)} disabled={processingId === notif.id}>
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
