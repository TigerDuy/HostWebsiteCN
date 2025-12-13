import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ReportButton from "../components/ReportButton";
import "./RecipeDetail.css";

function RecipeDetail() {
  const params = useParams();
  const location = useLocation();

  // Normalize recipe id in case a whole object was accidentally passed into the URL
  const id = useMemo(() => {
    const rawFromParams = params.id;
    const rawFromState = location.state?.recipeId || location.state?.recipe_id || location.state?.recipe?.id;
    const rawId = rawFromParams ?? rawFromState;

    if (rawId === undefined || rawId === null) return "";
    if (typeof rawId === "object") {
      if ("id" in rawId) return String(rawId.id || "");
      if ("recipe_id" in rawId) return String(rawId.recipe_id || "");
      if ("value" in rawId) return String(rawId.value || "");
      return "";
    }
    const asString = String(rawId);
    if (asString === "[object Object]" || asString === "undefined" || asString === "null") {
      return "";
    }
    return asString;
  }, [location.state, params.id]);
  const navigate = useNavigate();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:3001', []);
  const viewCountedRef = useRef(false);
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
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(null); // Track which report's reject form is open
  const [rejectReasons, setRejectReasons] = useState({}); // Track reject reason for each report
  const [processingReportId, setProcessingReportId] = useState(null);

  const fetchRecipeData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      console.error("❌ RecipeDetail: missing or invalid recipe id", params.id, location.state);
      return;
    }
    try {
      const recipeRes = await axios.get(
        `${API_BASE}/recipe/detail/${id}`
      );
      setRecipe(recipeRes.data);

      const commentsRes = await axios.get(
        `${API_BASE}/recipe/comment/${id}`
      );
      setComments(commentsRes.data);

      const statsRes = await axios.get(
        `${API_BASE}/rating/stats/${id}`
      );
      setStats(statsRes.data);

      const token = localStorage.getItem("token");
      if (token) {
        const userRatingRes = await axios.get(
          `${API_BASE}/rating/user/${id}`,
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
  }, [API_BASE, id, location.state, params.id]);

  const checkFavorite = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get(
          `${API_BASE}/favorite/check/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(res.data.isFavorited);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra yêu thích:", err);
      }
    }
  }, [API_BASE, id]);

  const checkFollowing = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token && recipe.user_id) {
      try {
        const res = await axios.get(
          `${API_BASE}/follow/is-following/${recipe.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(!!res.data.isFollowing);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra theo dõi:", err);
      }
    }
  }, [API_BASE, recipe.user_id]);

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    
    // Chỉ admin/moderator mới fetch báo cáo
    if (token && (userRole === "admin" || userRole === "moderator")) {
      try {
        const res = await axios.get(
          `${API_BASE}/report?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Lọc báo cáo cho bài viết này
        const recipeReports = res.data?.filter(r => r.recipe_id === parseInt(id)) || [];
        setReports(recipeReports);
      } catch (err) {
        console.error("❌ Lỗi lấy báo cáo:", err);
      }
    }
  }, [API_BASE, id]);

  useEffect(() => {
    if (!id) return;
    fetchRecipeData();
    checkFavorite();
    fetchReports();
  }, [fetchRecipeData, checkFavorite, fetchReports, id]);

  useEffect(() => {
    checkFollowing();
  }, [checkFollowing]);

  // Gọi tăng view đúng một lần sau khi recipe.id có dữ liệu
  useEffect(() => {
    if (!recipe?.id || viewCountedRef.current) return;
    
    const controller = new AbortController();
    fetch(`${API_BASE}/recipe/view/${recipe.id}`, { method: 'POST', signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.updated) {
          setRecipe(prev => ({ ...prev, views: (Number(prev?.views || 0) + 1) }));
        }
        viewCountedRef.current = true;
      })
      .catch(() => {
        viewCountedRef.current = true;
      });
    return () => controller.abort();
  }, [API_BASE, recipe?.id]);
  const handleFavorite = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để lưu yêu thích!");
      navigate("/login");
      return;
    }

    try {
      if (isFavorited) {
        await axios.delete(`${API_BASE}/favorite/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy yêu thích!");
        setIsFavorited(false);
      } else {
        await axios.post(
          `${API_BASE}/favorite/${id}`,
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
        `${API_BASE}/rating/${id}`,
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
        `${API_BASE}/recipe/comment`,
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

  const handleEditComment = (commentId, currentText) => {
    const newText = prompt("Chỉnh sửa bình luận:", currentText);
    if (newText === null || newText.trim() === "") return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }

    axios.put(
      `${API_BASE}/recipe/comment/${commentId}`,
      { comment: newText },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      alert("✅ Cập nhật bình luận thành công!");
      fetchRecipeData();
    })
    .catch(() => {
      alert("❌ Lỗi cập nhật bình luận!");
    });
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("❌ Bạn chắc chắn muốn xóa bình luận?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }

    axios.delete(
      `${API_BASE}/recipe/comment/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      alert("✅ Xóa bình luận thành công!");
      fetchRecipeData();
    })
    .catch(() => {
      alert("❌ Lỗi xóa bình luận!");
    });
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
        await axios.delete(`${API_BASE}/follow/${recipe.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy theo dõi!");
        setIsFollowing(false);
      } else {
        await axios.post(
          `${API_BASE}/follow/${recipe.user_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Đã theo dõi!");
        setIsFollowing(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Lỗi xử lý theo dõi!";
      alert(msg);
    }
  };

  const handleApproveReport = async (reportId) => {
    if (processingReportId) return;
    setProcessingReportId(reportId);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/report/${reportId}/status`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Xác nhận báo cáo thành công!");
      fetchReports();
    } catch (err) {
      console.error("❌ Lỗi xác nhận báo cáo:", err);
      alert("❌ Lỗi xác nhận báo cáo!");
    } finally {
      setProcessingReportId(null);
    }
  };

  const handleRejectReport = async (reportId) => {
    const reason = rejectReasons[reportId];
    if (!reason || !reason.trim()) {
      alert("Vui lòng nhập lý do bác bỏ!");
      return;
    }

    if (processingReportId) return;
    setProcessingReportId(reportId);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/report/${reportId}/status`,
        { status: "rejected", rejectedReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Bác bỏ báo cáo thành công!");
      setShowReportForm(null);
      setRejectReasons({});
      fetchReports();
    } catch (err) {
      console.error("❌ Lỗi bác bỏ báo cáo:", err);
      alert("❌ Lỗi bác bỏ báo cáo!");
    } finally {
      setProcessingReportId(null);
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

  useEffect(() => {
    if (!id) {
      // Invalid id in URL -> redirect home to avoid dead view
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

  if (loading || !id) {
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
      <div className="action-buttons">
        <button
          onClick={handleFavorite}
          className={`favorite-btn ${isFavorited ? "favorited" : ""}`}
        >
          {isFavorited ? "❤️ Đã lưu" : "🤍 Lưu vào yêu thích"}
        </button>
        
        {/* ✅ BÁO CÁO */}
        {localStorage.getItem("userId") !== String(recipe.user_id) && (
          <ReportButton recipeId={id} />
        )}
      </div>

      {/* NGUYÊN LIỆU */}
      <div className="section">
        <h3>Nguyên Liệu</h3>
        <div className="servings-display">
          <span className="servings-icon">👥</span>
          <span className="servings-text">{recipe.servings || '2'} người ăn</span>
        </div>
        <div className="ingredients-display">
          {recipe.ingredients?.split('\n').filter(i => i.trim()).map((ingredient, index) => (
            <div key={index} className="ingredient-display-item">
              {ingredient}
            </div>
          ))}
        </div>
      </div>

      {/* HƯỚNG DẪN CÁCH LÀM */}
      <div className="section">
        <h3>Hướng dẫn cách làm</h3>
        {recipe.cook_time && (
          <div className="cook-time-display">
            <span className="clock-icon">🕐</span>
            <span className="cook-time-text">{recipe.cook_time}</span>
          </div>
        )}
        <div className="steps-list">
          {recipe.steps?.split('\n').filter(s => s.trim()).map((step, index) => (
            <div key={index} className="step-display-item">
              <div className="step-display-header">
                <span className="step-display-number">{index + 1}</span>
                <p className="step-display-text">{step}</p>
              </div>
              {recipe.step_images_by_step && recipe.step_images_by_step[index] && recipe.step_images_by_step[index].length > 0 && (
                <div className="step-display-images-gallery">
                  {recipe.step_images_by_step[index].map((image, imgIndex) => (
                    <div key={imgIndex} className="step-display-image">
                      <img src={image} alt={`Bước ${index + 1} - Ảnh ${imgIndex + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr />

      {/* ✅ BÁO CÁO (CHỈ ADMIN/MODERATOR) */}
      {reports.length > 0 && (
        <div className="reports-section" style={{
          backgroundColor: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px"
        }}>
          <h3>⚠️ Báo Cáo ({reports.length})</h3>
          {reports.map((report) => (
            <div key={report.id} style={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "15px",
              marginBottom: "15px"
            }}>
              <div style={{ marginBottom: "10px" }}>
                <p><strong>👤 Người báo cáo:</strong> {report.reporter_name || "Ẩn danh"}</p>
                <p><strong>📝 Lý do:</strong> {report.reason}</p>
                <p><strong>📅 Ngày báo cáo:</strong> {new Date(report.created_at).toLocaleString('vi-VN')}</p>
                {report.processor_name && report.processed_at && (
                  <>
                    <p><strong>👨‍⚖️ Xử lý bởi:</strong> {report.processor_name}</p>
                    <p><strong>⏰ Ngày xử lý:</strong> {new Date(report.processed_at).toLocaleString('vi-VN')}</p>
                  </>
                )}
              </div>

              {processingReportId === report.id ? (
                <p style={{ color: "#666" }}>⏳ Đang xử lý...</p>
              ) : (
                <>
                  <button
                    onClick={() => handleApproveReport(report.id)}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "10px"
                    }}
                  >
                    ✅ Xác Nhận
                  </button>

                  {showReportForm === report.id ? (
                    <div style={{ marginTop: "10px" }}>
                      <textarea
                        placeholder="Nhập lý do bác bỏ..."
                        value={rejectReasons[report.id] || ""}
                        onChange={(e) => setRejectReasons({
                          ...rejectReasons,
                          [report.id]: e.target.value
                        })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          marginBottom: "10px"
                        }}
                        rows="3"
                      />
                      <button
                        onClick={() => handleRejectReport(report.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "10px"
                        }}
                      >
                        🔴 Gửi Bác Bỏ
                      </button>
                      <button
                        onClick={() => {
                          setShowReportForm(null);
                          setRejectReasons({});
                        }}
                        style={{
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReportForm(report.id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      ❌ Bác Bỏ
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BÌNH LUẬN */}
      <div className="comment-box">
        <h3>💬 Bình Luận ({comments.length})</h3>

        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author-info">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.username} className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar-placeholder">{(c.username || 'U').charAt(0).toUpperCase()}</div>
                    )}
                    <div className="comment-author-details">
                      <b className="comment-author">{c.username}</b>
                      <span className="comment-time">{new Date(c.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  {parseInt(localStorage.getItem('userId'), 10) === c.user_id && (
                    <div className="comment-actions">
                      <button className="btn-edit-comment" onClick={() => handleEditComment(c.id, c.comment)}>✏️</button>
                      <button className="btn-delete-comment" onClick={() => handleDeleteComment(c.id)}>🗑️</button>
                    </div>
                  )}
                </div>
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
