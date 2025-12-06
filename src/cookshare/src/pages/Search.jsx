import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./Search.css";
import FollowButton from '../components/FollowButton';

function Search() {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";

  useEffect(() => {
    setSearchTerm(q);
    if (q.trim()) {
      fetchSearch(q);
    }
  }, [q]);

  const fetchSearch = async (query) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/search?q=${query}`);
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
      alert("❌ Lỗi tìm kiếm!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>🔍 Tìm Kiếm</h1>
        
        {/* Search Input */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Nhập tên công thức để tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Tìm Kiếm
          </button>
        </form>

        {q && <p>Kết quả tìm kiếm cho: "<strong>{q}</strong>"</p>}
      </div>

      {loading ? (
        <p className="loading">⏳ Đang tìm kiếm...</p>
      ) : recipes.length > 0 ? (
        <div className="search-results">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="search-card">
              {recipe.image_url && recipe.image_url.match(/\.(mp4|webm|avi|mov)$/i) ? (
                <video controls className="search-card-media">
                  <source src={recipe.image_url} />
                  Trình duyệt không hỗ trợ video
                </video>
              ) : (
                <img src={recipe.image_url} alt={recipe.title} className="search-card-media" />
              )}
              <h3>{recipe.title}</h3>
              <p className="author">
                {recipe.avatar_url ? (
                  <img src={recipe.avatar_url} alt={recipe.username} className="author-avatar" />
                ) : (
                  <span className="author-placeholder">{(recipe.username || 'U').charAt(0).toUpperCase()}</span>
                )}
                <Link to={`/user/${recipe.user_id}`}>{recipe.username}</Link> <FollowButton userId={recipe.user_id} />
              </p>
              <div className="recipe-meta">
                <span className="rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'} <small>({recipe.rating_count || 0})</small></span>
                <span className="views"> 👁️ {recipe.views || 0}</span>
                <span className="favs"> ❤️ {recipe.favorite_count || 0}</span>
              </div>
              <Link to={`/recipe/${recipe.id}`} className="btn-view">
                Xem Chi Tiết
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>😔 Không tìm thấy công thức nào.</p>
          {q && (
            <p>Hãy thử tìm kiếm với từ khóa khác.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
