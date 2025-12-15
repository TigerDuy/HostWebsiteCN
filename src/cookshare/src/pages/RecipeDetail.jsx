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
  const [replyTexts, setReplyTexts] = useState({});
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(null); // Track which report's reject form is open
  const [rejectReasons, setRejectReasons] = useState({}); // Track reject reason for each report
  const [processingReportId, setProcessingReportId] = useState(null);

  const handleUnhide = async () => {
    if (!window.confirm("Bỏ ẩn bài viết này? (Reset violation_count về 0)")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/recipe/unhide/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã bỏ ẩn bài viết!");
      fetchRecipeData();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Lỗi bỏ ẩn bài viết!");
    }
  };

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

      const userId = localStorage.getItem("userId") || 0;
      const commentsRes = await axios.get(
        `${API_BASE}/recipe/comment/${id}?userId=${userId}`
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

  const handleComment = async (parentId = null) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Bạn cần đăng nhập để bình luận!");
      navigate("/login");
      return;
    }

    const text = parentId ? (replyTexts[parentId] || "") : commentText;
    if (!text.trim()) {
      alert("❌ Vui lòng nhập bình luận!");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/recipe/comment`,
        { recipe_id: id, comment: text, parent_comment_id: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (parentId) {
        setReplyTexts(prev => ({ ...prev, [parentId]: "" }));
        setReplyingTo(null);
      } else {
        setCommentText("");
      }
      alert("✅ Gửi bình luận thành công!");
      fetchRecipeData();
    } catch (err) {
      alert("❌ Lỗi gửi bình luận!");
    }
  };

  const handleLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập để thích bình luận!");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/recipe/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecipeData();
    } catch (err) {
      console.error("❌ Lỗi like:", err);
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
        {recipe.is_hidden && (
          <div className="hidden-notice">
            <strong>🚫 Bài viết này đã bị ẩn</strong> do vi phạm quy định ({recipe.violation_count || 0}/3 lần).
            {localStorage.getItem("role") === "admin" && (
              <button onClick={handleUnhide} className="btn-unhide">
                🔓 Bỏ ẩn (Admin)
              </button>
            )}
          </div>
        )}
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
          {(() => {
            const allIngredients = recipe.ingredients?.split('\n').filter(i => i.trim()) || [];
            const LIMIT = 8;
            const displayIngredients = showAllIngredients ? allIngredients : allIngredients.slice(0, LIMIT);
            const hasMore = allIngredients.length > LIMIT;
            
            return (
              <>
                {displayIngredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-display-item">
                    {ingredient}
                  </div>
                ))}
                {hasMore && (
                  <button 
                    onClick={() => setShowAllIngredients(!showAllIngredients)}
                    className="btn-toggle-ingredients"
                  >
                    {showAllIngredients ? '↑ Thu gọn' : `↓ Xem thêm ${allIngredients.length - LIMIT} nguyên liệu`}
                  </button>
                )}
              </>
            );
          })()}
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
          {(() => {
            const STEP_DELIMITER = '||STEP||';
            const raw = recipe.steps || '';
            let stepsArr = [];
            if (raw.includes(STEP_DELIMITER)) {
              stepsArr = raw.split(STEP_DELIMITER).map(s => s.trim()).filter(Boolean);
            } else {
              // Fallback cũ: tách theo dòng trống; nếu không có thì giữ nguyên 1 khối
              const byBlankLine = raw.split(/\r?\n\s*\r?\n/).map(s => s.trim()).filter(Boolean);
              stepsArr = byBlankLine.length > 0 ? byBlankLine : (raw.trim() ? [raw.trim()] : []);
            }
            return stepsArr.map((step, index) => (
            <div key={index} className="step-display-item">
              <div className="step-display-header">
                <span className="step-display-number">{index + 1}</span>
                <p className="step-display-text">{step}</p>
              </div>
              {recipe.step_images_by_step && recipe.step_images_by_step[index] && recipe.step_images_by_step[index].length > 0 && (
                <div className="step-display-images-gallery">
                  {recipe.step_images_by_step[index].map((image, imgIndex) => {
                    const src = typeof image === 'string' ? image : image?.image_url;
                    return (
                      <div key={imgIndex} className="step-display-image">
                        {src ? (
                          <img src={src} alt={`Bước ${index + 1} - Ảnh ${imgIndex + 1}`} />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ));
          })()}
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
        <h3>💬 Bình Luận ({comments.reduce((count, c) => count + 1 + (c.replies?.length || 0), 0)})</h3>

        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((c) => (
              <CommentItem 
                key={c.id} 
                comment={c} 
                level={0}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyTexts={replyTexts}
                setReplyTexts={setReplyTexts}
                handleComment={handleComment}
                handleLike={handleLike}
                handleEditComment={handleEditComment}
                handleDeleteComment={handleDeleteComment}
              />
            ))}
          </ul>
        ) : (
          <p className="no-comments">Chưa có bình luận nào</p>
        )}

        <div className="comment-input-row">
          {(() => {
            const currentUsername = localStorage.getItem('username') || '';
            const currentAvatar = localStorage.getItem('avatar_url') || '';
            const avatarSrc = currentAvatar || "https://via.placeholder.com/32";
            const altText = currentUsername || 'Bạn';
            return (
              <img
                src={avatarSrc}
                alt={altText}
                className="comment-input-avatar"
              />
            );
          })()}
          <input
            placeholder="Thêm bình luận"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            className="comment-input"
          />
          <button className="comment-send" onClick={() => handleComment()} title="Gửi">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// Recursive Comment Component
function CommentItem({ comment, level, replyingTo, setReplyingTo, replyTexts, setReplyTexts, handleComment, handleLike, handleEditComment, handleDeleteComment }) {
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);
  const isReplying = replyingTo === comment.id;

  return (
    <li className="comment-item" style={{ marginLeft: `${level * 30}px` }}>
      <div className="comment-header">
        <div className="comment-author-info">
          {comment.avatar_url ? (
            <img src={comment.avatar_url} alt={comment.username} className="comment-avatar" />
          ) : (
            <div className="comment-avatar-placeholder">{(comment.username || 'U').charAt(0).toUpperCase()}</div>
          )}
          <div className="comment-author-details">
            <b className="comment-author">{comment.username}</b>
            <span className="comment-handle">@cook_{String(comment.user_id || '').padStart(6,'0')}</span>
            <span className="comment-time">{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
          </div>
        </div>
        {currentUserId === comment.user_id && (
          <div className="comment-actions">
            <button className="btn-edit-comment" title="Chỉnh sửa" onClick={() => handleEditComment(comment.id, comment.comment)}>✏️</button>
            <button className="btn-delete-comment" title="Xóa" onClick={() => handleDeleteComment(comment.id)}>🗑️</button>
          </div>
        )}
      </div>
      <p className="comment-text">{comment.comment}</p>

      <div className="comment-footer">
        <button 
          className={`btn-like ${comment.user_liked ? 'liked' : ''}`}
          title="Thích" 
          onClick={() => handleLike(comment.id)}
        >
          {comment.user_liked ? '♥' : '♡'} {comment.like_count > 0 && comment.like_count}
        </button>
        <button className="btn-reply" title="Trả lời" onClick={() => setReplyingTo(isReplying ? null : comment.id)}>Trả lời</button>
      </div>

      {isReplying && (
        <div className="reply-input-row">
          <input
            placeholder="Trả lời thư..."
            value={replyTexts[comment.id] || ""}
            onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleComment(comment.id)}
            className="comment-input"
          />
          <button className="comment-send" onClick={() => handleComment(comment.id)} title="Gửi">
            ➤
          </button>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <ul className="replies-list">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyTexts={replyTexts}
              setReplyTexts={setReplyTexts}
              handleComment={handleComment}
              handleLike={handleLike}
              handleEditComment={handleEditComment}
              handleDeleteComment={handleDeleteComment}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default RecipeDetail;
