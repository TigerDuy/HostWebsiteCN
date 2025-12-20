import { useState, useEffect } from 'react';
import axios from 'axios';
import './ThemeMarketplace.css';

function ThemeMarketplace() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadSharedThemes();
  }, []);

  const loadSharedThemes = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/marketplace`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setThemes(res.data || []);
    } catch (err) {
      setMessage('❌ Không thể tải danh sách theme');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--primary-color', theme.primary_color);
    document.documentElement.style.setProperty('--secondary-color', adjustColor(theme.primary_color, -20));

    if (theme.background_image) {
      document.body.style.backgroundImage = `url(${theme.background_image})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
    }

    localStorage.setItem('primaryColor', theme.primary_color);
    localStorage.setItem('backgroundImage', theme.background_image || '');

    setMessage(`✅ Đã áp dụng theme: ${theme.theme_name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const adjustColor = (color, amount) => {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const downloadThemeAsJson = (theme) => {
    const themeData = {
      primary_color: theme.primary_color,
      background_image: theme.background_image,
      theme_name: theme.theme_name,
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.theme_name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteSharedTheme = async (theme) => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/share/${theme.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || '✅ Đã xóa chia sẻ theme');
      // Reload list
      await loadSharedThemes();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Không thể xóa chia sẻ theme');
      console.error(err);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div className="marketplace-content">
          <h1 className="marketplace-title page-title">Theme Share</h1>
          <div className="loading">⏳ Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-content">
        <h1 className="marketplace-title page-title">Theme Share</h1>
        <p className="marketplace-subtitle">Khám phá và tải các theme được tạo bởi cộng đồng</p>

        {message && <div className="status-message">{message}</div>}

        {themes.length === 0 ? (
          <div className="no-themes">
            <p>📭 Chưa có theme nào được chia sẻ</p>
          </div>
        ) : (
          <div className="themes-grid">
            {themes.map((theme) => {
              const storedUserId = localStorage.getItem('userId');
              const storedRole = localStorage.getItem('role');
              const currentUserId = storedUserId ? Number(storedUserId) : null;
              const isAdmin = storedRole === 'admin' || storedRole === 'ADMIN' || storedRole === 'Admin';
              const canDelete = Boolean(isAdmin || (currentUserId && theme.owner_id === currentUserId));
              console.log('Theme Debug:', { 
                themeName: theme.theme_name, 
                ownerId: theme.owner_id, 
                currentUserId, 
                isAdmin, 
                canDelete 
              });
              return (
                <div key={theme.id} className="theme-card">
                  <div 
                    className="theme-preview" 
                    style={{ backgroundColor: theme.primary_color }}
                  >
                    {theme.background_image && (
                      <img 
                        src={theme.background_image} 
                        alt={theme.theme_name}
                        className="preview-bg"
                      />
                    )}
                    <div className="preview-overlay">
                      <div className="preview-text">Preview</div>
                    </div>
                  </div>

                  <div className="theme-info">
                    <h3>{theme.theme_name}</h3>
                    <p className="theme-color">Màu: {theme.primary_color}</p>
                    <p className="theme-author">Tạo bởi: {theme.created_by}</p>
                    <p className="theme-date">
                      {new Date(theme.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="theme-actions">
                    <button 
                      onClick={() => applyTheme(theme)}
                      className="btn-apply"
                      style={{ backgroundColor: theme.primary_color }}
                    >
                      Áp Dụng
                    </button>
                    <button 
                      onClick={() => downloadThemeAsJson(theme)}
                      className="btn-download"
                    >
                      Tải JSON
                    </button>
                    {canDelete && (
                      <button 
                        onClick={() => deleteSharedTheme(theme)}
                        className="btn-delete"
                      >
                        Hủy Chia Sẻ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeMarketplace;
