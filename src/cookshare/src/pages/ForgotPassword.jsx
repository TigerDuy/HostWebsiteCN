import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [tempToken, setTempToken] = useState("");

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/forgot-password`, {
        email,
      });

      setMessage(res.data.message);
      setStep(2); // Move to OTP step
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi email!");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp) {
      setError("Vui lòng nhập OTP!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/verify-otp`, {
        email,
        otp,
      });

      setMessage(res.data.message);
      setTempToken(res.data.tempToken);
      setStep(3); // Move to new password step
    } catch (err) {
      setError(err.response?.data?.message || "OTP không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không trùng khớp!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/auth/reset-password`, {
        email,
        newPassword,
        tempToken,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đặt lại mật khẩu!");
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
        <h2>Quên Mật Khẩu</h2>
        <p style={{ color: '#999', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
          Bước {step} trên 3
        </p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {step === 1 && (
          // Step 1: Email Input
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />

            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? "⏳ Đang gửi..." : "Gửi OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          // Step 2: OTP Input
          <form onSubmit={handleVerifyOTP}>
            <p style={{ color: '#666', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
              OTP đã được gửi đến <strong>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="Nhập mã OTP (6 chữ số)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="auth-input"
              maxLength="6"
            />

            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? "⏳ Đang xác nhận..." : "Xác Nhận OTP"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'transparent',
                color: '#ff7f50',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
                textDecoration: 'underline'
              }}
            >
              ← Quay lại
            </button>
          </form>
        )}

        {step === 3 && (
          // Step 3: New Password Input
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
            />

            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? "⏳ Đang cập nhật..." : "Đặt Lại Mật Khẩu"}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                background: 'transparent',
                color: '#ff7f50',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
                textDecoration: 'underline'
              }}
            >
              ← Quay lại
            </button>
          </form>
        )}

        <p className="auth-link">
          Nhớ mật khẩu? <a href="/login">Đăng nhập tại đây</a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
