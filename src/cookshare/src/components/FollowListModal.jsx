import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FollowListModal.css";

function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [followingStatus, setFollowingStatus] = useState({});
  const navigate = useNavigate();
  const limit = 10;

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, [userId, type, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = type === "followers" 
        ? `/follow/followers/${userId}` 
        : `/follow/following/${userId}`;
      
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}${endpoint}?page=${page}&limit=${limit}`
      );
      
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);

      // Check following status for each user
      if (token) {
        const statusMap = {};
        for (const user of res.data.data || []) {
          if (String(user.id) !== currentUserId) {
            try {
              const statusRes = await axios.get(
                `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/is-following/${user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              statusMap[user.id] = statusRes.data.isFollowing;
            } catch {
              statusMap[user.id] = false;
            }
          }
        }
        setFollowingStatus(statusMap);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!token) {
      alert("Vui lòng đăng nhập!");
      return;
    }

    try {
      if (followingStatus[targetUserId]) {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${targetUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/${targetUserId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xử lý theo dõi!");
    }
  };

  const handleUserClick = (id) => {
    onClose();
    navigate(`/user/${id}`);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h3>{type === "followers" ? "Người theo dõi" : "Đang theo dõi"}</h3>
          <button className="follow-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="follow-modal-search">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="follow-modal-content">
          {loading ? (
            <div className="follow-modal-loading">Đang tải...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="follow-modal-empty">
              {search ? "Không tìm thấy người dùng" : "Chưa có ai"}
            </div>
          ) : (
            <ul className="follow-list">
              {filteredUsers.map((user) => (
                <li key={user.id} className="follow-item">
                  <div className="follow-item-info" onClick={() => handleUserClick(user.id)}>
                    <img
                      src={user.avatar_url || "https://via.placeholder.com/40"}
                      alt={user.username}
                      className="follow-item-avatar"
                    />
                    <div className="follow-item-details">
                      <span className="follow-item-name">{user.username}</span>
                      {user.bio && <span className="follow-item-bio">{user.bio}</span>}
                    </div>
                  </div>
                  {String(user.id) !== currentUserId && (
                    <button
                      className={`follow-item-btn ${followingStatus[user.id] ? "following" : ""}`}
                      onClick={() => handleFollow(user.id)}
                    >
                      {followingStatus[user.id] ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <div className="follow-modal-pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ←
            </button>
            <span>{page} / {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowListModal;
