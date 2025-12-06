import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import ProfileHeader from "../components/ProfileHeader";
import FollowersList from "../components/FollowersList";
import UserRecipes from "../components/UserRecipes";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: ""
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [followers, setFollowers] = useState({ data: [], page: 1, total: 0, limit: 10 });
  const [following, setFollowing] = useState({ data: [], page: 1, total: 0, limit: 10 });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserProfile();
    fetchCounts();
    fetchFollowers(1);
    fetchFollowing(1);
  }, [token, navigate, userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setAvatarUrlInput(res.data.avatar_url || "");
      setBioInput(res.data.bio || "");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      // TODO: Implement follow system
      // const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/counts/${userId}`);
      // setCounts(res.data || { followers: 0, following: 0 });
      setCounts({ followers: 0, following: 0 });
    } catch (err) {
      // ignore
    }
  };

  const fetchFollowers = async (page = 1) => {
    try {
      // TODO: Implement follow system
      // const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/followers/${userId}?page=${page}&limit=${followers.limit}`);
      // setFollowers(prev => ({ data: page === 1 ? res.data.data : prev.data.concat(res.data.data), page: res.data.page, total: res.data.total, limit: res.data.limit }));
      setFollowers({ data: [], page: 1, total: 0, limit: 10 });
    } catch (err) {}
  };

  const fetchFollowing = async (page = 1) => {
    try {
      // TODO: Implement follow system
      // const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/follow/following/${userId}?page=${page}&limit=${following.limit}`);
      // setFollowing(prev => ({ data: page === 1 ? res.data.data : prev.data.concat(res.data.data), page: res.data.page, total: res.data.total, limit: res.data.limit }));
      setFollowing({ data: [], page: 1, total: 0, limit: 10 });
    } catch (err) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => setAvatarUrlInput(e.target.value);
  const handleBioChange = (e) => setBioInput(e.target.value);
  const handleAvatarFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setAvatarFile(f);
    else setAvatarFile(null);
  };

  // Crop image to center square and resize to `size` px (default 512)
  const cropImageToSquare = (file, size = 512) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          const { width, height } = img;
          const side = Math.min(width, height);
          const sx = Math.floor((width - side) / 2);
          const sy = Math.floor((height - side) / 2);

          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error('Không thể tạo blob từ canvas'));
            // keep original filename but ensure type
            const newFile = new File([blob], file.name, { type: blob.type });
            resolve(newFile);
          }, 'image/jpeg', 0.92);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Không thể đọc file ảnh')); };
      img.src = url;
    });
  };

  const handleUploadAvatarFile = async () => {
    if (!avatarFile) return alert('Vui lòng chọn file ảnh.');
    const token = localStorage.getItem('token');
    if (!token) return alert('Bạn cần đăng nhập.');
    setUploading(true);
    try {
      // Crop to square before upload for consistent avatars
      const fileToUpload = await cropImageToSquare(avatarFile, 512);
      const fd = new FormData();
      fd.append('avatar', fileToUpload);

      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/profile/${userId}/avatar`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      // update avatar preview
      setAvatarUrlInput(res.data.avatar_url || '');
      setUser(prev => ({ ...prev, avatar_url: res.data.avatar_url || prev.avatar_url }));
      setAvatarFile(null);
      alert('✅ Upload avatar thành công!');
    } catch (err) {
      console.error('Upload/Crop error', err);
      alert(err.response?.data?.message || '❌ Lỗi khi xử lý hoặc upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate
    if (!formData.username || !formData.email) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.put(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/profile/${userId}`,
        {
          username: formData.username,
          email: formData.email,
          avatar_url: avatarUrlInput,
          bio: bioInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Cập nhật thông tin thành công!");
      setUser(res.data);
      setIsEditing(false);
      
      // Cập nhật localStorage
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("avatar_url", avatarUrlInput || "");
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("Vui lòng điền đầy đủ mật khẩu!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu không trùng khớp!");
      return;
    }

    try {
      setIsSaving(true);
      await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/change-password/${userId}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Đổi mật khẩu thành công!");
      // Clear form sau 2 giây
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        setMessage("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đổi mật khẩu!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><h2>⏳ Đang tải...</h2></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1>👤 Thông Tin Cá Nhân</h1>

        <ProfileHeader user={user} counts={counts} currentUserId={userId} onAvatarUploaded={(newUrl) => {
          if (!newUrl) return;
          const urlWithTs = newUrl + (newUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          setAvatarUrlInput(urlWithTs);
          setUser(prev => ({ ...prev, avatar_url: urlWithTs }));
          // Persist avatar_url to localStorage so Navbar and other components update immediately
          try {
            localStorage.setItem("avatar_url", urlWithTs || "");
            // notify other windows/components: storage event and a custom event for same-tab listeners
            try { window.dispatchEvent(new Event("storage")); } catch(e) {}
            try { window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatar: urlWithTs } })); } catch(e) {}
          } catch (e) {
            console.warn('Could not persist avatar_url to localStorage', e);
          }
        }} />

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {/* USER INFO SECTION */}
        <div className="profile-section">
          <h2>Thông Tin Tài Khoản</h2>
          
          {!isEditing ? (
            <div className="user-info">
              <div className="info-row">
                <label>Tên đăng nhập:</label>
                <span>{user.username}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-row">
                <label>Vai trò:</label>
                <span>{user.role === "admin" ? "👨‍💼 Quản trị viên" : "👤 Người dùng"}</span>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-edit"
              >
                ✏️ Chỉnh Sửa
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label>Tên đăng nhập:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Avatar URL:</label>
                <input
                  type="text"
                  name="avatar_url"
                  value={avatarUrlInput}
                  onChange={handleAvatarChange}
                  className="form-input"
                  placeholder="http://... or https://..."
                />
              </div>
              <div className="form-group">
                <label>Tải ảnh đại diện (file):</label>
                <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
                {avatarFile && (
                  <div className="avatar-preview">
                    <img src={URL.createObjectURL(avatarFile)} alt="preview" />
                  </div>
                )}
                {!avatarFile && avatarUrlInput && (
                  <div className="avatar-preview">
                    <img src={avatarUrlInput} alt="current avatar" />
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={handleUploadAvatarFile} disabled={uploading || !avatarFile} className="btn-upload">
                    {uploading ? '⏳ Đang upload...' : '⬆️ Upload ảnh'}
                  </button>
                  <button type="button" onClick={() => { setAvatarUrlInput(''); setUser(prev => ({ ...prev, avatar_url: '' })); }} className="btn-clear">
                    🗑️ Xóa avatar
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea
                  name="bio"
                  value={bioInput}
                  onChange={handleBioChange}
                  className="form-input"
                  rows={3}
                />
              </div>
              <div className="form-buttons">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="btn-save"
                >
                  {isSaving ? "⏳ Đang lưu..." : "💾 Lưu"}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-cancel"
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {/* CHANGE PASSWORD SECTION */}
        <div className="profile-section">
          <h2>Đổi Mật Khẩu</h2>
          <form onSubmit={handleChangePassword} className="edit-form">
            <div className="form-group">
              <label>Mật khẩu hiện tại:</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>
            <button 
              type="submit"
              disabled={isSaving}
              className="btn-save"
            >
              {isSaving ? "⏳ Đang cập nhật..." : "🔐 Đổi Mật Khẩu"}
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Followers & Following</h2>
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
        </div>

        <UserRecipes authorId={userId} />
      </div>
    </div>
  );
}

export default Profile;
