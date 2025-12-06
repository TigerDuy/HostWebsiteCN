import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ Validate
      if (!email || !password) {
        setError("Email và mật khẩu không được để trống!");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("avatar_url", res.data.avatar_url || "");

      alert("✅ Đăng nhập thành công!");
      
      // ✅ Trigger custom event để Navbar update ngay lập tức
      window.dispatchEvent(new CustomEvent("auth-updated"));
      
      // Small delay để đảm bảo Navbar đã update state trước khi navigate
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 50);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="logo-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.jpg" alt="Chef Logo" style={{ width: '120px', height: '120px' }} />
        </div>
        <h2>Đăng Nhập</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          placeholder="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="🔑 Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="auth-button"
        >
          {loading ? "⏳ Đang đăng nhập..." : "🚀 Đăng Nhập"}
        </button>

        <p className="auth-link" style={{ textAlign: 'center', marginTop: '10px' }}>
          <a href="/forgot-password" style={{ color: '#ff7f50', textDecoration: 'none' }}>Quên mật khẩu?</a>
        </p>

        <p className="auth-link">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
