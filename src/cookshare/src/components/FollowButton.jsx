import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FollowButton({ userId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO: Follow endpoints chưa tạo
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/is-following/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setIsFollowing(!!res.data.isFollowing))
    .catch(() => {});
  }, [userId]);

  const handleToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Bạn cần đăng nhập để theo dõi người dùng.');
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFollowing(false);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error', err);
      alert('❌ Lỗi khi thay đổi trạng thái theo dõi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={`follow-btn ${isFollowing ? 'following' : ''}`} onClick={handleToggle} disabled={loading}>
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </button>
  );
}
