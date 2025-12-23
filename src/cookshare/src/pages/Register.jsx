import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RulesModal from "../components/RulesModal";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeRules, setAgreeRules] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Client-side validation
    if (!username || !email || !password || !confirmPassword) {
      setError("❌ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (username.length < 3) {
      setError("❌ Tên đăng nhập phải có ít nhất 3 ký tự!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("❌ Email không hợp lệ!");
      return;
    }

    if (password.length < 6) {
      setError("❌ Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Mật khẩu không trùng khớp!");
      return;
    }

    if (!agreeRules) {
      setError("❌ Bạn phải đồng ý với quy tắc cộng đồng để đăng ký!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/register`, {
        username,
        email,
        password,
        confirmPassword,
      });

      alert("✅ " + res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Lỗi đăng ký!");
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
        <h2>Đăng Ký</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="auth-input"
        />

        {/* Checkbox đồng ý quy tắc */}
        <div className="rules-agreement">
          <label className="rules-checkbox-label">
            <input
              type="checkbox"
              checked={agreeRules}
              onChange={(e) => setAgreeRules(e.target.checked)}
              className="rules-checkbox"
            />
            <span>
              Tôi đồng ý với{" "}
              <span 
                className="rules-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRulesModal(true);
                }}
              >
                Quy tắc cộng đồng
              </span>
            </span>
          </label>
        </div>

        <button 
          onClick={handleRegister}
          disabled={loading || !agreeRules}
          className="auth-button"
          style={{ opacity: !agreeRules ? 0.6 : 1 }}
        >
          {loading ? "⏳ Đang đăng ký..." : "Đăng Ký"}
        </button>

        <p className="auth-link">
          Đã có tài khoản? <a href="/login">Đăng nhập tại đây</a>
        </p>
      </div>

      {/* Modal hiển thị quy tắc */}
      <RulesModal 
        isOpen={showRulesModal} 
        onClose={() => setShowRulesModal(false)} 
      />
    </div>
  );
}

export default Register;
