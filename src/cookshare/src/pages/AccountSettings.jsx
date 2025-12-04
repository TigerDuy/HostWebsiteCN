import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function AccountSettings() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [user, setUser] = useState({ username:'', email:'', role:'' });
  const [formData, setFormData] = useState({ username:'', email:'', currentPassword:'', newPassword:'', confirmPassword:'' });
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchUserProfile();
  }, [token, navigate]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/auth/profile/${userId}`, { headers:{ Authorization:`Bearer ${token}` } });
      setUser(res.data);
      setFormData(prev => ({ ...prev, username: res.data.username, email: res.data.email }));
      setAvatarUrlInput(res.data.avatar_url || '');
      setBioInput(res.data.bio || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải thông tin!');
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleAvatarChange = e => setAvatarUrlInput(e.target.value);
  const handleBioChange = e => setBioInput(e.target.value);
  const handleAvatarFileChange = e => { const f = e.target.files && e.target.files[0]; setAvatarFile(f || null); };

  const handleUpdateProfile = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!formData.username || !formData.email) { setError('Vui lòng nhập đầy đủ thông tin!'); return; }
    try {
      setIsSaving(true);
      const res = await axios.put(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/auth/profile/${userId}`, { username: formData.username, email: formData.email, avatar_url: avatarUrlInput, bio: bioInput }, { headers:{ Authorization:`Bearer ${token}` } });
      setMessage('✅ Cập nhật thành công!');
      setUser(res.data);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('avatar_url', avatarUrlInput || '');
      window.dispatchEvent(new Event('storage'));
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật!');
    } finally { setIsSaving(false); }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    const { currentPassword, newPassword, confirmPassword } = formData;
    if (!currentPassword || !newPassword || !confirmPassword) { setError('Vui lòng điền đầy đủ mật khẩu!'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải >= 6 ký tự!'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu không trùng khớp!'); return; }
    try {
      setIsSaving(true);
      await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/auth/change-password/${userId}`, { currentPassword, newPassword }, { headers:{ Authorization:`Bearer ${token}` } });
      setMessage('✅ Đổi mật khẩu thành công!');
      setTimeout(() => { setFormData(prev => ({ ...prev, currentPassword:'', newPassword:'', confirmPassword:'' })); setMessage(''); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đổi mật khẩu!');
    } finally { setIsSaving(false); }
  };

  const handleUploadAvatarFile = async () => {
    if (!avatarFile) return alert('Chọn file ảnh');
    const token = localStorage.getItem('token'); if (!token) return alert('Cần đăng nhập');
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('avatar', avatarFile);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/auth/profile/${userId}/avatar`, fd, { headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'multipart/form-data' } });
      setAvatarUrlInput(res.data.avatar_url || '');
      setUser(prev => ({ ...prev, avatar_url: res.data.avatar_url || prev.avatar_url }));
      setAvatarFile(null);
      alert('✅ Upload avatar thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi upload avatar');
    } finally { setUploading(false); }
  };

  if (!token) return null;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1>⚙️ Cài Đặt Tài Khoản</h1>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="profile-section">
          <h2>Thông Tin Tài Khoản</h2>
          {!isEditing ? (
            <div className="user-info">
              <div className="info-row"><label>Tên đăng nhập:</label><span>{user.username}</span></div>
              <div className="info-row"><label>Email:</label><span>{user.email}</span></div>
              <div className="info-row"><label>Vai trò:</label><span>{user.role === 'admin' ? '👨‍💼 Quản trị viên' : '👤 Người dùng'}</span></div>
              <button onClick={() => setIsEditing(true)} className="btn-edit">✏️ Chỉnh Sửa</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group"><label>Tên đăng nhập:</label><input type="text" name="username" value={formData.username} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Avatar URL:</label><input type="text" name="avatar_url" value={avatarUrlInput} onChange={handleAvatarChange} className="form-input" placeholder="http://..." /></div>
              <div className="form-group"><label>Chọn file avatar:</label><input type="file" accept="image/*" onChange={handleAvatarFileChange} />
                {avatarFile && <div className="avatar-preview"><img src={URL.createObjectURL(avatarFile)} alt="preview" /></div>}
                {!avatarFile && avatarUrlInput && <div className="avatar-preview"><img src={avatarUrlInput} alt="current avatar" /></div>}
                <div style={{marginTop:8}}>
                  <button type="button" onClick={handleUploadAvatarFile} disabled={uploading || !avatarFile} className="btn-upload">{uploading ? '⏳ Đang upload...' : '⬆️ Upload ảnh'}</button>
                  <button type="button" onClick={() => { setAvatarUrlInput(''); setUser(prev => ({ ...prev, avatar_url: '' })); }} className="btn-clear">🗑️ Xóa avatar</button>
                </div>
              </div>
              <div className="form-group"><label>Bio:</label><textarea name="bio" value={bioInput} onChange={handleBioChange} className="form-input" rows={3} /></div>
              <div className="form-buttons">
                <button type="submit" disabled={isSaving} className="btn-save">{isSaving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">❌ Hủy</button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h2>Đổi Mật Khẩu</h2>
          <form onSubmit={handleChangePassword} className="edit-form">
            <div className="form-group"><label>Mật khẩu hiện tại:</label><input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="form-input" /></div>
            <div className="form-group"><label>Mật khẩu mới:</label><input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="form-input" /></div>
            <div className="form-group"><label>Xác nhận mật khẩu mới:</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="form-input" /></div>
            <button type="submit" disabled={isSaving} className="btn-save">{isSaving ? '⏳ Đang cập nhật...' : '🔐 Đổi Mật Khẩu'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
