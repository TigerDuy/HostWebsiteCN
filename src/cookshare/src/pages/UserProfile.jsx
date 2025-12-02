import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProfileHeader from "../components/ProfileHeader";
import FollowersList from "../components/FollowersList";
import UserRecipes from "../components/UserRecipes";
import "./UserProfile.css";

function UserProfile() {
  const { id } = useParams();
  const userId = parseInt(localStorage.getItem("userId"), 10);

  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  const [followers, setFollowers] = useState({ data: [], page: 1, total: 0, limit: 10 });
  const [following, setFollowing] = useState({ data: [], page: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchUser(), fetchCounts(), fetchFollowers(1), fetchFollowing(1)]);
    } catch (err) {
      setError("Lỗi khi tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/user/${id}`);
    setUser(res.data);
  };

  const fetchCounts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/counts/${id}`);
    setCounts(res.data || { followers: 0, following: 0 });
  };

  const fetchFollowers = async (page = 1) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/followers/${id}?page=${page}&limit=${followers.limit}`);
    setFollowers(prev => ({ data: page === 1 ? res.data.data : prev.data.concat(res.data.data), page: res.data.page, total: res.data.total, limit: res.data.limit }));
  };

  const fetchFollowing = async (page = 1) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/follow/following/${id}?page=${page}&limit=${following.limit}`);
    setFollowing(prev => ({ data: page === 1 ? res.data.data : prev.data.concat(res.data.data), page: res.data.page, total: res.data.total, limit: res.data.limit }));
  };

  if (loading) return <div className="userprofile-container">⏳ Đang tải...</div>;

  if (error) return <div className="userprofile-container">❌ {error}</div>;

  return (
    <div className="userprofile-container">
      <div className="userprofile-card">
        <ProfileHeader user={user} counts={counts} currentUserId={userId} />

        <div className="lists">
          <div className="list-col">
            <h3>Followers</h3>
            <FollowersList items={followers.data} total={followers.total} onLoadMore={() => fetchFollowers(followers.page + 1)} currentUserId={userId} />
          </div>

          <div className="list-col">
            <h3>Following</h3>
            <FollowersList items={following.data} total={following.total} onLoadMore={() => fetchFollowing(following.page + 1)} currentUserId={userId} />
          </div>
        </div>

        <UserRecipes authorId={id} />
      </div>
    </div>
  );
}

export default UserProfile;
