import { useState, useEffect } from 'react';
import axios from 'axios';
import './ThemeCustomization.css';

function ThemeCustomization() {
  const [primaryColor, setPrimaryColor] = useState('#ff7f50');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [themeName, setThemeName] = useState('My Custom Theme');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Tự động tải giao diện từ tài khoản nếu có token, fallback sang localStorage
    const init = async () => {
      if (token) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/preferences`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const color = res.data.primary_color || localStorage.getItem('primaryColor') || '#ff7f50';
          const bg = res.data.background_image || localStorage.getItem('backgroundImage') || '';
          setPrimaryColor(color);
          setBackgroundImage(bg);
          setBackgroundPreview(bg);
          applyTheme(color, bg);
          return;
        } catch {}
      }
      const savedColor = localStorage.getItem('primaryColor') || '#ff7f50';
      const savedBg = localStorage.getItem('backgroundImage') || '';
      setPrimaryColor(savedColor);
      setBackgroundImage(savedBg);
      setBackgroundPreview(savedBg);
      applyTheme(savedColor, savedBg);
    };
    init();
  }, []);

  const loadThemePreferencesFromAccount = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrimaryColor(res.data.primary_color || '#ff7f50');
      setBackgroundImage(res.data.background_image || '');
      setBackgroundPreview(res.data.background_image || '');
      applyTheme(res.data.primary_color || '#ff7f50', res.data.background_image || '');
    } catch (err) {
      setMessage('❌ Không thể tải giao diện từ tài khoản');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const applyTheme = (color, bgImage) => {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--secondary-color', adjustColor(color, -20));
    
    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  };

  const adjustColor = (color, amount) => {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
    applyTheme(newColor, backgroundImage);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setBackgroundImage(dataUrl);
        setBackgroundPreview(dataUrl);
        applyTheme(primaryColor, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundImage('');
    setBackgroundPreview('');
    applyTheme(primaryColor, '');
  };

  const handleSave = async () => {
    // Lưu và tự đồng bộ lên tài khoản (nếu đăng nhập), đồng thời lưu local để giữ trải nghiệm offline
    setIsSaving(true);
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('backgroundImage', backgroundImage);
    try {
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/preferences`,
          {
            primary_color: primaryColor,
            background_image: backgroundImage,
            theme_name: 'Custom Theme'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('✅ Đã lưu và đồng bộ giao diện lên tài khoản!');
      } else {
        setMessage('✅ Đã lưu giao diện! (Bạn chưa đăng nhập)');
      }
    } catch (err) {
      setMessage('❌ Lỗi đồng bộ lên tài khoản! Giao diện vẫn được lưu cục bộ.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
      setIsSaving(false);
    }
  };

  const handleSaveToAccount = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/preferences`,
        {
          primary_color: primaryColor,
          background_image: backgroundImage,
          theme_name: 'Custom Theme'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Đã đồng bộ giao diện lên tài khoản!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Lỗi đồng bộ giao diện lên tài khoản!');
      console.error(err);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultColor = '#ff7f50';
    const defaultBg = '';
    
    setPrimaryColor(defaultColor);
    setBackgroundImage(defaultBg);
    setBackgroundPreview(defaultBg);
    
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('backgroundImage');
    
    applyTheme(defaultColor, defaultBg);
    setMessage('✅ Đã khôi phục cài đặt mặc định!');
    setTimeout(() => setMessage(''), 3000);
  };

  // 📤 Export theme as JSON file
  const handleExportTheme = () => {
    const themeData = {
      primary_color: primaryColor,
      background_image: backgroundImage,
      theme_name: 'CookShare Theme',
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cookshare-theme-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMessage('📥 Đã tải xuống file giao diện!');
    setTimeout(() => setMessage(''), 3000);
  };

  // 📥 Import theme from JSON file
  const handleImportTheme = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const themeData = JSON.parse(event.target.result);
        
        if (!themeData.primary_color) {
          setMessage('❌ File không hợp lệ! Thiếu primary_color');
          return;
        }

        setPrimaryColor(themeData.primary_color);
        if (themeData.background_image) {
          setBackgroundImage(themeData.background_image);
          setBackgroundPreview(themeData.background_image);
        }

        applyTheme(themeData.primary_color, themeData.background_image || '');
        setMessage('✅ Đã tải giao diện từ file!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Lỗi đọc file! Vui lòng kiểm tra định dạng JSON');
        setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  // 🌐 Chia sẻ theme
  const handleShareTheme = async () => {
    if (!themeName.trim()) {
      setMessage('❌ Vui lòng nhập tên theme!');
      return;
    }

    setIsSharing(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/theme/share`,
        {
          theme_name: themeName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ ' + res.data.message);
      setShowShareDialog(false);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('❌ Lỗi chia sẻ theme!');
      console.error(err);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="theme-customization-container">
      <div className="theme-content">
        <h1 className="theme-title page-title">Chỉnh Giao Diện</h1>

        {/* Preview Section */}
        <div className="theme-preview-section">
          <h2>Xem Trước</h2>
          <div className="preview-box" style={{
            backgroundColor: '#fafafa',
            backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="preview-overlay">
              <div className="preview-navbar" style={{ backgroundColor: primaryColor }}>
                <span style={{ color: '#fff' }}>🍳 CookShare</span>
              </div>
              <div className="preview-content" style={{ 
                color: '#333',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}>
                <h3 style={{ color: primaryColor }}>CookShare - Chia Sẻ Công Thức Nấu Ăn</h3>
                <p>Đây là giao diện của bạn</p>
                <button className="preview-btn" style={{ backgroundColor: primaryColor, color: '#fff' }}>
                  Nút mẫu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div className="theme-section">
          <h2>🎨 Màu</h2>
          <div className="color-picker-group">
            <input
              type="color"
              value={primaryColor}
              onChange={handleColorChange}
              className="color-picker"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={handleColorChange}
              className="color-input"
              placeholder="#ff7f50"
            />
            <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
          </div>
          <p className="help-text">Màu này sẽ áp dụng cho navbar, nút bấm, tiêu đề và các phần tử chính</p>
        </div>

        {/* Background Image */}
        <div className="theme-section">
          <h2>Background</h2>
          <div className="background-upload-group">
            {backgroundPreview && (
              <div className="background-preview">
                <img src={backgroundPreview} alt="Background preview" />
                <button onClick={handleRemoveBackground} className="btn-remove-bg">
                  ❌ 
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="file-input"
              id="bg-upload"
            />
            <label htmlFor="bg-upload" className="file-label">
              📁 Chọn ảnh nền
            </label>
            <p className="help-text">Ảnh nền sẽ hiển thị trên toàn bộ trang web</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="theme-actions">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-save" 
            style={{ backgroundColor: primaryColor }}
          >
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>
          <button onClick={handleReset} className="btn-reset">
            Mặc Định
          </button>
          <button onClick={handleExportTheme} className="btn-export">
            📤 Xuất
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTheme}
            className="file-input"
            id="theme-import"
            style={{ display: 'none' }}
          />
          <label htmlFor="theme-import" className="btn-import">
            📥 Nhập
          </label>
          <button onClick={() => setShowShareDialog(true)} className="btn-share">
            🌐 Share
          </button>
        </div>

        {/* Share Theme Dialog */}
        {showShareDialog && (
          <div className="modal-overlay" onClick={() => setShowShareDialog(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>🌐 Share</h2>
              <p>Nhập tên theme để chia sẻ cùng cộng đồng:</p>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="theme-name-input"
                placeholder="Ví dụ: Theme Nó Đỏ Cam"
              />
              <div className="modal-actions">
                <button 
                  onClick={handleShareTheme}
                  disabled={isSharing}
                  className="btn-confirm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSharing ? '⏳ Share...' : 'Share'}
                </button>
                <button 
                  onClick={() => setShowShareDialog(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="status-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeCustomization;
