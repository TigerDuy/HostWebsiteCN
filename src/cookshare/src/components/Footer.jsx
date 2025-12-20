import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-decoration">
        <div className="food-icons">
          <span>CookShare - Chia Sẻ Công Thức Nấu Ăn</span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Về CookShare</h3>
          <p>
            Sứ mệnh của CookShare là <strong>làm cho việc vào bếp vui hơn mỗi ngày</strong>, 
            vì chúng tôi tin rằng nấu nướng là chìa khoá cho một cuộc sống hạnh phúc hơn 
            và khoẻ mạnh hơn cho con người, cộng đồng, và hành tinh này. Chúng tôi muốn 
            hỗ trợ các đầu bếp gia đình trên toàn thế giới để họ có thể <strong>giúp đỡ nhau</strong> qua 
            việc chia sẻ các món ngon và kinh nghiệm nấu ăn của mình.
          </p>
        </div>

        <div className="footer-section links">
          <h3>Tìm Hiểu Thêm</h3>
          <div className="footer-links">
            <Link to="/">Trang Chủ</Link>
            <Link to="/search">Tìm Kiếm</Link>
            <Link to="/create">Đăng Công Thức</Link>
            <Link to="/my-recipes">Công Thức Của Tôi</Link>
            <Link to="/favorites">Yêu Thích</Link>
            <Link to="/profile">Hồ Sơ</Link>
          </div>
        </div>

        <div className="footer-section contact">
          <h3>Liên Hệ</h3>
          <div className="contact-info">
            <p>📧 TigerDuy2000@gmail.com</p>
            <p>📱 Theo dõi chúng tôi</p>
            <div className="social-links">
              <a href="https://github.com/TigerDuy" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <img src="/github.png" alt="github" style={{ width: '24px', height: '24px' }} /> GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Bản quyền của © CookShare. All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
