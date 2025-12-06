import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyRecipes.css";
import "../styles/recipe-cards.css";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", ingredients: "", steps: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    fetchRecipes(token);
  }, [navigate]);

  const fetchRecipes = async (token) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy công thức:", err);
      alert("❌ Lỗi lấy danh sách công thức!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("❓ Bạn có chắc muốn xóa công thức này?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Đã xóa công thức!");
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (err) {
      alert("❌ Lỗi xóa công thức!");
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    if (!editForm.title || !editForm.ingredients || !editForm.steps) {
      alert("❌ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/recipe/update/${editingId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Cập nhật thành công!");
      setEditingId(null);
      fetchRecipes(token);
    } catch (err) {
      alert("❌ Lỗi cập nhật công thức!");
    }
  };

  if (loading) {
    return <div className="my-recipes-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="my-recipes-container">
      <h1>📖 Công Thức Của Tôi</h1>

      {recipes.length > 0 ? (
        <div className="recipes-list">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-item">
              {editingId === recipe.id ? (
                <div className="edit-two-column">
                  <div className="edit-media">
                    {recipe.image_url ? (
                      recipe.image_url.toLowerCase().includes('.mp4') || 
                      recipe.image_url.toLowerCase().includes('.webm') || 
                      recipe.image_url.toLowerCase().includes('.avi') ||
                      recipe.image_url.toLowerCase().includes('.mov') ? (
                        <video src={recipe.image_url} controls style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <img src={recipe.image_url} alt={recipe.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 8 }} />
                      )
                    ) : (
                      <div style={{ width: '100%', height: 220, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="edit-form edit-fields">
                    <h3>✏️ Chỉnh Sửa Công Thức</h3>

                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Tiêu đề"
                      className="edit-input"
                    />

                    <textarea
                      value={editForm.ingredients}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ingredients: e.target.value })
                      }
                      placeholder="Nguyên liệu (cách nhau bằng dấu phẩy)"
                      className="edit-textarea"
                      rows="4"
                    />

                    <textarea
                      value={editForm.steps}
                      onChange={(e) =>
                        setEditForm({ ...editForm, steps: e.target.value })
                      }
                      placeholder="Các bước nấu"
                      className="edit-textarea"
                      rows="6"
                        />
                      <button onClick={handleUpdate} className="btn-save">
                        💾 Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  </div>
              ) : (
                <div className="recipe-row">
                  <div className="recipe-img-col">
                    {recipe.image_url ? (
                      recipe.image_url.toLowerCase().includes('.mp4') || 
                      recipe.image_url.toLowerCase().includes('.webm') || 
                      recipe.image_url.toLowerCase().includes('.avi') ||
                      recipe.image_url.toLowerCase().includes('.mov') ? (
                        <video src={recipe.image_url} controls />
                      ) : (
                        <img src={recipe.image_url} alt={recipe.title} />
                      )
                    ) : (
                      <div style={{ background: '#eee', width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="recipe-card-content">
                    <div>
                      <h3>{recipe.title}</h3>
                      <div className="recipe-meta">
                        <span className="rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'} <small>({recipe.rating_count || 0})</small></span>
                        <span className="views"> 👁️ {recipe.views || 0}</span>
                        <span className="favs"> ❤️ {recipe.favorite_count || 0}</span>
                      </div>
                    </div>

                    <div className="recipe-actions">
                      <Link to={`/recipe/${recipe.id}`} className="btn-view">
                        👁️ Xem
                      </Link>
                      <Link to={`/recipe/${recipe.id}/edit`} className="btn-edit">
                        ✏️ Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="btn-delete"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 Bạn chưa tạo công thức nào.</p>
          <Link to="/create" className="btn-create">
            ➕ Tạo công thức mới
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyRecipes;
