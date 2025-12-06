import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function UserRecipes({ authorId }) {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) return;
    setRecipes([]);
    setPage(1);
    fetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId]);

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/author/${authorId}?page=${p}&limit=${limit}`);
      if (p === 1) {
        setRecipes(res.data.data || []);
      } else {
        setRecipes(prev => prev.concat(res.data.data || []));
      }
      setTotal(res.data.total || 0);
      setPage(res.data.page || p);
    } catch (err) {
      console.error('Lỗi lấy công thức của user', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    if ((next - 1) * limit >= total) return;
    fetch(next);
  };

  if (!authorId) return null;

  return (
    <div className="user-recipes-component">
      <h3>Công thức của người dùng</h3>
      {loading && recipes.length === 0 ? <div>⏳ Đang tải...</div> : (
        <div className="recipe-grid-small">
          {recipes.map(r => (
            <div className="recipe-card-small" key={r.id}>
              {r.image_url ? (
                (r.image_url.toLowerCase().includes('.mp4') || 
                 r.image_url.toLowerCase().includes('.webm') || 
                 r.image_url.toLowerCase().includes('.avi') ||
                 r.image_url.toLowerCase().includes('.mov')) ? (
                  <video src={r.image_url} controls style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                ) : (
                  <img src={r.image_url} alt={r.title} />
                )
              ) : (
                <div className="placeholder">Không có ảnh</div>
              )}
              <div className="meta">
                <Link to={`/recipe/${r.id}`}>{r.title}</Link>
                <div className="small-meta">⭐ {r.avg_rating ? Number(r.avg_rating).toFixed(1) : '—'} • 👁️ {r.views || 0} • ❤️ {r.favorite_count || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {recipes.length < total && (
        <button className="btn-load" onClick={loadMore}>Xem thêm</button>
      )}
    </div>
  );
}
