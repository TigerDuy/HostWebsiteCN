import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({});
  const [comments, setComments] = useState([]);
  const [nestedComments, setNestedComments] = useState([]);
  const [sortComments, setSortComments] = useState("latest");
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
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
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/detail/${id}`
      );
      setRecipe(recipeRes.data);

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const commentsRes = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment/${id}?sort=${sortComments}`,
        { headers }
      );
      setComments(commentsRes.data);

      const statsRes = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/rating/stats/${id}`
      );
      setStats(statsRes.data);

      if (token) {
        const userRatingRes = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/rating/user/${id}`,
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
  }, [id, sortComments]);

  // Build nested comments: sort is applied only to root-level, replies always sorted by time
  useEffect(() => {
    const map = {};
    const roots = [];
    
    // Build map
    comments.forEach((c) => {
      map[c.id] = { ...c, replies: [] };
    });
    
    // Nest replies under parents
    comments.forEach((c) => {
      if (c.parent_id) {
        if (map[c.parent_id]) map[c.parent_id].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    
    // Sort replies by created_at ASC (oldest first = chronological order)
    Object.values(map).forEach(comment => {
      if (comment.replies.length > 0) {
        comment.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    });
    
    setNestedComments(roots);
  }, [comments]);

  const checkFavorite = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/favorite/check/${id}`,
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
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/is-following/${recipe.user_id}`,
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
    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/view/${recipe.id}`, { method: 'POST', signal: controller.signal })
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
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/favorite/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy yêu thích!");
        setIsFavorited(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/favorite/${id}`,
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
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/rating/${id}`,
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
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment`,
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

  const handleReplyClick = (parentId) => {
    setReplyTargetId(parentId);
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!replyTargetId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập để trả lời!");
      navigate("/login");
      return;
    }
    if (!replyText.trim()) {
      alert("❌ Vui lòng nhập nội dung trả lời!");
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment`,
        { recipe_id: id, comment: replyText, parent_id: replyTargetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã trả lời bình luận!");
      setReplyText("");
      setReplyTargetId(null);
      fetchRecipeData();
    } catch (err) {
      alert("❌ Lỗi khi trả lời!");
    }
  };

  const handleCancelReply = () => {
    setReplyText("");
    setReplyTargetId(null);
  };

  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập để thích bình luận!");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // optimistic refresh
      const liked = res.data.liked;
      setComments((prev) => prev.map(c => c.id === commentId ? { ...c, like_count: (c.like_count || 0) + (liked ? 1 : -1), is_liked: liked } : c));
    } catch (err) {
      alert("❌ Lỗi khi thích bình luận!");
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleSubmitEdit = async () => {
    if (!editCommentId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }
    if (!editCommentText.trim()) {
      alert("❌ Bình luận không được để trống!");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment/${editCommentId}`,
        { comment: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Cập nhật bình luận thành công!");
      setEditCommentId(null);
      setEditCommentText("");
      fetchRecipeData();
    } catch (err) {
      alert("❌ Lỗi cập nhật bình luận!");
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText("");
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
      `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/comment/${commentId}`,
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
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${recipe.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Đã hủy theo dõi!");
        setIsFollowing(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${recipe.user_id}`,
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
        <div className="comment-box-header">
          <h3>💬 Bình Luận ({comments.length})</h3>
          <div className="comment-sort-row">
            <label>Sắp xếp: </label>
            <select value={sortComments} onChange={(e) => setSortComments(e.target.value)}>
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="top">Được thích nhiều nhất</option>
            </select>
          </div>
        </div>

        {nestedComments.length > 0 ? (
          <ul className="comments-list">
            {nestedComments.map((c) => (
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
                  <div className="comment-actions">
                    <button className={`btn-like-comment ${c.is_liked ? 'liked' : ''}`} onClick={() => handleLikeComment(c.id)}>❤️ {c.like_count || 0}</button>
                    <button className="btn-reply-comment" onClick={() => handleReplyClick(c.id)}>↩️</button>
                    {parseInt(localStorage.getItem('userId'), 10) === c.user_id && (
                      <>
                        <button className="btn-edit-comment" onClick={() => handleEditComment(c.id, c.comment)}>✏️</button>
                        <button className="btn-delete-comment" onClick={() => handleDeleteComment(c.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>
                <p className="comment-text">{c.comment}</p>

                {editCommentId === c.id ? (
                  <div className="reply-box">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      placeholder="Chỉnh sửa bình luận..."
                      rows="3"
                    />
                    <div className="reply-actions">
                      <button className="btn-comment" onClick={handleSubmitEdit}>Lưu</button>
                      <button className="btn-delete-comment" onClick={handleCancelEdit}>Hủy</button>
                    </div>
                  </div>
                ) : null}

                {replyTargetId === c.id && (
                  <div className="reply-box">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập trả lời của bạn..."
                      rows="3"
                    />
                    <div className="reply-actions">
                      <button className="btn-comment" onClick={handleSubmitReply}>Gửi</button>
                      <button className="btn-delete-comment" onClick={handleCancelReply}>Hủy</button>
                    </div>
                  </div>
                )}

                {c.replies && c.replies.length > 0 && (
                  <ul className="comment-replies">
                    {c.replies.map((r) => (
                      <li key={r.id} className="comment-item reply">
                        <div className="comment-header">
                          <div className="comment-author-info">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt={r.username} className="comment-avatar" />
                            ) : (
                              <div className="comment-avatar-placeholder">{(r.username || 'U').charAt(0).toUpperCase()}</div>
                            )}
                            <div className="comment-author-details">
                              <b className="comment-author">{r.username}</b>
                              <span className="comment-time">{new Date(r.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                          <div className="comment-actions">
                            <button className={`btn-like-comment ${r.is_liked ? 'liked' : ''}`} onClick={() => handleLikeComment(r.id)}>❤️ {r.like_count || 0}</button>
                            <button className="btn-reply-comment" onClick={() => handleReplyClick(r.id)}>↩️</button>
                            {parseInt(localStorage.getItem('userId'), 10) === r.user_id && (
                              <>
                                <button className="btn-edit-comment" onClick={() => handleEditComment(r.id, r.comment)}>✏️</button>
                                <button className="btn-delete-comment" onClick={() => handleDeleteComment(r.id)}>🗑️</button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="comment-text">{r.comment}</p>

                        {editCommentId === r.id ? (
                          <div className="reply-box">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              placeholder="Chỉnh sửa bình luận..."
                              rows="3"
                            />
                            <div className="reply-actions">
                              <button className="btn-comment" onClick={handleSubmitEdit}>Lưu</button>
                              <button className="btn-delete-comment" onClick={handleCancelEdit}>Hủy</button>
                            </div>
                          </div>
                        ) : null}

                        {replyTargetId === r.id && (
                          <div className="reply-box">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập trả lời của bạn..."
                              rows="3"
                            />
                            <div className="reply-actions">
                              <button className="btn-comment" onClick={handleSubmitReply}>Gửi</button>
                              <button className="btn-delete-comment" onClick={handleCancelReply}>Hủy</button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
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
