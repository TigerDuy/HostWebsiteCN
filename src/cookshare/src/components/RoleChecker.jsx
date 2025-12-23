import { useRoleChecker } from "../hooks/useRoleChecker";

/**
 * Component kiểm tra role định kỳ
 * Đặt trong BrowserRouter để có thể sử dụng useNavigate
 */
function RoleChecker() {
  // Kiểm tra mỗi 30 giây
  useRoleChecker(30000);
  
  // Component này không render gì
  return null;
}

export default RoleChecker;
