import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    updateAuthStatus();

    const tryFetchProfileAvatar = async () => {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("userId");
      const savedAvatar = localStorage.getItem("avatar_url");
      if (token && uid && (!savedAvatar || savedAvatar === "")) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE || "http://localhost:3001"}/auth/profile/${uid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const ava = res.data.avatar_url || "";
          if (ava) {
            localStorage.setItem("avatar_url", ava);
            setAvatar(ava);
          }
        } catch (e) {}
      }
    };
    tryFetchProfileAvatar();

    const handleStorageChange = () => updateAuthStatus();
    const handleAuthUpdated = () => updateAuthStatus();
    const handleAvatarUpdated = () => updateAuthStatus();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-updated", handleAuthUpdated);
    window.addEventListener("avatar-updated", handleAvatarUpdated);

    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-updated", handleAuthUpdated);
      window.removeEventListener("avatar-updated", handleAvatarUpdated);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest(".dropdown")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

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
    window.dispatchEvent(new CustomEvent("auth-updated"));
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
        <img src="/logo.jpg" alt="CookShare" className="navbar-logo" />
        <div className="brand-text">
          <h2>CookShare</h2>
          <span className="brand-tagline">Chia sẻ công thức</span>
        </div>
      </Link>

      {/* Hamburger button */}
      <button
        className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {mobileMenuOpen && <div className="nav-overlay" onClick={closeMobileMenu}></div>}

      <ul className={mobileMenuOpen ? "nav-open" : ""}>
        {isLoggedIn ? (
          <>
            <li>
              <Link to="/" onClick={closeMobileMenu} className={isActive("/") ? "active" : ""}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/my-recipes" onClick={closeMobileMenu} className={isActive("/my-recipes") ? "active" : ""}>
                Công thức
              </Link>
            </li>
            <li>
              <Link to="/favorites" onClick={closeMobileMenu} className={isActive("/favorites") ? "active" : ""}>
                Đã lưu
              </Link>
            </li>
            <li>
              <Link to="/create" onClick={closeMobileMenu} className={isActive("/create") ? "active" : ""}>
                Tạo mới
              </Link>
            </li>
            {(role === "admin" || role === "moderator") && (
              <li>
                <Link to="/admin" onClick={closeMobileMenu} className={isActive("/admin") ? "active" : ""}>
                  Quản trị
                </Link>
              </li>
            )}
            <li className="dropdown">
              <button onClick={() => setShowDropdown(!showDropdown)} className="avatar-button">
                {avatar ? (
                  <img src={avatar} alt={username} className="navbar-avatar-icon" />
                ) : (
                  <span className="navbar-avatar-placeholder">
                    {(username || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="username-text">{username}</span>
                <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>▼</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link
                    to={`/user/${localStorage.getItem("userId") || ""}`}
                    className="dropdown-item-header"
                    onClick={() => { setShowDropdown(false); closeMobileMenu(); }}
                  >
                    <div className="dropdown-header-content">
                      {avatar && avatar !== "" && avatar !== "null" ? (
                        <img src={avatar} alt={username} className="dropdown-avatar" />
                      ) : (
                        <div className="dropdown-avatar-placeholder">
                          {(username || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="dropdown-username">{username}</p>
                        <p className="dropdown-hint">Xem trang cá nhân</p>
                      </div>
                    </div>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/notifications" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                    <span>🔔</span> Thông báo
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                    <span>⚙️</span> Cài đặt
                  </Link>
                  {(role === "admin" || role === "moderator") && (
                    <Link to="/admin/reports" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                      <span>⚠️</span> Báo cáo
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <Link to="/customize" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                    <span>🎨</span> Giao diện
                  </Link>
                  <Link to="/theme-marketplace" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                    <span>🌐</span> Theme
                  </Link>
                  <Link to="/rules" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                    <span>📜</span> Quy tắc
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { handleLogout(); setShowDropdown(false); closeMobileMenu(); }} className="dropdown-logout">
                    <span>🚪</span> Đăng xuất
                  </button>
                </div>
              )}
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={closeMobileMenu} className="nav-login">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={closeMobileMenu} className="nav-register">
                Đăng ký
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
