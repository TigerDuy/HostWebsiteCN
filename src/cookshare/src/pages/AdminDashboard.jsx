import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifyModal, setNotifyModal] = useState({ open: false, userId: null, username: "", message: "", sending: false });
  const [hideModal, setHideModal] = useState({ open: false, recipeId: null, recipeTitle: "", reason: "", hiding: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search, Pagination, Sorting states
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeCurrentPage, setRecipeCurrentPage] = useState(1);
  const [recipeSort, setRecipeSort] = useState({ key: "created_at", direction: "desc" });
  
  const [userSearch, setUserSearch] = useState("");
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userSort, setUserSort] = useState({ key: "created_at", direction: "desc" });
  
  const itemsPerPage = 10;

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
      const roleNames = { admin: "👑 Admin", moderator: "🔐 Moderator", user: "👤 User" };
      const nextRole = targetRole === "admin" ? "moderator" : targetRole === "moderator" ? "user" : "admin";
      return `Đổi thành ${roleNames[nextRole]}`;
    }

    if (currentRole === "moderator") {
      if (targetRole === "admin") return "❌ Moderator không thể đổi Admin";
      if (targetRole === "moderator") return "Đổi thành 👤 User";
      if (targetRole === "user") return "Đổi thành 🔐 Moderator";
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

  const unhideRecipe = async (id) => {
    if (window.confirm("Xác nhận bỏ ẩn công thức này? Vi phạm sẽ được reset về 0.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/recipe/unhide/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã bỏ ẩn công thức!");
        fetchRecipes();
      } catch (err) {
        console.error("❌ Lỗi bỏ ẩn công thức:", err);
        alert(err.response?.data?.message || "Lỗi bỏ ẩn công thức!");
      }
    }
  };

  const openHideModal = (recipeId, recipeTitle) => {
    setHideModal({ open: true, recipeId, recipeTitle, reason: "", hiding: false });
  };

  const closeHideModal = () => {
    setHideModal({ open: false, recipeId: null, recipeTitle: "", reason: "", hiding: false });
  };

  const hideRecipe = async () => {
    if (!hideModal.reason || hideModal.reason.trim() === "") {
      alert("❌ Vui lòng nhập lý do ẩn bài viết!");
      return;
    }

    setHideModal((s) => ({ ...s, hiding: true }));

    try {
      const token = localStorage.getItem("token");
      await axios.put(`/recipe/hide/${hideModal.recipeId}`, 
        { reason: hideModal.reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("✅ Đã ẩn bài viết và gửi thông báo cho tác giả!");
      closeHideModal();
      fetchRecipes();
    } catch (err) {
      console.error("❌ Lỗi ẩn bài viết:", err);
      alert(err.response?.data?.message || "Lỗi ẩn bài viết!");
      setHideModal((s) => ({ ...s, hiding: false }));
    }
  };

  // Sorting function
  const handleSort = (key, type) => {
    if (type === "recipe") {
      const direction = recipeSort.key === key && recipeSort.direction === "asc" ? "desc" : "asc";
      setRecipeSort({ key, direction });
      setRecipeCurrentPage(1);
    } else {
      const direction = userSort.key === key && userSort.direction === "asc" ? "desc" : "asc";
      setUserSort({ key, direction });
      setUserCurrentPage(1);
    }
  };

  // Get sort icon with consistent width
  const getSortIcon = (key, currentSort) => {
    if (currentSort.key === key) {
      return currentSort.direction === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  // Filter and sort recipes
  const getFilteredSortedRecipes = () => {
    let filtered = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      recipe.username.toLowerCase().includes(recipeSearch.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[recipeSort.key];
      const bVal = b[recipeSort.key];
      
      if (typeof aVal === "string") {
        return recipeSort.direction === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return recipeSort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  };

  // Filter and sort users
  const getFilteredSortedUsers = () => {
    let filtered = users.filter((user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[userSort.key];
      const bVal = b[userSort.key];
      
      if (typeof aVal === "string") {
        return userSort.direction === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return userSort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  };

  // Pagination
  const paginateRecipes = (filtered) => {
    const startIndex = (recipeCurrentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const paginateUsers = (filtered) => {
    const startIndex = (userCurrentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get paginated data
  const filteredRecipes = getFilteredSortedRecipes();
  const paginatedRecipes = paginateRecipes(filteredRecipes);
  const recipeTotalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const filteredUsers = getFilteredSortedUsers();
  const paginatedUsers = paginateUsers(filteredUsers);
  const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
      alert("❌ Moderator không có quyền nâng người dùng lên Admin!");
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
    const roleNames = { admin: "👑 Admin", moderator: "🔐 Moderator", user: "👤 User" };
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
            Bạn đang đăng nhập với vai trò Moderator (moderator). Bạn chỉ có thể xem dữ liệu và nâng/hạ User ↔ Moderator. Không thể tạo Admin, hạ Admin, xóa người dùng/công thức, hoặc reset mật khẩu.
          </div>
        </div>
      )}

      {/* THỐNG KÊ */}
      <div className="admin-stats">
      {/* Modal ẩn bài viết */}
      {hideModal.open && (
        <div className="modal-overlay" onClick={closeHideModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🚫 Ẩn bài viết: {hideModal.recipeTitle}</h3>
            <p style={{ marginBottom: "10px", color: "#666" }}>
              Nhập lý do ẩn bài viết để thông báo cho tác giả:
            </p>
            <textarea
              value={hideModal.reason}
              onChange={(e) => setHideModal((s) => ({ ...s, reason: e.target.value }))}
              placeholder="Ví dụ: Bài viết có nội dung không phù hợp với quy định cộng đồng..."
              maxLength={500}
              style={{ width: "100%", minHeight: "120px", marginBottom: "15px" }}
            />
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={hideRecipe}
                disabled={hideModal.hiding}
              >
                {hideModal.hiding ? "⏳ Đang ẩn..." : "✅ Gửi & Ẩn bài viết"}
              </button>
              <button
                className="btn-cancel-inline"
                onClick={closeHideModal}
                disabled={hideModal.hiding}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Tìm kiếm theo tiêu đề hoặc tác giả..."
            value={recipeSearch}
            onChange={(e) => {
              setRecipeSearch(e.target.value);
              setRecipeCurrentPage(1);
            }}
          />
          <span className="search-result-count">
            Hiển thị {paginatedRecipes.length} / {filteredRecipes.length} công thức
          </span>
        </div>

        {recipes.length > 0 ? (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id", "recipe")} className="sortable">
                  ID{getSortIcon("id", recipeSort)}
                </th>
                <th onClick={() => handleSort("title", "recipe")} className="sortable">
                  Tiêu đề{getSortIcon("title", recipeSort)}
                </th>
                <th onClick={() => handleSort("username", "recipe")} className="sortable">
                  Tác giả{getSortIcon("username", recipeSort)}
                </th>
                <th onClick={() => handleSort("is_hidden", "recipe")} className="sortable">
                  Trạng thái{getSortIcon("is_hidden", recipeSort)}
                </th>
                <th onClick={() => handleSort("created_at", "recipe")} className="sortable">
                  Ngày tạo{getSortIcon("created_at", recipeSort)}
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecipes.map((recipe) => {
                const viewerRole = localStorage.getItem("role");
                return (
                <tr key={recipe.id}>
                  <td>#{recipe.id}</td>
                  <td className="recipe-title">
                    <a href={`/recipe/${recipe.id}`}>
                      {recipe.title}
                    </a>
                  </td>
                  <td>{recipe.username}</td>
                  <td>
                    {recipe.is_hidden ? (
                      <span className="status-hidden">
                        🚫 Đã ẩn ({recipe.violation_count} vi phạm)
                      </span>
                    ) : (
                      <span className="status-visible">✅ Hiển thị</span>
                    )}
                  </td>
                  <td>{new Date(recipe.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    {recipe.is_hidden ? (
                      <button
                        onClick={() => unhideRecipe(recipe.id)}
                        className="btn-unhide"
                        title="Bỏ ẩn và reset vi phạm về 0"
                      >
                        👁️ Bỏ ẩn
                      </button>
                    ) : (
                      <button
                        onClick={() => openHideModal(recipe.id, recipe.title)}
                        className="btn-hide"
                        title="Ẩn bài viết với lý do"
                      >
                        🚫 Ẩn
                      </button>
                    )}
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
          {/* Pagination */}
          {recipeTotalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setRecipeCurrentPage((p) => Math.max(1, p - 1))}
                disabled={recipeCurrentPage === 1}
              >
                ← Trước
              </button>
              
              <div className="pagination-pages">
                {[...Array(recipeTotalPages)].map((_, i) => {
                  const page = i + 1;
                  // Hiển thị: trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
                  if (
                    page === 1 ||
                    page === recipeTotalPages ||
                    (page >= recipeCurrentPage - 1 && page <= recipeCurrentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-page ${page === recipeCurrentPage ? "active" : ""}`}
                        onClick={() => setRecipeCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === recipeCurrentPage - 2 || page === recipeCurrentPage + 2) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setRecipeCurrentPage((p) => Math.min(recipeTotalPages, p + 1))}
                disabled={recipeCurrentPage === recipeTotalPages}
              >
                Tiếp →
              </button>
            </div>
          )}
          </>        ) : (
          <p className="empty-message">Chưa có công thức nào</p>
        )}
      </section>

      {/* QUẢN LÝ NGƯỜI DÙNG */}
      <section className="admin-section">
        <h2>👥 Quản Lý Người Dùng</h2>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Tìm kiếm theo tên đăng nhập hoặc email..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserCurrentPage(1);
            }}
          />
          <span className="search-result-count">
            Hiển thị {paginatedUsers.length} / {filteredUsers.length} người dùng
          </span>
        </div>

        {users.length > 0 ? (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id", "user")} className="sortable">
                  ID{getSortIcon("id", userSort)}
                </th>
                <th onClick={() => handleSort("username", "user")} className="sortable">
                  Tên đăng nhập{getSortIcon("username", userSort)}
                </th>
                <th onClick={() => handleSort("email", "user")} className="sortable">
                  Email{getSortIcon("email", userSort)}
                </th>
                <th onClick={() => handleSort("role", "user")} className="sortable">
                  Vai trò{getSortIcon("role", userSort)}
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
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
                        {user.role === "admin" ? "👑 Admin" : user.role === "moderator" ? "🔐 Moderator" : "👤 User"}
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
                            <option value="moderator">🔐 Moderator</option>
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
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {userTotalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setUserCurrentPage((p) => Math.max(1, p - 1))}
                disabled={userCurrentPage === 1}
              >
                ← Trước
              </button>
              
              <div className="pagination-pages">
                {[...Array(userTotalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === userTotalPages ||
                    (page >= userCurrentPage - 1 && page <= userCurrentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-page ${page === userCurrentPage ? "active" : ""}`}
                        onClick={() => setUserCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === userCurrentPage - 2 || page === userCurrentPage + 2) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setUserCurrentPage((p) => Math.min(userTotalPages, p + 1))}
                disabled={userCurrentPage === userTotalPages}
              >
                Tiếp →
              </button>
            </div>
          )}
          </>
        ) : (
          <p className="empty-message">Chưa có người dùng nào</p>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
