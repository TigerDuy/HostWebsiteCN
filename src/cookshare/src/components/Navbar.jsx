import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Hàm cập nhật trạng thái từ localStorage
  const updateAuthStatus = () => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");
    const savedAvatar = localStorage.getItem("avatar_url");

    if (token) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      setRole(savedRole);
      setAvatar(savedAvatar || "");
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
      setAvatar("");
    }
  };

  useEffect(() => {
    // Lần đầu load
    updateAuthStatus();

    // If user is logged in but avatar missing in localStorage, try to fetch profile as fallback
    const tryFetchProfileAvatar = async () => {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('userId');
      const savedAvatar = localStorage.getItem('avatar_url');
      if (token && uid && (!savedAvatar || savedAvatar === '')) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/profile/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
          const ava = res.data.avatar_url || '';
          if (ava) {
            localStorage.setItem('avatar_url', ava);
            setAvatar(ava);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    tryFetchProfileAvatar();

    // Lắng nghe sự thay đổi localStorage từ tab khác
    const handleStorageChange = () => {
      updateAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Lắng nghe event từ login/logout trong cùng tab (storage event không hoạt động trong cùng tab)
    const handleAuthUpdated = () => {
      updateAuthStatus();
    };
    window.addEventListener('auth-updated', handleAuthUpdated);
    
    // Lắng nghe sự kiện tùy chỉnh được dispatch sau khi upload avatar trong cùng tab
    const handleAvatarUpdated = () => {
      updateAuthStatus();
    };
    window.addEventListener('avatar-updated', handleAvatarUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('auth-updated', handleAuthUpdated);
      window.removeEventListener('avatar-updated', handleAvatarUpdated);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar_url");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    setAvatar("");
    
    // ✅ Trigger event để component khác update
    window.dispatchEvent(new CustomEvent("auth-updated"));
    
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.jpg" alt="CookShare Logo" className="navbar-logo" />
        <h2>CookShare</h2>
      </div>
      <ul>
        {/* ✅ Nút "Trang chủ" chỉ hiện khi đã đăng nhập */}
        {isLoggedIn && (
          <li><Link to="/">🏠 Trang chủ</Link></li>
        )}
        
        {isLoggedIn ? (
          <>
            <li><Link to="/my-recipes">📖 Công thức của tôi</Link></li>
            <li><Link to="/favorites">❤️ Công thức đã lưu</Link></li>
            <li><Link to="/create">➕ Tạo công thức</Link></li>
            {role === "admin" && (
              <li><Link to="/admin">⚙️ Trang quản trị</Link></li>
            )}
            {/* ✅ Dropdown menu */}
            <li className="dropdown">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="avatar-button"
              >
                {avatar ? (
                  <img src={avatar} alt={username} className="navbar-avatar-icon" />
                ) : (
                  <span className="navbar-avatar-placeholder">{(username || 'U').charAt(0).toUpperCase()}</span>
                )}
                <span>{username}</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link 
                    to={`/user/${localStorage.getItem('userId') || ''}`} 
                    className="dropdown-item-header"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="dropdown-header-content">
                      {avatar && avatar !== '' && avatar !== 'null' ? (
                        <img src={avatar} alt={username} className="dropdown-avatar" onError={(e) => {e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex';}} />
                      ) : null}
                      {!avatar || avatar === '' || avatar === 'null' ? (
                        <div className="dropdown-avatar-placeholder">{(username || 'U').charAt(0).toUpperCase()}</div>
                      ) : (
                        <div className="dropdown-avatar-placeholder" style={{display: 'none'}}>{(username || 'U').charAt(0).toUpperCase()}</div>
                      )}
                      <div>
                        <p className="dropdown-username">{username}</p>
                        <p className="dropdown-hint">Trang cá nhân của tôi</p>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    to="/customize" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    🎨 Tùy chỉnh giao diện
                  </Link>
                  <Link 
                    to="/theme-marketplace" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    🌐 Thị trường theme
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }} 
                    className="dropdown-logout"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">🔐 Đăng nhập</Link></li>
            <li><Link to="/register">✍️ Đăng ký</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
