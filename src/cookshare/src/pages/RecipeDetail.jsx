import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({});
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
  });
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchRecipeData = useCallback(async () => {
    try {
      const recipeRes = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/detail/${id}`
      );
      setRecipe(recipeRes.data);

      const commentsRes = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/comment/${id}`
      );
      setComments(commentsRes.data);

      const statsRes = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/rating/stats/${id}`
      );
      setStats(statsRes.data);

      const token = localStorage.getItem("token");
      if (token) {
        const userRatingRes = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/rating/user/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (userRatingRes.data.hasRated) {
          setUserRating(userRatingRes.data.rating);
          setHasRated(true);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkFavorite = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/favorite/check/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(res.data.isFavorited);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra yêu thích:", err);
      }
    }
  }, [id]);

  const checkFollowing = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token && recipe.user_id) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/is-following/${recipe.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra theo dõi:", err);
      }
    }
  }, [recipe.user_id]);

  useEffect(() => {
    fetchRecipeData();
    checkFavorite();
  }, [fetchRecipeData, checkFavorite]);

  useEffect(() => {
    checkFollowing();
  }, [checkFollowing]);

  // Gọi tăng view đúng một lần sau khi recipe.id có dữ liệu
  useEffect(() => {
    if (!recipe?.id) return;
    const controller = new AbortController();
    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/view/${recipe.id}`, { method: 'POST', signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.updated) {
          setRecipe(prev => ({ ...prev, views: (Number(prev?.views || 0) + 1) }));
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [recipe?.id]);
  const handleFavorite = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để lưu yêu thích!");
      navigate("/login");
      return;
    }

    try {
      if (isFavorited) {
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/favorite/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy yêu thích!");
        setIsFavorited(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/favorite/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Đã lưu vào yêu thích!");
        setIsFavorited(true);
      }
    } catch (err) {
      alert("❌ Lỗi xử lý yêu thích!");
    }
  };

  const handleRating = async (rating) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/rating/${id}`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserRating(rating);
      setHasRated(true);
      alert("✅ Cảm ơn đánh giá của bạn!");
      fetchRecipeData();
    } catch (err) {
      alert("❌ Lỗi đánh giá!");
    }
  };

  const handleComment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để bình luận!");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      alert("❌ Vui lòng nhập bình luận!");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/comment`,
        { recipe_id: id, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentText("");
      alert("✅ Gửi bình luận thành công!");
      fetchRecipeData();
    } catch (err) {
      alert("❌ Lỗi gửi bình luận!");
    }
  };

  const handleFollow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để theo dõi!");
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/${recipe.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy theo dõi!");
        setIsFollowing(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/${recipe.user_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Đã theo dõi!");
        setIsFollowing(true);
      }
    } catch (err) {
      alert("❌ Lỗi xử lý theo dõi!");
    }
  };

  const StarRating = ({ rating, onRate, disabled }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onRate(star)}
          className={`star ${star <= rating ? "filled" : ""}`}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="detail-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="detail-container">
      {recipe.image_url && (
        (recipe.image_url.toLowerCase().includes('.mp4') || 
        recipe.image_url.toLowerCase().includes('.webm') || 
        recipe.image_url.toLowerCase().includes('.avi') ||
        recipe.image_url.toLowerCase().includes('.mov')) ? (
          <video
            src={recipe.image_url}
            className="detail-img"
            controls
            width="100%"
            style={{ maxWidth: '600px', borderRadius: '8px' }}
          />
        ) : (
          <img
            src={recipe.image_url}
            className="detail-img"
            alt={recipe.title}
          />
        )
      )}

      <h2 className="detail-title">{recipe.title}</h2>
      
      <div className="author-section">
        <img 
          src={recipe.avatar_url || "https://via.placeholder.com/40"} 
          alt={recipe.username}
          className="author-avatar"
        />
        <span 
          className="author-name"
          onClick={() => navigate(`/user/${recipe.user_id}`)}
        >
          {recipe.username}
        </span>
        <span className="views-count">👁️ {Number(recipe.views || 0)} lượt xem</span>
        <span className="favs-count">❤️ {Number(recipe.favorite_count || 0)} lượt lưu</span>
        {localStorage.getItem("userId") !== String(recipe.user_id) && (
          <button 
            onClick={handleFollow}
            className={`follow-btn ${isFollowing ? "following" : ""}`}
          >
            {isFollowing ? "✓ Đang theo dõi" : "+ Theo dõi"}
          </button>
        )}
      </div>

      {/* ✅ ĐÁNH GIÁ */}
      <div className="rating-section">
        <h3>⭐ Đánh Giá</h3>
        <div className="rating-stats">
          <div className="average-rating">
            <p className="big-rating">
              {Number(stats.averageRating || 0).toFixed(1)}
            </p>
            <p className="total-ratings">({Number(stats.totalRatings || 0)} đánh giá)</p>
          </div>

          <div className="rating-histogram">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="histogram-row">
                <span className="histogram-label">{star} ★</span>
                <div className="histogram-bar">
                  <div
                    className="histogram-fill"
                    style={{
                      width: Number(stats.totalRatings || 0) > 0
                        ? `${(
                            (Number(stats[`stars${star}`] || 0) / Number(stats.totalRatings || 1))
                          ) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="histogram-count">
                  {Number(stats[`stars${star}`] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="user-rating">
          <p className="rating-label">Đánh giá của bạn:</p>
          <StarRating
            rating={userRating}
            onRate={handleRating}
            disabled={false}
          />
          {hasRated && (
            <p className="rated-message">✅ Bạn đã đánh giá {userRating} sao</p>
          )}
        </div>
      </div>

      {/* ✅ YÊU THÍCH */}
      <button
        onClick={handleFavorite}
        className={`favorite-btn ${isFavorited ? "favorited" : ""}`}
      >
        {isFavorited ? "❤️ Đã lưu" : "🤍 Lưu vào yêu thích"}
      </button>

      {/* NGUYÊN LIỆU */}
      <div className="section">
        <h3>🥕 Nguyên Liệu</h3>
        <pre className="ingredient-text">{recipe.ingredients}</pre>
      </div>

      {/* CÁCH LÀM */}
      <div className="section">
        <h3>🔥 Cách Làm</h3>
        <pre className="steps-text">{recipe.steps}</pre>
      </div>

      <hr />

      {/* BÌNH LUẬN */}
      <div className="comment-box">
        <h3>💬 Bình Luận ({comments.length})</h3>

        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <b className="comment-author">{c.username}</b>
                <p className="comment-text">{c.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-comments">Chưa có bình luận nào</p>
        )}

        <textarea
          placeholder="📝 Nhập bình luận của bạn..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="comment-textarea"
          rows="4"
        />
        <button className="btn-comment" onClick={handleComment}>
          ✅ Gửi Bình Luận
        </button>
      </div>
    </div>
  );
}

export default RecipeDetail;
