import { useState } from "react";
import "./Rules.css";

function Rules() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const rules = [
    {
      title: "1. Quy tắc về nội dung bài viết",
      content: [
        "Chỉ đăng các công thức nấu ăn thực sự, có hướng dẫn rõ ràng và đầy đủ.",
        "Không đăng nội dung vi phạm bản quyền, sao chép từ nguồn khác mà không ghi nguồn.",
        "Không đăng nội dung không liên quan đến ẩm thực (quảng cáo, spam, chính trị...).",
        "Hình ảnh phải rõ ràng, không chứa nội dung nhạy cảm hoặc không phù hợp.",
        "Tiêu đề bài viết phải mô tả đúng nội dung công thức."
      ]
    },
    {
      title: "2. Quy tắc về bình luận",
      content: [
        "Bình luận phải lịch sự, tôn trọng tác giả và các thành viên khác.",
        "Không spam, quảng cáo hoặc đăng link không liên quan.",
        "Không sử dụng ngôn ngữ thô tục, xúc phạm, phân biệt đối xử.",
        "Góp ý mang tính xây dựng, không chỉ trích cá nhân.",
        "Không tiết lộ thông tin cá nhân của người khác."
      ]
    },
    {
      title: "3. Quy tắc về tài khoản",
      content: [
        "Mỗi người chỉ được sở hữu một tài khoản.",
        "Không mạo danh người khác hoặc tổ chức.",
        "Bảo mật thông tin đăng nhập, không chia sẻ tài khoản.",
        "Avatar và thông tin cá nhân phải phù hợp, không chứa nội dung nhạy cảm.",
        "Không sử dụng tài khoản để quấy rối người dùng khác."
      ]
    },
    {
      title: "4. Quy tắc về báo cáo",
      content: [
        "Chỉ báo cáo khi có vi phạm thực sự, không lạm dụng tính năng báo cáo.",
        "Mô tả rõ ràng lý do báo cáo và cung cấp bằng chứng nếu có.",
        "Báo cáo sai sự thật nhiều lần sẽ bị khóa tính năng báo cáo.",
        "Mỗi loại báo cáo có giới hạn 3 lần, sẽ được hoàn lại khi báo cáo được xử lý."
      ]
    },
    {
      title: "5. Hình phạt vi phạm",
      content: [
        "Bài viết vi phạm 3 lần trong 7 ngày sẽ bị ẩn.",
        "Bài viết bị ẩn quá 30 ngày sẽ tự động bị xóa.",
        "Có 3 bài viết bị khóa trong tháng sẽ bị khóa tính năng đăng bài.",
        "Bình luận vi phạm sẽ bị xóa ngay lập tức.",
        "Vi phạm bình luận 3 lần trong tháng sẽ bị khóa tính năng bình luận 30 ngày.",
        "Báo cáo bị bác bỏ 3 lần trong tuần sẽ bị khóa tính năng báo cáo 30 ngày.",
        "Vi phạm nghiêm trọng có thể dẫn đến khóa tài khoản vĩnh viễn."
      ]
    },
    {
      title: "6. Quyền riêng tư và bảo mật",
      content: [
        "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn.",
        "Không chia sẻ thông tin người dùng cho bên thứ ba mà không có sự đồng ý.",
        "Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân.",
        "Mật khẩu được mã hóa và lưu trữ an toàn."
      ]
    },
    {
      title: "7. Liên hệ và hỗ trợ",
      content: [
        "Nếu có thắc mắc về quy tắc, vui lòng liên hệ quản trị viên.",
        "Phản hồi về quyết định xử lý vi phạm sẽ được xem xét trong vòng 7 ngày.",
        "Chúng tôi có quyền cập nhật quy tắc mà không cần thông báo trước.",
        "Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các quy tắc mới."
      ]
    }
  ];

  return (
    <div className="rules-container">
      <div className="rules-header">
        <h1>📜 Quy Tắc Cộng Đồng CookShare</h1>
        <p className="rules-intro">
          Chào mừng bạn đến với CookShare! Để duy trì một cộng đồng ẩm thực lành mạnh và thân thiện, 
          vui lòng đọc và tuân thủ các quy tắc sau đây.
        </p>
      </div>

      <div className="rules-list">
        {rules.map((rule, index) => (
          <div 
            key={index} 
            className={`rule-section ${expandedSection === index ? "expanded" : ""}`}
          >
            <div 
              className="rule-title"
              onClick={() => toggleSection(index)}
            >
              <span>{rule.title}</span>
              <span className="rule-toggle">
                {expandedSection === index ? "▲" : "▼"}
              </span>
            </div>
            <div className={`rule-content ${expandedSection === index ? "show" : ""}`}>
              <ul>
                {rule.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="rules-footer">
        <p>
          <strong>Lưu ý:</strong> Bằng việc sử dụng CookShare, bạn đồng ý tuân thủ tất cả các quy tắc trên. 
          Vi phạm quy tắc có thể dẫn đến các hình phạt từ cảnh báo đến khóa tài khoản vĩnh viễn.
        </p>
        <p className="last-updated">Cập nhật lần cuối: Tháng 12, 2024</p>
      </div>
    </div>
  );
}

export default Rules;
