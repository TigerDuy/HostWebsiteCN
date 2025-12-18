import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchRecipes = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/list`);
        setRecipes(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy công thức:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
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
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm công thức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Tìm Kiếm
          </button>
        </form>
      </div>

      {/* RECIPES SECTION */}
      {recipes.length > 0 ? (
        <>
          <section className="home-section">
            <h3 className="section-title">Công Thức Nổi Bật</h3>
            <div className="recipe-grid-overlay">
              {recipes.slice(0, 4).map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.id}`}
                    className="recipe-card-overlay">
                    <div className="recipe-overlay-img">
                      {recipe.image_url ? (
                        (recipe.image_url.toLowerCase().includes('.mp4') || 
                        recipe.image_url.toLowerCase().includes('.webm') ||
                        recipe.image_url.toLowerCase().includes('.avi') ||
                        recipe.image_url.toLowerCase().includes('.mov')) ? (
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
              ))}
            </div>
          </section>

          {/* ALL RECIPES SECTION */}
          <section className="home-section">
            <h3 className="section-title">Tất Cả Công Thức</h3>
            <div className="recipe-grid-overlay">
              {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.id}`}
                    className="recipe-card-overlay">
                    <div className="recipe-overlay-img">
                      {recipe.image_url ? (
                        (recipe.image_url.toLowerCase().includes('.mp4') || 
                        recipe.image_url.toLowerCase().includes('.webm') ||
                        recipe.image_url.toLowerCase().includes('.avi') ||
                        recipe.image_url.toLowerCase().includes('.mov')) ? (
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
