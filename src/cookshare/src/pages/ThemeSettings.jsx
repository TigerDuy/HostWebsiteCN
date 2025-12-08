import { useEffect, useState } from 'react';
import './ThemeSettings.css';

function ThemeSettings() {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#ff7f50');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [previewBg, setPreviewBg] = useState(null);

  useEffect(() => {
    // Load saved theme settings
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('primaryColor') || '#ff7f50';
    const savedBg = localStorage.getItem('backgroundImage') || '';
    
    setTheme(savedTheme);
    setPrimaryColor(savedColor);
    setBackgroundImage(savedBg);
    
    applyTheme(savedTheme, savedColor, savedBg);
  }, []);

  const applyTheme = (themeMode, color, bgImage) => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.style.setProperty('--primary-color', color);
    
    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, primaryColor, backgroundImage);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
    localStorage.setItem('primaryColor', newColor);
    applyTheme(theme, newColor, backgroundImage);
  };

  const handleBgImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setBackgroundImage(base64);
        setPreviewBg(base64);
        localStorage.setItem('backgroundImage', base64);
        applyTheme(theme, primaryColor, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = () => {
    setBackgroundImage('');
    setPreviewBg(null);
    localStorage.removeItem('backgroundImage');
    applyTheme(theme, primaryColor, '');
  };

  const resetToDefault = () => {
    const defaultTheme = 'light';
    const defaultColor = '#ff7f50';
    
    setTheme(defaultTheme);
    setPrimaryColor(defaultColor);
    setBackgroundImage('');
    setPreviewBg(null);
    
    localStorage.setItem('theme', defaultTheme);
    localStorage.setItem('primaryColor', defaultColor);
    localStorage.removeItem('backgroundImage');
    
    applyTheme(defaultTheme, defaultColor, '');
  };

  return (
    <div className="theme-settings-container">
      <div className="theme-settings-content">
        <h1>🎨 Tùy Chỉnh Giao Diện</h1>

        {/* Theme Mode */}
        <div className="settings-section">
          <h2>Chế Độ Hiển Thị</h2>
          <div className="theme-mode-options">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Sáng
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Tối
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="settings-section">
          <h2>Màu Chủ Đạo</h2>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={primaryColor}
              onChange={handleColorChange}
              className="color-picker"
            />
            <span className="color-value">{primaryColor}</span>
          </div>
          <div className="color-presets">
            <button className="preset-btn" style={{background: '#ff7f50'}} onClick={() => {setPrimaryColor('#ff7f50'); handleColorChange({target:{value:'#ff7f50'}})}}></button>
            <button className="preset-btn" style={{background: '#ff6347'}} onClick={() => {setPrimaryColor('#ff6347'); handleColorChange({target:{value:'#ff6347'}})}}></button>
            <button className="preset-btn" style={{background: '#4CAF50'}} onClick={() => {setPrimaryColor('#4CAF50'); handleColorChange({target:{value:'#4CAF50'}})}}></button>
            <button className="preset-btn" style={{background: '#2196F3'}} onClick={() => {setPrimaryColor('#2196F3'); handleColorChange({target:{value:'#2196F3'}})}}></button>
            <button className="preset-btn" style={{background: '#9C27B0'}} onClick={() => {setPrimaryColor('#9C27B0'); handleColorChange({target:{value:'#9C27B0'}})}}></button>
            <button className="preset-btn" style={{background: '#FF9800'}} onClick={() => {setPrimaryColor('#FF9800'); handleColorChange({target:{value:'#FF9800'}})}}></button>
          </div>
        </div>

        {/* Background Image */}
        <div className="settings-section">
          <h2>Ảnh Nền</h2>
          <div className="bg-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleBgImageSelect}
              className="file-input"
              id="bg-upload"
            />
            <label htmlFor="bg-upload" className="upload-btn">
              📷 Chọn Ảnh Nền
            </label>
            {(backgroundImage || previewBg) && (
              <button onClick={handleRemoveBg} className="remove-bg-btn">
                🗑️ Xóa Ảnh Nền
              </button>
            )}
          </div>
          {(backgroundImage || previewBg) && (
            <div className="bg-preview">
              <img src={backgroundImage || previewBg} alt="Background preview" />
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="settings-section">
          <button onClick={resetToDefault} className="reset-btn">
            🔄 Đặt Lại Mặc Định
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeSettings;
