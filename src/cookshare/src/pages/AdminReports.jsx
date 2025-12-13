import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";
import "./AdminReports.css";
import { useNavigate, Link } from "react-router-dom";

function AdminReports() {
  const [allReports, setAllReports] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(null);
  const [warningStatus, setWarningStatus] = useState({}); // { [reportId]: { state, sent_at, reply } }
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "Quản trị";

  useEffect(() => {
    if (userRole !== "admin" && userRole !== "moderator") {
      alert("❌ Bạn không có quyền truy cập!");
      navigate("/");
      return;
    }

    fetchAllReports();
  }, [navigate, userRole]);

  const fetchWarningStatuses = useCallback(async (reports) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const promises = reports.map((r) =>
        axios
          .get(`/notification/report/${r.id}/status`, { headers })
          .then((res) => ({ id: r.id, data: res.data }))
          .catch(() => ({ id: r.id, data: { state: "none" } }))
      );
      const results = await Promise.all(promises);
      const map = {};
      results.forEach((item) => {
        map[item.id] = item.data || { state: "none" };
      });
      setWarningStatus(map);
    } catch (err) {
      console.error("⚠️ Lỗi lấy trạng thái cảnh báo:", err);
    }
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statuses = ["pending", "accepted", "rejected"];
      const allData = [];

      // Fetch báo cáo cho mỗi status
      for (const status of statuses) {
        const res = await axios.get(`/report?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allData.push(...(res.data || []));
      }

      setAllReports(allData);
      fetchWarningStatuses(allData);
    } catch (err) {
      console.error("❌ Lỗi lấy báo cáo:", err);
      alert("❌ Lỗi lấy danh sách báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  // Lọc báo cáo theo status được chọn
  const filteredReports = allReports.filter(r => r.status === filter);

  const handleApprove = async (reportId) => {
    if (processingId) return;
    setProcessingId(reportId);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/report/${reportId}/status`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Xác nhận báo cáo thành công!");
      fetchAllReports();
    } catch (err) {
      console.error("❌ Lỗi xác nhận:", err);
      alert("❌ Lỗi xác nhận báo cáo!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reportId) => {
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
      setShowRejectForm(null);
      setRejectReason("");
      fetchAllReports();
    } catch (err) {
      console.error("❌ Lỗi bác bỏ:", err);
      alert("❌ Lỗi bác bỏ báo cáo!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleNotifyAuthor = async (report) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập");
      return;
    }
    const roleLabel = userRole === "admin" ? "admin" : "moderator";
    const template =
      `Bạn nhận được một cảnh báo đến từ ${username} (${roleLabel}).\n` +
      `Đã có một báo cáo về bài viết "${report.recipe_title}" của bạn với lý do: ${report.reason}.\n` +
      "Vui lòng phản hồi sớm nhất! Nếu không bài viết sẽ bị đánh dấu; bài viết bị đánh dấu 3 lần sẽ bị khóa bài viết.";

    if (!window.confirm("Gửi cảnh báo cho tác giả bài viết này?")) return;

    try {
      await axios.post(
        "/notification/send",
        {
          receiver_id: report.author_id,
          message: template,
          type: "report_warning",
          metadata: { recipe_id: report.recipe_id, report_id: report.id },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã gửi cảnh báo đến tác giả");
      setWarningStatus((prev) => ({
        ...prev,
        [report.id]: { state: "waiting", sent_at: new Date().toISOString() },
      }));
    } catch (err) {
      console.error("❌ Lỗi gửi cảnh báo:", err);
      alert("❌ Lỗi gửi cảnh báo");
    }
  };

  const handleViewReply = (reportId) => {
    const status = warningStatus[reportId];
    if (!status || !status.reply) return;
    const { reply } = status;
    const sentAt = new Date(reply.created_at).toLocaleString("vi-VN");
    alert(`📨 Phản hồi từ ${reply.sender_name || "tác giả"} (${reply.sender_role || "user"})\n---\n${reply.message}\n---\nGửi lúc: ${sentAt}`);
  };

  if (loading) {
    return <div className="admin-reports-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="admin-reports-container">
      <h1 className="page-title">⚠️ Quản Lý Báo Cáo Bài Viết</h1>

      {/* FILTERS */}
      <div className="reports-filters">
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          ⏳ Chưa Xử Lý ({allReports.filter(r => r.status === "pending").length})
        </button>
        <button
          className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          ✅ Đã Xác Nhận ({allReports.filter(r => r.status === "accepted").length})
        </button>
        <button
          className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          ❌ Đã Bác Bỏ ({allReports.filter(r => r.status === "rejected").length})
        </button>
      </div>

      {/* REPORTS LIST */}
      <div className="reports-section">
        {filteredReports.length > 0 ? (
          <div className="reports-list">
            {filteredReports.map((report) => {
              const warn = warningStatus[report.id] || { state: "none" };
              const isWaiting = warn.state === "waiting";
              const isReplied = warn.state === "replied";
              return (
              <div key={report.id} className={`report-card report-${report.status}`}>
                <div className="report-header">
                  <h3>📝 <Link to={`/recipe/${report.recipe_id}`} style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}>{report.recipe_title}</Link></h3>
                  <div className="report-meta">
                    <span className="report-status status-{report.status}">
                      {report.status === "pending"
                        ? "⏳ Chưa xử lý"
                        : report.status === "accepted"
                        ? "✅ Đã xác nhận"
                        : "❌ Đã bác bỏ"}
                    </span>
                    <span className="report-count">
                      {report.total_reports_for_recipe} báo cáo
                    </span>
                    {warn.state !== "none" && (
                      <span className={`warning-status-pill warning-${warn.state}`}>
                        {warn.state === "waiting" ? "⏳ Chờ phản hồi" : "💬 Đã phản hồi"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="report-body">
                  <div className="report-info">
                    <p>
                      <b>👤 Tác giả:</b>{" "}
                      <span
                        onClick={() => navigate(`/user/${report.author_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {report.author_name}
                      </span>
                      {" "}({report.author_email})
                    </p>
                    <p>
                      <b>🚩 Báo cáo từ:</b>{" "}
                      <span
                        onClick={() => navigate(`/user/${report.reporter_id}`)}
                        style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                      >
                        {report.reporter_name}
                      </span>
                      {" "}({report.reporter_email})
                    </p>
                    <p><b>📌 Lý do báo cáo:</b> {report.reason}</p>
                    <p><b>📅 Ngày báo cáo:</b> {new Date(report.created_at).toLocaleDateString("vi-VN")}</p>
                    {report.rejected_reason && (
                      <p><b>💬 Lý do bác bỏ:</b> {report.rejected_reason}</p>
                    )}
                    {report.processor_name && report.processed_at && (
                      <>
                        <p>
                          <b>👨‍⚖️ Xử lý bởi:</b>{" "}
                          <span
                            onClick={() => navigate(`/user/${report.processor_id}`)}
                            style={{ cursor: "pointer", color: "var(--primary-color, #ff7f50)" }}
                          >
                            {report.processor_name}
                          </span>
                        </p>
                        <p><b>⏰ Ngày xử lý:</b> {new Date(report.processed_at).toLocaleDateString("vi-VN")}</p>
                      </>
                    )}
                  </div>
                </div>

                {report.status === "pending" && (
                  <div className="report-actions">
                    {isReplied ? (
                      <button
                        className="btn-notify-author btn-view-reply"
                        onClick={() => handleViewReply(report.id)}
                      >
                        📨 Xem Phản Hồi
                      </button>
                    ) : (
                      <button
                        className="btn-notify-author"
                        onClick={() => handleNotifyAuthor(report)}
                        disabled={isWaiting}
                      >
                        {isWaiting ? "⏳ Chờ phản hồi" : "🔔 Cảnh Báo Tác Giả"}
                      </button>
                    )}
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(report.id)}
                      disabled={processingId === report.id}
                    >
                      {processingId === report.id ? "⏳ Đang xử lý..." : "✅ Xác Nhận Vi Phạm"}
                    </button>
                    <button
                      className="btn-reject-modal"
                      onClick={() => setShowRejectForm(report.id)}
                      disabled={processingId === report.id}
                    >
                      ❌ Bác Bỏ Báo Cáo
                    </button>
                  </div>
                )}

                {showRejectForm === report.id && report.status === "pending" && (
                  <div className="reject-form">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do bác bỏ báo cáo (ví dụ: Bài viết không vi phạm, báo cáo không hợp lệ)..."
                      maxLength={500}
                    />
                    <div className="char-count">{rejectReason.length}/500</div>
                    <div className="reject-actions">
                      <button
                        className="btn-confirm-reject"
                        onClick={() => handleReject(report.id)}
                        disabled={processingId === report.id || !rejectReason.trim()}
                      >
                        {processingId === report.id ? "⏳ Đang gửi..." : "✅ Gửi Lý Do"}
                      </button>
                      <button
                        className="btn-cancel-reject"
                        onClick={() => {
                          setShowRejectForm(null);
                          setRejectReason("");
                        }}
                        disabled={processingId === report.id}
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        ) : (
          <p className="empty-message">
            {filter === "pending"
              ? "✅ Không có báo cáo chưa xử lý"
              : filter === "accepted"
              ? "📭 Chưa có báo cáo được xác nhận"
              : "📭 Chưa có báo cáo bị bác bỏ"}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminReports;
