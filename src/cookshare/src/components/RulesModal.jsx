import "./RulesModal.css";

const rulesData = [
  {
    title: "1. Quy tắc về nội dung bài viết",
    content: [
      "Chỉ đăng các công thức nấu ăn thực sự, có hướng dẫn rõ ràng.",
      "Không đăng nội dung vi phạm bản quyền.",
      "Không đăng nội dung không liên quan đến ẩm thực.",
      "Hình ảnh phải rõ ràng, không chứa nội dung nhạy cảm."
    ]
  },
  {
    title: "2. Quy tắc về bình luận",
    content: [
      "Bình luận phải lịch sự, tôn trọng người khác.",
      "Không spam, quảng cáo hoặc đăng link không liên quan.",
      "Không sử dụng ngôn ngữ thô tục, xúc phạm."
    ]
  },
  {
    title: "3. Quy tắc về tài khoản",
    content: [
      "Mỗi người chỉ được sở hữu một tài khoản.",
      "Không mạo danh người khác.",
      "Bảo mật thông tin đăng nhập."
    ]
  },
  {
    title: "4. Hình phạt vi phạm",
    content: [
      "Bài viết vi phạm 3 lần trong 7 ngày sẽ bị ẩn.",
      "Bài viết bị ẩn quá 30 ngày sẽ tự động bị xóa.",
      "Vi phạm nghiêm trọng có thể dẫn đến khóa tài khoản."
    ]
  }
];

function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rules-modal-header">
          <h2>📜 Quy Tắc Cộng Đồng</h2>
          <button className="rules-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="rules-modal-content">
          {rulesData.map((section, index) => (
            <div key={index} className="rules-modal-section">
              <h3>{section.title}</h3>
              <ul>
                {section.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rules-modal-footer">
            <p>
              Bằng việc sử dụng CookShare, bạn đồng ý tuân thủ tất cả các quy tắc trên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesModal;
