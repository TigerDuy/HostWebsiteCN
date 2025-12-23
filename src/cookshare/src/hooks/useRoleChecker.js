import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

/**
 * Hook kiểm tra role định kỳ
 * Tự động logout nếu role bị thay đổi bởi admin
 */
export function useRoleChecker(intervalMs = 30000) {
  const navigate = useNavigate();
  const isCheckingRef = useRef(false);

  const forceLogout = useCallback((message) => {
    // Xóa tất cả thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar_url");
    
    // Dispatch event để Navbar cập nhật
    window.dispatchEvent(new CustomEvent("auth-updated"));
    
    // Hiển thị thông báo
    alert(message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    
    // Chuyển về trang login
    navigate("/login", { replace: true });
  }, [navigate]);

  const checkRole = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    // Không kiểm tra nếu chưa đăng nhập
    if (!token) return;
    
    // Tránh gọi API trùng lặp
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const res = await axios.get("/auth/check-role", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Nếu role hợp lệ, cập nhật localStorage nếu cần
      if (res.data.valid && res.data.role) {
        const storedRole = localStorage.getItem("role");
        if (storedRole !== res.data.role) {
          localStorage.setItem("role", res.data.role);
          window.dispatchEvent(new CustomEvent("auth-updated"));
        }
      }
    } catch (err) {
      // Nếu server trả về forceLogout = true
      if (err.response?.data?.forceLogout) {
        forceLogout(err.response.data.message);
      } else if (err.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        forceLogout("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      }
      // Các lỗi khác (network error) thì bỏ qua
    } finally {
      isCheckingRef.current = false;
    }
  }, [forceLogout]);

  useEffect(() => {
    // Kiểm tra ngay khi mount
    checkRole();

    // Kiểm tra định kỳ
    const interval = setInterval(checkRole, intervalMs);

    // Kiểm tra khi tab được focus lại
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkRole();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Kiểm tra khi window được focus
    const handleFocus = () => {
      checkRole();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkRole, intervalMs]);

  return { checkRole, forceLogout };
}

export default useRoleChecker;
