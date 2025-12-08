import { useState, useEffect } from 'react';
import './ThemeCustomization.css';

function ThemeCustomization() {
  const [primaryColor, setPrimaryColor] = useState('#ff7f50');
  const [theme, setTheme] = useState('light');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');

  useEffect(() => {
    // Load saved settings
    const savedColor = localStorage.getItem('primaryColor') || '#ff7f50';
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedBg = localStorage.getItem('backgroundImage') || '';
    
    setPrimaryColor(savedColor);
    setTheme(savedTheme);
    setBackgroundImage(savedBg);
    setBackgroundPreview(savedBg);
    
    applyTheme(savedColor, savedTheme, savedBg);
  }, []);

  const applyTheme = (color, mode, bgImage) => {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--secondary-color', adjustColor(color, -20));
    
    if (mode === 'dark') {
      document.documentElement.style.setProperty('--bg-light', '#1a1a1a');
      document.documentElement.style.setProperty('--text-dark', '#ffffff');
      document.documentElement.style.setProperty('--text-light', '#cccccc');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.style.setProperty('--bg-light', '#fafafa');
      document.documentElement.style.setProperty('--text-dark', '#333333');
      document.documentElement.style.setProperty('--text-light', '#666666');
      document.body.classList.remove('dark-mode');
    }
    
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
    applyTheme(newColor, theme, backgroundImage);
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    applyTheme(primaryColor, newTheme, backgroundImage);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setBackgroundImage(dataUrl);
        setBackgroundPreview(dataUrl);
        applyTheme(primaryColor, theme, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundImage('');
    setBackgroundPreview('');
    applyTheme(primaryColor, theme, '');
  };

  const handleSave = () => {
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('theme', theme);
    localStorage.setItem('backgroundImage', backgroundImage);
    alert('✅ Đã lưu cài đặt giao diện!');
  };

  const handleReset = () => {
    const defaultColor = '#ff7f50';
    const defaultTheme = 'light';
    const defaultBg = '';
    
    setPrimaryColor(defaultColor);
    setTheme(defaultTheme);
    setBackgroundImage(defaultBg);
    setBackgroundPreview(defaultBg);
    
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('theme');
    localStorage.removeItem('backgroundImage');
    
    applyTheme(defaultColor, defaultTheme, defaultBg);
    alert('✅ Đã khôi phục cài đặt mặc định!');
  };

  return (
    <div className="theme-customization-container">
      <div className="theme-content">
        <h1 className="theme-title">🎨 Tùy Chỉnh Giao Diện</h1>

        {/* Preview Section */}
        <div className="theme-preview-section">
          <h2>👁️ Xem Trước</h2>
          <div className="preview-box" style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fafafa',
            backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="preview-overlay">
              <div className="preview-navbar" style={{ backgroundColor: primaryColor }}>
                <span style={{ color: '#fff' }}>🍳 CookShare</span>
              </div>
              <div className="preview-content" style={{ 
                color: theme === 'dark' ? '#fff' : '#333',
                backgroundColor: theme === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)'
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
          <h2>🎨 Màu Chủ Đạo</h2>
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

        {/* Theme Mode */}
        <div className="theme-section">
          <h2>🌓 Chế Độ Giao Diện</h2>
          <div className="theme-mode-group">
            <label className={`theme-mode-option ${theme === 'light' ? 'active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={handleThemeChange}
              />
              <span>☀️ Sáng</span>
            </label>
            <label className={`theme-mode-option ${theme === 'dark' ? 'active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
              />
              <span>🌙 Tối</span>
            </label>
          </div>
        </div>

        {/* Background Image */}
        <div className="theme-section">
          <h2>🖼️ Ảnh Nền</h2>
          <div className="background-upload-group">
            {backgroundPreview && (
              <div className="background-preview">
                <img src={backgroundPreview} alt="Background preview" />
                <button onClick={handleRemoveBackground} className="btn-remove-bg">
                  ❌ Xóa ảnh nền
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
          <button onClick={handleSave} className="btn-save" style={{ backgroundColor: primaryColor }}>
            💾 Lưu Cài Đặt
          </button>
          <button onClick={handleReset} className="btn-reset">
            🔄 Khôi Phục Mặc Định
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeCustomization;
