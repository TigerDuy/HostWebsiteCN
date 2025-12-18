import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./FavoriteRecipes.css";
import "../styles/recipe-cards.css";

function FavoriteRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavoriteRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavoriteRecipes = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/favorite/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách yêu thích:", err);
      alert("❌ Lỗi khi lấy danh sách yêu thích!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("❌ Bạn chắc chắn muốn hủy yêu thích?")) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/favorite/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đã hủy yêu thích!");
      fetchFavoriteRecipes();
    } catch (err) {
      alert("❌ Lỗi khi hủy yêu thích!");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>⏳ Đang tải...</h2>
      </div>
    );
  }

  return (
    <div className="favorite-container">
      <div className="favorite-page-header">
        <h2 className="favorite-page-title">❤️ Công Thức Đã Lưu</h2>
      </div>

      {recipes.length > 0 ? (
        <div className="recipe-grid-overlay">
          {recipes.map((recipe) => (
            <div className="recipe-card-overlay" key={recipe.id}>
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
                  <p className="recipe-overlay-author">{recipe.username}</p>
                  <div className="recipe-overlay-meta">
                    <span className="recipe-overlay-rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                    <span className="recipe-overlay-views">👁️ {recipe.views || 0}</span>
                    <span className="recipe-overlay-favs">❤️ {recipe.favorite_count || 0}</span>
                  </div>
                </div>
              </Link>
              <div className="recipe-card-actions">
                <button
                  onClick={() => handleRemoveFavorite(recipe.id)}
                  className="btn-remove-card"
                  title="Hủy yêu thích"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-message">Bạn chưa lưu công thức nào!</p>
          <Link to="/" className="btn-explore">
            Khám Phá Công Thức
          </Link>
        </div>
      )}
    </div>
  );
}

export default FavoriteRecipes;
