import React, { useRef, useState } from 'react';
import FollowButton from './FollowButton';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AvatarCropper from './AvatarCropper';

export default function ProfileHeader({ user, counts = { followers:0, following:0 }, currentUserId, onAvatarUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!user) return null;

  const handleAvatarClick = () => {
    if (currentUserId && parseInt(currentUserId, 10) === user.id) {
      inputRef.current?.click();
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Bạn cần đăng nhập để thay đổi avatar.');
    // open cropper modal
    setSelectedFile(file);
    setShowCrop(true);
  };

  const handleCropCancel = () => {
    setSelectedFile(null);
    setShowCrop(false);
  };

  const handleCropComplete = async (croppedFile) => {
    setShowCrop(false);
    setSelectedFile(null);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', croppedFile);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/auth/profile/${user.id}/avatar`, fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      const newUrl = res.data.avatar_url;
      if (onAvatarUploaded) onAvatarUploaded(newUrl);
    } catch (err) {
      console.error('Upload avatar error', err);
      alert(err.response?.data?.message || '❌ Lỗi khi upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-header-component">
      <div className="ph-left">
        <div className={`ph-avatar ${currentUserId && parseInt(currentUserId, 10) === user.id ? 'clickable' : ''}`} onClick={handleAvatarClick}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} />
          ) : (
            <div className="ph-placeholder">{(user.username || 'U').charAt(0).toUpperCase()}</div>
          )}
          {currentUserId && parseInt(currentUserId, 10) === user.id && (
            <div className="ph-avatar-overlay">{uploading ? '⏳' : '📷'}</div>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        {showCrop && selectedFile && (
          <AvatarCropper file={selectedFile} onCancel={handleCropCancel} onComplete={handleCropComplete} />
        )}
        <div className="ph-main">
          <h2>{user.username}</h2>
          {user.bio && <p className="ph-bio">{user.bio}</p>}
          <div className="ph-counts">
            <span>Followers: <strong>{counts.followers}</strong></span>
            <span>Following: <strong>{counts.following}</strong></span>
          </div>
        </div>
      </div>
      <div className="ph-right">
        {currentUserId && parseInt(currentUserId,10) !== user.id && (
          <FollowButton userId={user.id} />
        )}
        {currentUserId && parseInt(currentUserId,10) === user.id ? (
          <Link to="/settings" className="btn-view-profile">Chỉnh sửa</Link>
        ) : (
          <Link to={`/user/${user.id}`} className="btn-view-profile">Xem trang cá nhân</Link>
        )}
      </div>
    </div>
  );
}
