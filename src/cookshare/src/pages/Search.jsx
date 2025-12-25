import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./Search.css";

function Search() {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/search?q=${encodeURIComponent(query)}&limit=5`
      );
      setSuggestions(res.data || []);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== q) {
        fetchSuggestions(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, q, fetchSuggestions]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (recipe) => {
    setShowSuggestions(false);
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-hero">
        <h1>Tìm Kiếm Công Thức</h1>
        <p>Khám phá hàng ngàn công thức nấu ăn ngon</p>
        
        <form onSubmit={handleSearch} className="search-form-hero" ref={searchRef}>
          <div className="search-input-container">
            <span className="search-icon-left">🔍</span>
            <input
              type="text"
              placeholder="Nhập tên món ăn, nguyên liệu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              autoComplete="off"
            />
            {searchLoading && <span className="search-spinner">⏳</span>}
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="suggestion-row"
                    onClick={() => handleSuggestionClick(recipe)}
                  >
                    <div className="suggestion-thumb">
                      {recipe.image_url ? (
                        <img src={recipe.image_url} alt="" />
                      ) : (
                        <span>🍳</span>
                      )}
                    </div>
                    <div className="suggestion-details">
                      <span className="suggestion-name">{recipe.title}</span>
                      <span className="suggestion-by">bởi {recipe.username}</span>
                    </div>
                    <span className="suggestion-rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="search-btn-hero">
            Tìm Kiếm
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="search-content">
        {q && (
          <div className="search-results-header">
            <h2>Kết quả cho "{q}"</h2>
            <span className="results-count">{recipes.length} công thức</span>
          </div>
        )}

        {loading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Đang tìm kiếm...</p>
          </div>
        ) : recipes.length > 0 ? (
          <div className="search-grid">
            {recipes.map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card">
                <div className="recipe-card-image">
                  {recipe.image_url ? (
                    recipe.image_url.match(/\.(mp4|webm|avi|mov)$/i) ? (
                      <video src={recipe.image_url} />
                    ) : (
                      <img src={recipe.image_url} alt={recipe.title} />
                    )
                  ) : (
                    <div className="recipe-card-placeholder">🍳</div>
                  )}
                  <div className="recipe-card-rating-badge">
                    <span className="recipe-rating">⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                  </div>
                </div>
                <div className="recipe-card-body">
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  <div className="recipe-card-author">
                    {recipe.avatar_url ? (
                      <img src={recipe.avatar_url} alt="" className="author-avatar" />
                    ) : (
                      <span className="author-avatar-placeholder">{(recipe.username || 'U').charAt(0)}</span>
                    )}
                    <span>{recipe.username}</span>
                  </div>
                  <div className="recipe-card-stats">
                    <span>👁️ {recipe.views || 0}</span>
                    <span>❤️ {recipe.favorite_count || 0}</span>
                    <span>💬 {recipe.comment_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : q ? (
          <div className="search-empty">
            <div className="empty-icon">🔍</div>
            <h3>Không tìm thấy kết quả</h3>
            <p>Không có công thức nào phù hợp với "{q}"</p>
            <p className="empty-hint">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="search-empty">
            <div className="empty-icon">👨‍🍳</div>
            <h3>Bắt đầu tìm kiếm</h3>
            <p>Nhập tên món ăn hoặc nguyên liệu để tìm công thức</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
