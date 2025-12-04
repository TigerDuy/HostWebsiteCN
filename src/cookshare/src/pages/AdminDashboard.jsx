import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Kiểm tra quyền admin
    if (!token || role !== "admin") {
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
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/admin/recipes`, {
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
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách người dùng:", err);
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm("Xác nhận xóa công thức này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/admin/delete/${id}`, {
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
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/admin/user/${id}`, {
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

  if (loading) {
    return <div className="admin-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="admin-container">
      <h1>⚙️ Trang Quản Trị Admin</h1>

      {/* THỐNG KÊ */}
      <div className="admin-stats">
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
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td>#{recipe.id}</td>
                  <td className="recipe-title">{recipe.title}</td>
                  <td>{recipe.username}</td>
                  <td>{new Date(recipe.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="btn-delete"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`role-badge ${
                        user.role === "admin" ? "admin" : "user"
                      }`}
                    >
                      {user.role === "admin" ? "👑 Admin" : "👤 User"}
                    </span>
                  </td>
                  <td>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="btn-delete"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
