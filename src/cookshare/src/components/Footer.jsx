import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-content">
          {/* Logo & About */}
          <div className="footer-brand">
            <div className="brand-logo">
              <img src="/logo.jpg" alt="CookShare" />
              <h2>CookShare</h2>
            </div>
            <p className="brand-tagline">
              Nơi kết nối những người yêu ẩm thực. Chia sẻ công thức, lan tỏa niềm vui nấu ăn! 🍳
            </p>
            <div className="social-links">
              <a href="https://github.com/TigerDuy" target="_blank" rel="noopener noreferrer" title="GitHub">
                <img src="/github.png" alt="GitHub" />
              </a>
              <a href="mailto:TigerDuy2000@gmail.com" title="Email">
                <span className="email-icon">✉️</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h3>Khám Phá</h3>
            <ul>
              <li><Link to="/">🏠 Trang Chủ</Link></li>
              <li><Link to="/search">🔍 Tìm Kiếm</Link></li>
              <li><Link to="/create">✏️ Đăng Công Thức</Link></li>
              <li><Link to="/my-recipes">📖 Công Thức Của Tôi</Link></li>
            </ul>
          </div>

          {/* More Links */}
          <div className="footer-links-group">
            <h3>Tài Khoản</h3>
            <ul>
              <li><Link to="/favorites">❤️ Yêu Thích</Link></li>
              <li><Link to="/notifications">🔔 Thông Báo</Link></li>
              <li><Link to="/settings">⚙️ Cài Đặt</Link></li>
              <li><Link to="/customize">🎨 Giao Diện</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links-group">
            <h3>Hỗ Trợ</h3>
            <ul>
              <li><Link to="/rules">📜 Quy Tắc Cộng Đồng</Link></li>
              <li><a href="mailto:TigerDuy2000@gmail.com">📧 Liên Hệ</a></li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-icon">👨‍🍳</span>
            <span className="stat-text">Cộng đồng đầu bếp</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <span className="stat-text">Công thức đa dạng</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💝</span>
            <span className="stat-text">Chia sẻ yêu thương</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 CookShare. Made with ❤️ by NguyenThanhDuy</p>
      </div>
    </footer>
  );
};

export default Footer;
