import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchRecipes = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/list`);
        console.log("📦 Recipes loaded:", res.data?.length, res.data);
        setRecipes(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi lấy công thức:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Debounce search suggestions
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
      console.error("Lỗi tìm kiếm:", err);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchSuggestions]);

  // Click outside to close suggestions
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
    setSearchTerm("");
    navigate(`/recipe/${recipe.id}`);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  if (loading) {
    return <div className="home-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="home-container">
      {/* SEARCH SECTION */}
      <div className="home-search-section">
        <div className="search-header">
          <h2 className="search-title page-title">
            <img src="/logo.jpg" alt="CookShare logo" className="search-logo" />
            CookShare - Chia Sẻ Công Thức Nấu Ăn
          </h2>
        </div>
        <form onSubmit={handleSearch} className="home-search-form" ref={searchRef}>
          <div className="home-search-input-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm công thức..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              className="home-search-input"
              autoComplete="off"
            />
            {searchLoading && <span className="home-search-spinner">⏳</span>}
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="home-search-suggestions">
                {suggestions.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(recipe)}
                  >
                    <div className="suggestion-image">
                      {recipe.image_url ? (
                        <img src={recipe.image_url} alt={recipe.title} />
                      ) : (
                        <div className="suggestion-placeholder">🍳</div>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <p className="suggestion-title">{recipe.title}</p>
                      <p className="suggestion-author">bởi {recipe.username}</p>
                    </div>
                    <div className="suggestion-meta">
                      <span>⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                    </div>
                  </div>
                ))}
                <div 
                  className="suggestion-view-all"
                  onClick={handleSearch}
                >
                  Xem tất cả kết quả cho "{searchTerm}"
                </div>
              </div>
            )}

            {/* No results */}
            {showSuggestions && searchTerm.length >= 2 && suggestions.length === 0 && !searchLoading && (
              <div className="home-search-suggestions">
                <div className="suggestion-empty">
                  Không tìm thấy công thức nào
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="home-search-button">
            Tìm Kiếm
          </button>
        </form>
      </div>

      {/* RECIPES SECTION */}
      {recipes.length > 0 ? (
        <>
          <section className="home-section">
            <h3 className="section-title">Công Thức Nổi Bật</h3>
            <div className="recipe-grid-overlay" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {recipes.slice(0, 4).map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.id}`}
                    className="recipe-card-overlay"
                    style={{ display: 'block', position: 'relative', aspectRatio: '1/1', minHeight: '200px', borderRadius: '10px', overflow: 'hidden', background: '#f0f0f0' }}>
                    <div className="recipe-overlay-img" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {recipe.image_url ? (
                        (recipe.image_url.toLowerCase().includes('.mp4') || 
                        recipe.image_url.toLowerCase().includes('.webm') ||
                        recipe.image_url.toLowerCase().includes('.avi') ||
                        recipe.image_url.toLowerCase().includes('.mov')) ? (
                          <video src={recipe.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={recipe.image_url} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <div style={{ background: '#ddd', width: '100%', height: '100%' }} />
                      )}
                    </div>
                    <div className="recipe-overlay-content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)', padding: '12px', color: 'white' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{recipe.title}</h4>
                      <p className="recipe-overlay-author" style={{ margin: '0 0 6px 0', fontSize: '12px' }}>{recipe.username}</p>
                      <div className="recipe-overlay-meta" style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                        <span>⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                        <span>👁️ {recipe.views || 0}</span>
                        <span>❤️ {recipe.favorite_count || 0}</span>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </section>

          {/* ALL RECIPES SECTION */}
          <section className="home-section">
            <h3 className="section-title">Tất Cả Công Thức</h3>
            <div className="recipe-grid-overlay" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.id}`}
                    className="recipe-card-overlay"
                    style={{ display: 'block', position: 'relative', aspectRatio: '1/1', minHeight: '200px', borderRadius: '10px', overflow: 'hidden', background: '#f0f0f0' }}>
                    <div className="recipe-overlay-img" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {recipe.image_url ? (
                        (recipe.image_url.toLowerCase().includes('.mp4') || 
                        recipe.image_url.toLowerCase().includes('.webm') ||
                        recipe.image_url.toLowerCase().includes('.avi') ||
                        recipe.image_url.toLowerCase().includes('.mov')) ? (
                          <video src={recipe.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={recipe.image_url} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <div style={{ background: '#ddd', width: '100%', height: '100%' }} />
                      )}
                    </div>
                    <div className="recipe-overlay-content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)', padding: '12px', color: 'white' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{recipe.title}</h4>
                      <p className="recipe-overlay-author" style={{ margin: '0 0 6px 0', fontSize: '12px' }}>{recipe.username}</p>
                      <div className="recipe-overlay-meta" style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                        <span>⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                        <span>👁️ {recipe.views || 0}</span>
                        <span>❤️ {recipe.favorite_count || 0}</span>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="empty-message">Chưa có công thức nào được đăng!</p>
      )}
    </div>
  );
}

export default Home;
