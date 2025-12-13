import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifyModal, setNotifyModal] = useState({ open: false, userId: null, username: "", message: "", sending: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !["admin", "moderator"].includes(role)) {
      alert("Bạn không có quyền truy cập!");
      navigate("/");
      return;
    }

    fetchRecipes();
    fetchUsers();
  }, [navigate]);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get('/admin/recipes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách công thức:", err);
      alert("Lỗi lấy danh sách công thức!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách người dùng:", err);
    }
  };

  const canChangeRole = (targetRole) => {
    const currentRole = localStorage.getItem("role");

    if (currentRole === "admin") return true;
    if (currentRole === "moderator" && targetRole === "admin") return false;
    if (currentRole === "moderator" && (targetRole === "user" || targetRole === "moderator")) return true;
    return false;
  };

  const getChangeRoleTooltip = (targetRole, isCurrentUser) => {
    if (isCurrentUser) return "Không thể đổi role của chính mình";

    const currentRole = localStorage.getItem("role");

    if (currentRole === "admin") {
      const roleNames = { admin: "👑 Admin", moderator: "🔐 Quản trị viên", user: "👤 User" };
      const nextRole = targetRole === "admin" ? "moderator" : targetRole === "moderator" ? "user" : "admin";
      return `Đổi thành ${roleNames[nextRole]}`;
    }

    if (currentRole === "moderator") {
      if (targetRole === "admin") return "❌ Quản trị viên không thể đổi Admin";
      if (targetRole === "moderator") return "Đổi thành 👤 User";
      if (targetRole === "user") return "Đổi thành 🔐 Quản trị viên";
    }

    return "Không có quyền đổi role";
  };

  const deleteRecipe = async (id) => {
    if (window.confirm("Xác nhận xóa công thức này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/admin/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Xóa công thức thành công!");
        fetchRecipes();
      } catch (err) {
        console.error("❌ Lỗi xóa công thức:", err);
        alert("Lỗi xóa công thức!");
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Xác nhận xóa người dùng này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Xóa người dùng thành công!");
        fetchUsers();
      } catch (err) {
        console.error("❌ Lỗi xóa người dùng:", err);
        alert("Lỗi xóa người dùng!");
      }
    }
  };

  const changeUserRole = async (id, currentRole) => {
    const currentUserId = localStorage.getItem("userId");
    
    // Ngăn admin tự sửa role của chính mình
    if (parseInt(id) === parseInt(currentUserId)) {
      alert("❌ Bạn không thể thay đổi vai trò của chính mình!");
      return;
    }

    // Xác định role tiếp theo (vòng lặp: user → moderator → admin → user)
    const roleMap = { user: "moderator", moderator: "admin", admin: "user" };
    let newRole = roleMap[currentRole] || "moderator";
    
    // Nếu là moderator → không thể tạo Admin
    const currentUserRole = localStorage.getItem("role");
    if (currentUserRole === "moderator" && newRole === "admin") {
      alert("❌ Quản trị viên không có quyền nâng người dùng lên Admin!");
      return;
    }
    
    // Nếu downgrade Admin → cần reset password
    if (currentRole === "admin" && (newRole === "moderator" || newRole === "user")) {
      const choice = window.confirm(
        "⚠️ Bạn muốn hạ cấp Admin này.\n\n" +
        "Chọn 'OK' nếu muốn RESET PASSWORD trước (an toàn hơn)\n" +
        "Chọn 'Cancel' nếu bạn biết password của họ"
      );

      if (choice) {
        resetUserPassword(id, newRole);
      } else {
        const password = prompt("Nhập password của người dùng này để hạ cấp:");
        if (password) {
          performRoleChange(id, newRole, password);
        }
      }
      return;
    }
    
    // Upgrade → không cần password
    const roleNames = { admin: "👑 Admin", moderator: "🔐 Quản trị viên", user: "👤 User" };
    if (window.confirm(`Xác nhận đổi vai trò thành ${roleNames[newRole]}?`)) {
      performRoleChange(id, newRole);
    }
  };

  // Gửi thông báo tới user
  const openNotify = (user) => {
    setNotifyModal({ open: true, userId: user.id, username: user.username, message: "", sending: false });
  };

  const sendNotify = async () => {
    if (!notifyModal.message.trim()) {
      alert("Vui lòng nhập nội dung thông báo");
      return;
    }
    setNotifyModal((s) => ({ ...s, sending: true }));
    try {
      await axios.post(
        "/notification/send",
        {
          receiver_id: notifyModal.userId,
          message: notifyModal.message,
          type: "manual",
        }
      );
      alert("✅ Đã gửi thông báo");
      setNotifyModal({ open: false, userId: null, username: "", message: "", sending: false });
    } catch (err) {
      console.error("❌ Lỗi gửi thông báo:", err);
      alert("❌ Lỗi gửi thông báo");
      setNotifyModal((s) => ({ ...s, sending: false }));
    }
  };

  const resetUserPassword = async (id, roleToChange = null) => {
    if (window.confirm("🔑 Reset password sẽ tạo mật khẩu tạm. Bạn chắc chứng?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `/admin/user/${id}/reset-password`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(`✅ ${res.data.message}\n\n🔐 Password tạm: ${res.data.tempPassword}\n\n⚠️ ${res.data.note}`);

        // Nếu đang trong quá trình downgrade → tiến hành downgrade ngay
        if (roleToChange) {
          performRoleChange(id, roleToChange);
        } else {
          fetchUsers();
        }
      } catch (err) {
        console.error("❌ Lỗi reset password:", err);
        const errorMsg = err.response?.data?.message || "Lỗi reset password!";
        alert(errorMsg);
      }
    }
  };

  const performRoleChange = async (id, newRole, password = null) => {
    if (window.confirm(`Xác nhận đổi vai trò thành ${newRole === "admin" ? "👑 Admin" : "👤 User"}?`)) {
      try {
        const token = localStorage.getItem("token");
        const payload = { role: newRole };
        if (password) payload.currentPassword = password;

        await axios.put(
          `/admin/user/${id}/role`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`✅ Đã đổi vai trò thành ${newRole}!`);
        fetchUsers();
      } catch (err) {
        console.error("❌ Lỗi đổi vai trò:", err);
        const errorMsg = err.response?.data?.message || "Lỗi đổi vai trò người dùng!";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return <div className="admin-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="admin-container">
      <h1 className="page-title">⚙️ Trang Quản Trị Admin</h1>
      {localStorage.getItem("role") === "moderator" && (
        <div className="restricted-banner">
          <span className="restricted-badge">Chế độ hạn chế</span>
          <div className="restricted-text">
            Bạn đang đăng nhập với vai trò Quản trị viên (moderator). Bạn chỉ có thể xem dữ liệu và nâng/hạ User ↔ Quản trị viên. Không thể tạo Admin, hạ Admin, xóa người dùng/công thức, hoặc reset mật khẩu.
          </div>
        </div>
      )}

      {/* THỐNG KÊ */}
      <div className="admin-stats">
      {/* Modal gửi thông báo */}
      {notifyModal.open && (
        <div className="modal-overlay" onClick={() => setNotifyModal({ open: false, userId: null, username: "", message: "", sending: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔔 Gửi thông báo tới {notifyModal.username}</h3>
            <textarea
              value={notifyModal.message}
              onChange={(e) => setNotifyModal((s) => ({ ...s, message: e.target.value }))}
              placeholder="Nhập nội dung thông báo..."
              maxLength={500}
              style={{ width: "100%", minHeight: "120px" }}
            />
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={sendNotify}
                disabled={notifyModal.sending}
              >
                {notifyModal.sending ? "⏳ Đang gửi..." : "✅ Gửi"}
              </button>
              <button
                className="btn-cancel-inline"
                onClick={() => setNotifyModal({ open: false, userId: null, username: "", message: "", sending: false })}
                disabled={notifyModal.sending}
              >
                ❌ Đóng
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="stat-card">
          <h3>👥 Người dùng</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>📖 Công thức</h3>
          <p className="stat-number">{recipes.length}</p>
        </div>
      </div>

      {/* QUẢN LÝ CÔNG THỨC */}
      <section className="admin-section">
        <h2>📖 Quản Lý Công Thức</h2>
        {recipes.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => {
                const viewerRole = localStorage.getItem("role");
                return (
                <tr key={recipe.id}>
                  <td>#{recipe.id}</td>
                  <td className="recipe-title">{recipe.title}</td>
                  <td>{recipe.username}</td>
                  <td>{new Date(recipe.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    {viewerRole === "admin" && (
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="btn-delete"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">Chưa có công thức nào</p>
        )}
      </section>

      {/* QUẢN LÝ NGƯỜI DÙNG */}
      <section className="admin-section">
        <h2>👥 Quản Lý Người Dùng</h2>
        {users.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const currentUserId = localStorage.getItem("userId");
                const viewerRole = localStorage.getItem("role");
                const isCurrentUser = parseInt(user.id) === parseInt(currentUserId);
                
                return (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      {user.username}
                      {isCurrentUser && <span style={{ color: "#ff7f50", marginLeft: "5px" }}>(Bạn)</span>}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "admin" ? "admin" : user.role === "moderator" ? "moderator" : "user"
                        }`}
                      >
                        {user.role === "admin" ? "👑 Admin" : user.role === "moderator" ? "🔐 Quản trị viên" : "👤 User"}
                      </span>
                    </td>
                    <td>
                      {/* Nút gửi thông báo cho cả admin và moderator (không cho chính mình) */}
                      {!isCurrentUser && (viewerRole === "admin" || viewerRole === "moderator") && (
                        <button
                          className="btn-notify"
                          onClick={() => openNotify(user)}
                          style={{ marginRight: "10px" }}
                        >
                          🔔 Thông báo
                        </button>
                      )}

                      {user.role === "admin" ? (
                        <span style={{ color: "#888" }}>Chỉ Admin khác mới đổi/reset</span>
                      ) : viewerRole === "admin" ? (
                        <>
                          <select
                            className="role-select"
                            value={user.role}
                            onChange={(e) => changeUserRole(user.id, user.role, e.target.value)}
                            disabled={isCurrentUser}
                            title={getChangeRoleTooltip(user.role, isCurrentUser)}
                          >
                            <option value="user">👤 User</option>
                            <option value="moderator">🔐 Quản trị viên</option>
                            <option value="admin">👑 Admin</option>
                          </select>
                          <button
                            onClick={() => resetUserPassword(user.id)}
                            className="btn-reset-pwd"
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Không thể reset password của chính mình" : "Reset password"}
                            style={{ 
                              marginLeft: "10px",
                              opacity: isCurrentUser ? 0.5 : 1,
                              cursor: isCurrentUser ? "not-allowed" : "pointer"
                            }}
                          >
                            🔑 Reset Pass
                          </button>
                          {!isCurrentUser && user.role !== "admin" && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="btn-delete"
                              style={{ marginLeft: "10px" }}
                            >
                              🗑️ Xóa
                            </button>
                          )}
                        </>
                      ) : (
                        <span style={{ color: "#888" }}>Quản trị viên không thể đổi role</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">Chưa có người dùng nào</p>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
