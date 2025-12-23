import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyRecipes.css";
import "../styles/recipe-cards.css";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // editing handled on separate edit page now; keep editingId for link guard if needed

  if (loading) {
    return <div className="my-recipes-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="my-recipes-container">
      <div className="my-recipes-header">
        <h1 className="my-page-title">📖 Công Thức Của Tôi</h1>
        <Link to="/create" className="btn-create-new">
          ➕ Tạo Công Thức Mới
        </Link>
      </div>

      {recipes.length > 0 ? (
        <div className="recipe-grid-overlay">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card-overlay">
              {recipe.is_hidden && (
                <div className="hidden-badge" title={`Vi phạm: ${recipe.violation_count || 0}/3`}>
                  🚫 Đã ẩn ({recipe.violation_count || 0} vi phạm)
                </div>
              )}
              <Link to={`/recipe/${recipe.id}`}>
                <div className="recipe-overlay-img">
                  {recipe.image_url ? (
                    recipe.image_url.toLowerCase().includes('.mp4') || 
                    recipe.image_url.toLowerCase().includes('.webm') || 
                    recipe.image_url.toLowerCase().includes('.avi') ||
                    recipe.image_url.toLowerCase().includes('.mov') ? (
                      <video src={recipe.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={recipe.image_url} alt={recipe.title} />
                    )
                  ) : (
                    <div style={{ background: '#ddd', width: '100%', height: '100%' }} />
                  )}
                </div>
                <div className="recipe-overlay-content">
                  <h4>{recipe.title}</h4>
                  <div className="recipe-overlay-meta">
                    <span className="recipe-overlay-rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                    <span className="recipe-overlay-views">👁️ {recipe.views || 0}</span>
                    <span className="recipe-overlay-favs">❤️ {recipe.favorite_count || 0}</span>
                  </div>
                </div>
              </Link>
              <div className="recipe-card-actions">
                <Link to={`/recipe/${recipe.id}/edit`} className="btn-edit-card" title="Chỉnh sửa">
                  ✏️
                </Link>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="btn-delete-card"
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
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
