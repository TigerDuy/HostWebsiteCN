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

  // Filter & Pagination states
  const [filters, setFilters] = useState({ categories: [], cuisines: [] });
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Fetch filters and tags on mount
  useEffect(() => {
    const fetchFiltersAndTags = async () => {
      try {
        const [filtersRes, tagsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/filters`),
          axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/tags`)
        ]);
        setFilters(filtersRes.data);
        setTags(tagsRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi lấy filters/tags:", err);
      }
    };
    fetchFiltersAndTags();
  }, []);

  // Fetch recipes with filters and pagination
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCuisine) params.append('cuisine', selectedCuisine);
        if (selectedTag) params.append('tag', selectedTag);

        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/list?${params.toString()}`
        );
        
        // Handle both old format (array) and new format (object with data)
        if (Array.isArray(res.data)) {
          setRecipes(res.data);
          setTotal(res.data.length);
          setTotalPages(1);
        } else {
          setRecipes(res.data.data || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy công thức:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, selectedCategory, selectedCuisine, selectedTag]);

  // Reset page when filter changes
  const handleFilterChange = (type, value) => {
    setPage(1);
    if (type === 'category') setSelectedCategory(value);
    if (type === 'cuisine') setSelectedCuisine(value);
    if (type === 'tag') setSelectedTag(value);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCuisine("");
    setSelectedTag("");
    setPage(1);
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchSuggestions]);

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

  const [showAllTags, setShowAllTags] = useState(false);
  const hasActiveFilters = selectedCategory || selectedCuisine || selectedTag;
  const visibleTags = showAllTags ? tags : tags.slice(0, 8);

  if (loading && page === 1) {
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
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="home-search-suggestions">
                {suggestions.map((recipe) => (
                  <div key={recipe.id} className="suggestion-item" onClick={() => handleSuggestionClick(recipe)}>
                    <div className="suggestion-image">
                      {recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} /> : <div className="suggestion-placeholder">🍳</div>}
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
                <div className="suggestion-view-all" onClick={handleSearch}>
                  Xem tất cả kết quả cho "{searchTerm}"
                </div>
              </div>
            )}

            {showSuggestions && searchTerm.length >= 2 && suggestions.length === 0 && !searchLoading && (
              <div className="home-search-suggestions">
                <div className="suggestion-empty">Không tìm thấy công thức nào</div>
              </div>
            )}
          </div>
          <button type="submit" className="home-search-button">Tìm Kiếm</button>
        </form>
      </div>

      {/* FILTER SECTION */}
      <div className="home-filter-section">
        <div className="filter-row">
          <select 
            value={selectedCategory} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả loại món</option>
            {filters.categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select 
            value={selectedCuisine} 
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả ẩm thực</option>
            {filters.cuisines.map(cui => (
              <option key={cui.value} value={cui.value}>{cui.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="filter-clear-btn">
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="filter-tags">
            <span className="filter-tags-label">Tags:</span>
            <div className="filter-tags-list">
              {visibleTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleFilterChange('tag', selectedTag === tag.slug ? '' : tag.slug)}
                  className={`filter-tag ${selectedTag === tag.slug ? 'active' : ''}`}
                >
                  #{tag.name}
                </button>
              ))}
              {tags.length > 8 && (
                <button 
                  onClick={() => setShowAllTags(!showAllTags)} 
                  className="filter-tag-toggle"
                >
                  {showAllTags ? '← Thu gọn' : `+${tags.length - 8} tags`}
                </button>
              )}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <p className="filter-result-count">Tìm thấy {total} công thức</p>
        )}
      </div>

      {/* RECIPES SECTION */}
      {recipes.length > 0 ? (
        <>
          {/* Featured section - only show on first page without filters */}
          {page === 1 && !hasActiveFilters && (
            <section className="home-section">
              <h3 className="section-title">🔥 Công Thức Nổi Bật</h3>
              <div className="recipe-grid-overlay">
                {recipes.slice(0, 6).map((recipe) => (
              <div key={recipe.id} className="recipe-card-overlay">
                    <Link to={`/recipe/${recipe.id}`} className="recipe-card-link">
                      <div className="recipe-overlay-img">
                        {recipe.image_url ? (
                          (recipe.image_url.toLowerCase().includes('.mp4') || 
                          recipe.image_url.toLowerCase().includes('.webm') ||
                          recipe.image_url.toLowerCase().includes('.mov')) ? (
                            <video src={recipe.image_url} />
                          ) : (
                            <img src={recipe.image_url} alt={recipe.title} />
                          )
                        ) : (
                          <div className="recipe-placeholder" />
                        )}
                      </div>
                    </Link>
                    <div className="recipe-overlay-content">
                      <Link to={`/recipe/${recipe.id}`}><h4>{recipe.title}</h4></Link>
                      <Link to={`/user/${recipe.user_id}`} className="recipe-overlay-author" onClick={(e) => e.stopPropagation()}>
                        {recipe.username}
                      </Link>
                      <div className="recipe-overlay-meta">
                        <span>⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                        <span>👁️ {recipe.views || 0}</span>
                        <span>❤️ {recipe.favorite_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Recipes Section */}
          <section className="home-section">
            <h3 className="section-title">
              {hasActiveFilters ? '🔍 Kết Quả Lọc' : '📖 Tất Cả Công Thức'}
            </h3>
            <div className="recipe-grid-overlay">
              {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card-overlay">
                  <Link to={`/recipe/${recipe.id}`} className="recipe-card-link">
                    <div className="recipe-overlay-img">
                      {recipe.image_url ? (
                        (recipe.image_url.toLowerCase().includes('.mp4') || 
                        recipe.image_url.toLowerCase().includes('.webm') ||
                        recipe.image_url.toLowerCase().includes('.mov')) ? (
                          <video src={recipe.image_url} />
                        ) : (
                          <img src={recipe.image_url} alt={recipe.title} />
                        )
                      ) : (
                        <div className="recipe-placeholder" />
                      )}
                    </div>
                  </Link>
                  <div className="recipe-overlay-content">
                    <Link to={`/recipe/${recipe.id}`}><h4>{recipe.title}</h4></Link>
                    <Link to={`/user/${recipe.user_id}`} className="recipe-overlay-author" onClick={(e) => e.stopPropagation()}>
                      {recipe.username}
                    </Link>
                    <div className="recipe-overlay-meta">
                      <span>⭐ {recipe.avg_rating ? Number(recipe.avg_rating).toFixed(1) : '—'}</span>
                      <span>👁️ {recipe.views || 0}</span>
                      <span>❤️ {recipe.favorite_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Trước
                </button>
                <span className="pagination-info">
                  Trang {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Sau →
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        <p className="empty-message">
          {hasActiveFilters ? 'Không tìm thấy công thức nào phù hợp!' : 'Chưa có công thức nào được đăng!'}
        </p>
      )}
    </div>
  );
}

export default Home;
