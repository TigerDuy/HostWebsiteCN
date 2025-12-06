import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./FavoriteRecipes.css";
import "../styles/recipe-cards.css";
import FollowButton from '../components/FollowButton';

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
      alert("✅ Đã hủy yêu thích!");
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
    <div className="container">
      <div className="page-header">
        <h2>❤️ Công Thức Đã Lưu</h2>
      </div>

      {recipes.length > 0 ? (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div className="recipe-card recipe-row" key={recipe.id}>
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
                  <p className="recipe-author">
                    {recipe.avatar_url ? (
                      <img src={recipe.avatar_url} alt={recipe.username} className="recipe-author-avatar" />
                    ) : (
                      <span className="recipe-author-placeholder">{(recipe.username || 'U').charAt(0).toUpperCase()}</span>
                    )}
                    <Link to={`/user/${recipe.user_id}`}>{recipe.username}</Link> <FollowButton userId={recipe.user_id} />
                  </p>
                  <div className="recipe-meta">
                    <span className="rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'} <small>({recipe.rating_count || 0})</small></span>
                    <span className="views"> 👁️ {recipe.views || 0}</span>
                    <span className="favs"> ❤️ {recipe.favorite_count || 0}</span>
                  </div>
                </div>

                <div className="recipe-actions">
                  <Link to={`/recipe/${recipe.id}`} className="btn-view">
                    📖 Xem Chi Tiết
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(recipe.id)}
                    className="btn-remove"
                  >
                    ❌ Hủy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-message">📭 Bạn chưa lưu công thức nào!</p>
          <Link to="/" className="btn-explore">
            🔍 Khám Phá Công Thức
          </Link>
        </div>
      )}
    </div>
  );
}

export default FavoriteRecipes;
