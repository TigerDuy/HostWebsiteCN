-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 27, 2025 lúc 02:47 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `cookingdb`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_hidden_recipes`
--

CREATE TABLE `admin_hidden_recipes` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `hidden_by` int(11) NOT NULL COMMENT 'ID của admin/moderator thực hiện ẩn',
  `reason` text NOT NULL COMMENT 'Lý do ẩn bài viết',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'TRUE = đang ẩn, FALSE = đã bỏ ẩn',
  `unhidden_by` int(11) DEFAULT NULL COMMENT 'ID của admin/moderator bỏ ẩn',
  `unhidden_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `admin_hidden_recipes`
--

INSERT INTO `admin_hidden_recipes` (`id`, `recipe_id`, `hidden_by`, `reason`, `is_active`, `unhidden_by`, `unhidden_at`, `created_at`) VALUES
(1, 25, 2, 'Test\n', 0, 1, '2025-12-23 18:16:27', '2025-12-18 07:28:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bao_cao`
--

CREATE TABLE `bao_cao` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `rejected_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `report_type` enum('user_report','admin_hide') DEFAULT 'user_report',
  `image_url` varchar(500) DEFAULT NULL,
  `target_type` enum('recipe','comment','user') DEFAULT 'recipe',
  `comment_id` int(11) DEFAULT NULL,
  `reported_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bao_cao`
--

INSERT INTO `bao_cao` (`id`, `recipe_id`, `user_id`, `reason`, `status`, `rejected_reason`, `created_at`, `updated_at`, `processed_by`, `processed_at`, `report_type`, `image_url`, `target_type`, `comment_id`, `reported_user_id`) VALUES
(1, 8, 1, 'spam', 'rejected', 'test', '2025-12-13 10:01:01', '2025-12-13 10:41:12', 1, '2025-12-13 10:02:33', 'user_report', NULL, 'recipe', NULL, NULL),
(2, 11, 1, 'test\n', 'accepted', NULL, '2025-12-13 10:02:57', '2025-12-13 10:41:12', 1, '2025-12-13 10:03:17', 'user_report', NULL, 'recipe', NULL, NULL),
(3, 19, 1, 'test\n', 'pending', NULL, '2025-12-13 10:24:03', '2025-12-13 10:24:03', NULL, NULL, 'user_report', NULL, 'recipe', NULL, NULL),
(4, 33, 5, 'test\n', 'pending', NULL, '2025-12-13 14:07:41', '2025-12-13 14:07:41', NULL, NULL, 'user_report', NULL, 'recipe', NULL, NULL),
(5, 14, 1, 'spam', 'pending', NULL, '2025-12-14 09:06:48', '2025-12-14 09:06:48', NULL, NULL, 'user_report', NULL, 'recipe', NULL, NULL),
(6, 11, 5, 'test', 'pending', NULL, '2025-12-14 11:01:05', '2025-12-14 11:01:05', NULL, NULL, 'user_report', NULL, 'recipe', NULL, NULL),
(7, 37, 1, 'Test chức năng ẩn bài viết', 'accepted', NULL, '2025-12-15 11:10:54', '2025-12-15 11:11:09', 1, '2025-12-15 11:11:09', 'user_report', NULL, 'recipe', NULL, NULL),
(8, 37, 3, 'Test chức năng ẩn bài viết', 'accepted', NULL, '2025-12-15 11:11:43', '2025-12-15 11:11:50', 3, '2025-12-15 11:11:50', 'user_report', NULL, 'recipe', NULL, NULL),
(9, 37, 5, 'Test chức năng ẩn bài viết', 'accepted', NULL, '2025-12-15 11:12:14', '2025-12-15 11:12:28', 2, '2025-12-15 11:12:28', 'user_report', NULL, 'recipe', NULL, NULL),
(10, 37, 6, 'test\n', 'accepted', NULL, '2025-12-15 11:17:10', '2025-12-15 11:17:22', 2, '2025-12-15 11:17:22', 'user_report', NULL, 'recipe', NULL, NULL),
(11, 37, 4, 'test\n', 'accepted', NULL, '2025-12-15 11:25:20', '2025-12-15 11:25:24', 2, '2025-12-15 11:25:24', 'user_report', NULL, 'recipe', NULL, NULL),
(12, 8, 2, 'test báo cáo bình luận', 'pending', NULL, '2025-12-27 07:38:09', '2025-12-27 07:38:09', NULL, NULL, 'user_report', '/uploads/reports/report-1766821089748-2841550.jpg', 'comment', 2, NULL),
(16, NULL, 1, 'test', 'rejected', 'a\n', '2025-12-27 07:57:59', '2025-12-27 08:26:08', 2, '2025-12-27 08:26:08', 'user_report', '/uploads/reports/report-1766822279106-226327123.jpg', 'user', NULL, 4),
(19, NULL, 2, 'test\r\n', 'rejected', 'ok', '2025-12-27 08:15:07', '2025-12-27 08:18:33', 2, '2025-12-27 08:18:33', 'user_report', NULL, 'user', NULL, 4),
(23, NULL, 2, 'aaaaaaaaaaaaaa', 'rejected', 'a', '2025-12-27 08:18:41', '2025-12-27 08:23:19', 2, '2025-12-27 08:23:19', 'user_report', NULL, 'user', NULL, 4),
(25, 8, 2, 'aaaaaaaaaa', 'pending', NULL, '2025-12-27 08:21:36', '2025-12-27 08:21:36', NULL, NULL, 'user_report', NULL, 'comment', 1, NULL),
(26, NULL, 2, 'aaaaaaaaaa', 'rejected', 'ok', '2025-12-27 08:21:56', '2025-12-27 08:23:10', 2, '2025-12-27 08:23:10', 'user_report', NULL, 'user', NULL, 5),
(27, NULL, 2, 'aaaaaaaaaaaaaaa', 'rejected', 'a', '2025-12-27 08:22:14', '2025-12-27 08:25:53', 2, '2025-12-27 08:25:53', 'user_report', NULL, 'user', NULL, 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `binh_luan`
--

CREATE TABLE `binh_luan` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `parent_comment_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `binh_luan`
--

INSERT INTO `binh_luan` (`id`, `recipe_id`, `user_id`, `comment`, `parent_id`, `created_at`, `parent_comment_id`) VALUES
(1, 8, 1, 'Nhìn ngon thế\n', NULL, '2025-12-06 18:29:12', NULL),
(2, 8, 4, 'để nấu thử xem sao\n', NULL, '2025-12-06 18:57:54', NULL),
(3, 8, 6, 'được á\n', 2, '2025-12-06 19:24:03', NULL),
(4, 8, 2, 'UKm', NULL, '2025-12-13 15:23:01', 1),
(5, 31, 3, 'Ăn được không', NULL, '2025-12-23 13:07:39', NULL),
(6, 31, 1, 'Sao lại không nhỉ', NULL, '2025-12-23 18:40:25', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `broadcast_notifications`
--

CREATE TABLE `broadcast_notifications` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `broadcast_notifications`
--

INSERT INTO `broadcast_notifications` (`id`, `sender_id`, `message`, `image_url`, `created_at`) VALUES
(1, 2, 'Sáng mai Update', '/uploads/notifications/notif-1766819974598-123612390.jpg', '2025-12-27 07:19:34');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `comment_likes`
--

INSERT INTO `comment_likes` (`id`, `comment_id`, `user_id`, `created_at`) VALUES
(4, 3, 4, '2025-12-06 19:26:47'),
(6, 1, 5, '2025-12-06 19:38:39'),
(10, 1, 6, '2025-12-06 21:25:19'),
(15, 2, 6, '2025-12-08 06:04:09'),
(17, 1, 2, '2025-12-13 15:30:05'),
(18, 5, 3, '2025-12-23 13:07:43');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comment_violation_history`
--

CREATE TABLE `comment_violation_history` (
  `id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `violated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cong_thuc`
--

CREATE TABLE `cong_thuc` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `ingredients` longtext NOT NULL,
  `steps` longtext NOT NULL,
  `cook_time` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `servings` varchar(100) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `views` int(11) DEFAULT 0,
  `violation_count` int(11) DEFAULT 0,
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` datetime DEFAULT NULL,
  `category` enum('main','appetizer','dessert','drink','soup','salad','snack','other') DEFAULT 'other',
  `cuisine` enum('vietnam','korea','japan','china','thailand','italy','france','usa','other') DEFAULT 'other'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cong_thuc`
--

INSERT INTO `cong_thuc` (`id`, `user_id`, `title`, `ingredients`, `steps`, `cook_time`, `image_url`, `servings`, `created_at`, `views`, `violation_count`, `is_hidden`, `hidden_at`, `category`, `cuisine`) VALUES
(6, 3, ' Cơm cà ri gà', '1/2 con gà\r\n1 gói cà ri bột\r\n1 gói cà ri dầu\r\n3 bịch sữa tươi có đường\r\n1 củ khoai lang\r\n1 củ hành tây\r\n2 cây sả\r\n2 mc hành tím băm\r\n2 cây hành lá\r\nGia vị', 'Gà bóp muối rửa sạch, chặt nhỏ, ướp với muối đường, 1mc hành tím băm, gói bột cà ri và cà ri dầu, trộn đều để 60 phút cho thấm. Sau đó phi thơm hành tím băm, sả bóc vỏ cắt khúc đập dập, cho vào xào cùng, tiếp đến cho gà vào đảo săn thì cho sữa tươi vào\r\n||STEP||\r\nKhi sôi thì đậy nắp để nhỏ lửa cho gà thấm vị. Khoai lang gọt vỏ, cắt vừa ăn. Hành tây cắt múi cau\r\n||STEP||\r\nCho khoai vào nồi, khoai mềm cho hành tây vào, nêm lại cho vừa vị rồi đảo đều cho hành tây thấm\r\n||STEP||\r\nMúc cơm nóng ra dĩa, thêm cà ri xung quanh, thêm ít hành lá trắng trí\r\n||STEP||\r\nCó thể múc riêng chấm bánh mì\r\n||STEP||\r\nHoặc dùng với cơm nóng đều ngon', '90 phút', 'http://localhost:3001/uploads/e683cbf8370083845da705f16fb04f92.webp', '3', '2025-11-28 02:34:15', 48, 0, 0, NULL, 'main', 'vietnam'),
(7, 3, 'Lẩu Thái Hải Sản', '1 kg tôm\r\n1 kg nghêu\r\n500 g mực\r\n500 g bò\r\n200 g nấm đông cô\r\n1 bịch nấm kim châm\r\n1 bịch nấm linh chi nâu\r\n1 bó cải dún\r\n1 bó cải thìa\r\nSốt tomyum\r\nGia vị', 'Tôm bỏ chỉ lưng và phần dơ trên đầu, rửa sạch. Mực rửa sạch, cắt vẩy rồng. Nghêu ngâm nước vo gạo cho sạch cát. Cải dún và cải thìa bỏ gốc, rửa sạch, cắt khúc vừa ăn. Nấm các loại bỏ gốc, rửa sạch\r\n||STEP||\r\nĐặt nồi nước lên bếp, cho gia vị tomyum vào nấu sôi, nêm lại cho vừa vị. Xếp các loại tôm mực bò nghêu ra dĩa, xếp thêm các loại nấm và rau\r\n||STEP||\r\nDọn tất cả lên bàn, nhúng các loại topping, rau nấm tùy ý và thưởng thức', '60', 'http://localhost:3001/uploads/48e3d3ead5a3169e81053bfca48a9433.webp', '5', '2025-11-28 02:34:15', 26, 0, 0, NULL, 'main', 'vietnam'),
(8, 3, 'Bò Lúc Lắc ', 'Mình lười ghi nguyên liệu quá. Mọi người cứ đọc cách làm rồi tới loai nào không có thì ghi ra ngoài dù gì cũng phải đi mua ☺️\r\nthịt bò\r\nrau củ quả\r\ntỏi\r\nnước tương', 'Ướp thịt\r\nThịt bò sơ chế sạch sẽ cắt vuông để ráo + muối + hạt nêm + nước tương vừa ăn để 30 phút.\r\n||STEP||\r\nSơ chế rau củ quả\r\nChọn rau củ quả bạn muốn ăn kèm rửa sạch cắt vuông để ráo và xào sơ cùng ít muối đổ ra dĩa\r\n||STEP||\r\nXào thịt\r\nPhi tỏi thơm đổ thịt vào xào theo độ chín mình muốn và đổ rau củ quả vào xào tầm 3p.\r\nĐổ ra dĩa rắc tiêu, ngò thơm\r\n||STEP||\r\nGia vị mình chỉ nói sơ thứ tự nêm nếm. Còn định lượng thì mọi người tự điều chỉnh theo khẩu vị của mình nhé.\r\nChúc mọi người ăn ngon miệng', '30 phút', 'http://localhost:3001/uploads/21c1c138e4921054d765f91610329f21.webp', '2', '2025-11-28 02:34:15', 91, 0, 0, NULL, 'main', 'vietnam'),
(9, 3, 'Canh Chua Cá Hú', '3 khứa (300g) Cá hú\r\n5 trái Đậu bắp\r\n2 trái Cà chua\r\n1 cây Bạc hà (dọc mùng)\r\n1/4 trái Thơm (dứa)\r\n20 g Me chua\r\n1 trái Ớt\r\n2 nhánh Rau ngò om, ngổ\r\n1 muỗng canh Nước mắm\r\n2 muỗng cà phê Đường\r\n1/2 muỗng cà phê Muối\r\n1 lít Nước', 'Cá hú rửa sạch với nước pha dấm, cắt khúc vừa ăn.\r\n||STEP||\r\nĐậu bắp, bạc hà, cà chua, thơm cắt miếng vừa. Thơm xào với 1 tsp đường.\r\n||STEP||\r\nNấu sôi nước, cho me vào dầm lấy nước cốt, bỏ xác. Cho thơm vào nấu sôi.\r\n||STEP||\r\nCho cá hú vào nồi nước me, nêm muối, nước mắm, đường.\r\n||STEP||\r\nKhi cá gần chín, cho cà chua, đậu bắp, bạc hà vào.\r\n||STEP||\r\nNấu thêm 3 phút, nêm lại vừa ăn, cho hành lá, ngò om, ngổ, ớt cắt lát vào rồi tắt bếp.', '20 phút', 'http://localhost:3001/uploads/2d42b5cd4365f2d259bb23b728221edf.webp', '2 ', '2025-11-28 02:34:15', 42, 0, 0, NULL, 'soup', 'vietnam'),
(10, 3, 'Bánh Xèo Miền Tây', '200 g bột bánh xèo pha sẵn\r\n1 muỗng bột nghệ\r\nHành lá\r\n150 ml nước lọc\r\n100 ml nước cốt dừa\r\nNước cốt dừa — chọn loại tươi ngon để giữ vị ngọt tự nhiên\r\n200 ml soda có ga(để giòn bánh)\r\nTôm\r\nThịt\r\nGiá\r\nCà rốt\r\nĐu đủ', 'Sơ chế nguyên liệu\r\nThịt ba chỉ rửa sạch, cắt lát mỏng theo chiều ngang, hoặc băm thịt(tuỳ khẩu vị ăn từng người)\r\nTôm cắt đầu, rửa sạch.\r\n\r\nĐu đủ gọt vỏ, rửa sạch, thái sợi to.\r\n\r\nCà rốt và củ cải gọt vỏ thái sợi mỏng.\r\n\r\nTrộn đều đu đủ, cà rốt cắt sợi với 2 muỗng canh đường, 5ml nước cốt chanh, để sẵn.\r\n||STEP||\r\nTrộn bột bánh\r\nCho vào tô lớn các nguyên liệu gồm: 100ml nước cốt dừa, 150ml nước lọc, 200ml nước soda, 1 muỗng cà phê bột nghệ, 200g bột bánh xèo pha sẵn, 2 muỗng canh hành lá cắt nhỏ. Trộn cho tan bột và các nguyên liệu hòa quyện vào nhau thật đều.\r\n\r\nĐể bột nở ra hết, bạn để yên tô bột cho bột nghỉ 30 phút.\r\n||STEP||\r\nXào thịt và tôm\r\n\r\nThịt băm + tôm cho vào chảo cùng 1 muỗng cà phê hạt nêm, đặt chảo lên bếp xào cho thịt chín hơi săn lại thịt tắt bếp.\r\n||STEP||\r\nĐổ bánh xèo miền Tây\r\nĐặt chảo chống dính lên bếp, bật lửa lớn để chảo thật nóng, dùng cọ quét mỡ heo đều khắp lòng chảo.\r\n\r\nĐổ 1 vá bột đổ xung quanh thành chảo, lắc chảo cho bột chảy vào trong lòng chảo, nếu bột không phủ đều hết lòng chảo bạn múc thêm một ít bột phủ vô chỗ trống. Tiếp theo, cho tôm+ thịt+ giá đậy nắp chảo khoảng 2 phút cho bột chín. Sau 2 phút bạn mở nắp chảo, gấp bánh xèo lại, trở qua lại chiên cho bánh thật giòn rồi gắp ra đĩa.\r\n||STEP||\r\nLàm nước mắm chấm\r\nCho vào tô 75gr đường cát, 60ml nước mắm, 200ml nước âm ấm, 4 tép tỏi băm, 2 trái ớt băm, nước cốt 1/2 trái chanh nhỏ, khuấy cho thật đều.\r\n\r\nTiếp theo bạn cho cà rốt và củ cải ngâm chanh đường ở bước 2 vào, trộn đều là hoàn tất.\r\n||STEP||\r\nThành phẩm\r\nBánh xèo miền Tây giòn rụm, thơm nhân tôm thịt, giòn giòn giá đậu. Cuốn bánh xèo cùng rau xà lách, cải xanh, rau thơm, chấm mắm chua ngọt ăn no mà không ngán.', '1 tiếng', 'http://localhost:3001/uploads/4136e6a5c48ed34ffffc9ccdb819b9cb.webp', '4', '2025-11-28 02:34:15', 28, 0, 0, NULL, 'main', 'vietnam'),
(11, 4, 'Mì Xào Hải Sản', '100 g mì trứng hoặc 2 gói mì gói\r\n300 g hải sản đông lạnh (tôm, mực, vẹm,..)\r\n1/2 cây boaro\r\nRau cải tùy thích (mình sd cải Kale)\r\nHành tây, tỏi, ớt hiểm. Gia vị nêm. Dầu ăn', 'Mì luộc vừa chín tới, xả qua nước lạnh, để ráo.\r\nRau củ rửa sạch, cắt to hoặc nhỏ tùy ý thích.\r\nHải sản rã đông (mình sd loại hải sản mix đông lạnh), rửa lại rồi để ráo.\r\nHành tây, tỏi, ớt hiểm băm nhỏ.\r\n||STEP||\r\nLàm nóng chảo, phi thơm hành, tỏi, ớt với 2mc dầu ăn. Hành tỏi xém vàng cho tiếp hải sản vào xào ở lửa lớn, hải sản săn lại cho tiếp rau và boaro vào. Nêm gia vị vừa ăn (dầu hào, hạt nêm, xì dầu, tiêu). Khi hải sản vừa chín tới (khoảng 10p) cho tiếp mì vào đảo nhanh tay cho mì nóng thấm sốt rồi tắt bếp. Rắc thêm hành ngò nếu thích.', '0', 'http://localhost:3001/uploads/48df7eb3916f2b7e8790742393437cf0.webp', '2', '2025-11-28 02:34:15', 32, 0, 0, NULL, 'main', 'vietnam'),
(12, 4, 'Thịt Kho Tàu', '600-900 gram thịt lợn ba chỉ\r\n1 củ hành khô\r\n3 tép tỏi khô\r\n1 thìa hắc xì dầu (có thể bỏ qua)\r\n1 thìa dầu hào\r\n2 thìa xì dầu\r\n3 thìa mắm\r\n1-2 thìa đường hoặc mật mía\r\n1 bát nước đun sôi', 'Thịt để cả dải thịt, trần qua, rửa lại ngay dưới vòi nước lạnh. Cắt to cỡ bao diêm (3-5cm)\r\n||STEP||\r\nHắc xì dầu chủ yếu để tạo màu nếu không có thay bằng nước hàng/ kẹo đắng hoặc tự thắng đường để tạo màu cánh gián. Cho thịt vào đảo cùng hành, tỏi đập dập. Cho gia vị gồm mắm, xì dầu, dầu hào, mật mía (mình nấu kiểu tổ tiên mách bảo nên đơn vị tính trên công thức cũng chỉ áng chừng. Khi nấu cần chỉnh theo khẩu vị)\r\n||STEP||\r\nĐảo trên bếp 30s đến 1 phút. Đổ nước đang nóng vào sấp mặt thịt. Đun sôi, hạ nhỏ lửa đậy vung đun khoảng 3 tiếng cho thịt mềm là được', '3-4 tiếng', 'http://localhost:3001/uploads/d028292723613b3a0363cffd67a0006c.jfif', '3 - 4', '2025-11-28 02:34:15', 31, 0, 0, NULL, 'main', 'vietnam'),
(13, 4, 'Gà Rán Giòn ', '50 g bột mỳ\r\n50 g bột ngô\r\n50g bột chiên giòn\r\n450 g ức gà', 'Đầu tiên mình xơ chế 450g ức gà\r\n||STEP||\r\nRửa sạch với muối tinh trắng sau đó để ráo\r\n||STEP||\r\nThái miếng vừa ăn nha, mình quên chụp ảnh rồi.\r\n||STEP||\r\nTiếp đó mình đổ bột chiên giòn ra tô, đổ 50g luôn nha\r\n||STEP||\r\nChia đều 25g bột ngô và 25g bột mỳ vào 2 bát tô khác\r\n||STEP||\r\nBát đầu tiền đập 1 quả trứng gà (việc này giúp tạo màu vàng đẹp cho gà khi chiên) bột sánh mịn như ảnh là được\r\n||STEP||\r\nBát đầu tiền đập 1 quả trứng gà (việc này giúp tạo màu vàng đẹp cho gà khi chiên) bột sánh mịn như ảnh là được\r\n||STEP||\r\nLăn miếng gà lần lượt qua 3 bát : bột chiên giòn -> bột ướt -> bột khô (bột ngô + bột mỳ) rồi thả vào chảo dầu nóng\r\n||STEP||\r\nVà đây là thành quả của mình. Lớp vỏ giòn vàng, giống hệt ăn ngoài tiệm đúng không?', '45 phút', 'http://localhost:3001/uploads/e9c8c0b3f8331279c219dcd6603556cf.jfif', '2', '2025-11-28 02:34:15', 33, 0, 0, NULL, 'snack', 'vietnam'),
(14, 4, 'Súp hải sản măng tây', '400 g tôm sú\r\n200 g cá hồi\r\n200 g măng tây\r\n200 g nấm rơm\r\n3 quả trứng gà\r\n1 cây tàu hũ non\r\n1 Củ cải\r\n1 củ su su\r\n1 củ cà rốt\r\n700 g xương gà\r\nHạt nêm\r\nmuối\r\nBột năng', 'Xương gà rửa sạch.\r\n- Cho xương gà + su su + cà rốt + củ cải vào nồi nước ninh mềm rồi lọc lấy nước dùng.\r\n||STEP||\r\nTôm rửa sạch, bóc vỏ, bỏ chỉ.\r\n- Cho đầu vỏ tôm vào nồi nước dùng ở trên đun lấy nước dùng cho ngọt. Bỏ xác, lấy nước này nấu súp.\r\n- Nấm rửa sạch, cắt mỏng. Măng tây cắt hạt lựu. Đậu hũ non cắt hạt lựu\r\n- Tôm, cá hồi cắt hạt lựu.\r\n||STEP||\r\nĐun sôi nồi nước dùng --> cho tôm, cá vào nấu 1, 2 phút --> cho nấm, măng tây vào --> cho đậu hũ non vào --> nêm xíu muối + hạt nêm cho vừa ăn.\r\n- Hòa bột năng hòa với chút nước khuấy đều --> chế vào nồi súp khuấy đều đến sệt --> đánh tan trứng gà chế từ từ vào nồi khuấy đều tạo vân mây.\r\n||STEP||\r\nSúp chín múc ra chén rắc tiêu, ngò, nước tương, ớt. Ăn nóng rất ngon.', '0', 'http://localhost:3001/uploads/d62d2d5c22ca6ab0a37b4fed2e5ef9e9.jfif', '0', '2025-11-28 02:34:15', 33, 0, 0, NULL, 'soup', 'vietnam'),
(15, 4, 'Nem Nướng Nha Trang ', '700 g thịt nạc dăm\r\n300 g giò sống\r\n30 g tỏi băm\r\n1 muỗng canh bột năng\r\n2 muỗng canh dầu hào\r\n2 muỗng canh dầu ăn\r\n1 muỗng canh nước mắm\r\n3 muỗng canh mật ong\r\n1 muỗng cà phê hạt nêm\r\n1/2 muỗng cà phê tiêu\r\n1/4 muỗng cà phê bột màu điều\r\nBánh tráng cuốn\r\nRau thơm, xà lách\r\nDưa leo\r\nChuối chát\r\nXoài xanh\r\nCà rốt\r\nCủ cải\r\n100 g tôm tươi\r\n100 g thịt nạc\r\n100 g pa tê gan\r\nBột nếp', 'Thịt nạc dăm rửa sạch cắt lát đem xay nhuyễn, trộn thịt với giò sống, tỏi xay, nước mắm, hạt nêm, dầu ăn, bột điều, dầu hào, mật ong, bột năng, tiêu. Rồi trộn hỗn hợp cho hòa quyện và dẻo. Bọc kín hổn hợp thịt cất vô ngăn mát tủ lạnh 2-3 h rồi lấy ra trộn tiếp cho thật dẻo thì nem mới dai ngon. Rồi lấy từng ít một xiên vào que tre\r\n||STEP||\r\nNướng nem trên lửa than hoặc bếp nướng điện.\r\nPha sốt chấm nem : thịt xay,tôm lột vỏ xào chín với dầu hành phi,xíu nước mắm. Rồi cho tôm thịt vô cối xay nhuyễn. Bắc nồi với xíu dầu ăn phi thơm dầu hành với xíu bột màu điều, cho lên khoảng 1/2 lít nước nấu sôi, cho hỗn hợp tôm thịt xay và pa tê gan lên, nêm thêm đường, bột ngọt, muối, pha bột nếp với xíu nước đổ lên nấu cho sốt sệt lại rồi nêm nếm cho vừa ăn. Khi ăn cho thêm tỏi ớt băm hoặc sa tế vô sốt.\r\n||STEP||\r\nRau thơm, xà lách lặt rửa sạch.\r\nCủ cải cà rốt cắt lát mỏng xóc dấm,đường.\r\nDưa leo, xoài xanh bào mỏng\r\nChuối chát bào mỏng ngâm vô tô nước pha muối cho sạch mủ.\r\nChiên bánh tráng giòn : làm ướt bánh tráng rồi cuốn lại đem chiên giòn.\r\nKhi ăn cuốn bánh tráng với rau,nem nướng, bánh tráng giòn,chấm sốt.', '2 Tiếng', 'http://localhost:3001/uploads/5570ec51ff7138a918c6fe520b3b72db.webp', '5 - 6', '2025-11-28 02:34:15', 31, 0, 0, NULL, 'appetizer', 'vietnam'),
(16, 5, 'Hủ Tiếu Nam Vang', '1 kg hủ tiếu dai\r\n1 khúc xương ống\r\n1 con mực khô\r\n50 g tôm khô\r\n1 trái tim heo\r\n1 miếng gan heo\r\n10 trái trứng cút\r\n300 g thịt xay\r\n300 g tôm lớn\r\n1 củ cải trắng\r\n1 củ cà rốt\r\n3 củ tỏi\r\nHành ngò\r\nXà lách\r\nCần tây\r\nHẹ lá\r\nGiá\r\nTần ô\r\nHắc xì dầu\r\nNước tương\r\nGiấm\r\nĐường phèn\r\nMuối', 'Xương ngâm nước muối loãng chừng 30 phút cho sạch, rửa lại rồi trần qua nước nóng, sau đó rửa sạch lại và cho vào nồi hầm cùng mực khô nướng, tôm khô, muối và đường phèn, thêm rễ ngò rửa sạch nếu có, thêm củ cải trắng và cà rốt cắt khúc. Mình thường để nồi ủ từ đêm đến sáng, sáng dậy luộc tim, gan, tôm trong nồi nước dùng, trứng cút luộc chín và bóc vỏ, thịt xay xào với tỏi băm và chút nước mắm, hạt nêm cho thơm. Rau sống nhặt lại rồi rửa sạch, để ráo\r\n||STEP||\r\nTỏi băm nhỏ và phi vàng, múc 2/3 tỏi phi và dầu tỏi ra chén, để lại 1/3 làm nước sốt gồm 1 muỗng canh hắc xì dầu (gia vị đặc trưng cho món hủ tíu), 2 muỗng canh nước tương, 1 muỗng canh giấm, 2 muỗng canh đường, 1 chén nước, tất cả khuấy đều và chờ sôi lại là được, nêm lại cho vừa vị nha\r\n||STEP||\r\nCuối cùng là trụng hủ tíu, giá, chan nước tỏi phi cho bóng đẹp, trộn cùng nước sốt hủ tíu khô rồi cho các loại ăn kèm cắt nhỏ lên nhé. Nếu ăn nước thì chan nước dùng lên nhé', '90 phút', 'http://localhost:3001/uploads/50b1d573c3054fa66111ecf741fe579c.webp', '5', '2025-11-28 02:34:15', 29, 0, 0, NULL, 'main', 'vietnam'),
(17, 5, 'Cá tầm kho tộ', '500 g cá tầm (khúc giữa)\r\n50 g hành tăm\r\n1/2 củ hành tây\r\n1/2 củ tỏi\r\n1 miếng gừng\r\n1 nhánh tiêu xanh\r\n2 quả ớt cay\r\ngia vị', 'Cá tầm làm sạch, hành tăm, gừng, tỏi băm nhỏ; ướp cá với gia vị, 1 thìa cf tiêu xay, 1/2 hành tăm, gừng, tỏi để 30 phút\r\n||STEP||\r\nPhi 1/2 hành tăm còn lại, cho hành tây cắt lát vào, xếp cá tầm lên trên, đậy vung cho cạn nước và cá tầm săn lại. Cho nước sôi sâm sấp mặt cá, để lửa nhỏ, cho vào 1 nhánh tiêu xanh, 2 quả ớt cay, 1/2 thìa canh đường, 2 thìa canh nước hàng, nấu lửa nhỏ trong khoảng 20 phút. Trong thời gian này bạn nêm cho vừa khẩu vị nha.\r\n||STEP||\r\nMở vung để lửa lớn cho cạn nước và xong.\r\n||STEP||\r\nCho ra bát và thưởng thức thôi!', '30 phút', 'http://localhost:3001/uploads/1b24bebbe5d8d5d1661d4f7b01dd4ac3.webp', '4', '2025-11-28 02:34:15', 32, 0, 0, NULL, 'main', 'vietnam'),
(18, 5, 'Chả Giò Rế', 'Thịt nạc\r\nKhoai cao\r\nHành lá\r\nNấm mèo\r\nNấm mèo\r\nĐường\r\nTiêu', 'Thịt nạc đem xay nhỏ chứ không nhuyển.nấm mèo ngâm xắt sợi.khoai cao bào mỏng xắt sợi nhuyển.hành lá xắt nhuyển ướp vào thịt cùng với bột nêm tiêu đường nêm hơi cứng để khi cho khoai cao và nấm mèo vào không bị lạt mình làm 1 kg thịt với củ khoai khoảng 700g và vài tai nấm mèo.tuy nhiên khi trộn khoai vào mình nêm lại bằng cách chiên hay nướng 1 chút để thử.sau đó mình mua vỏ chả rế để quấn\r\n||STEP||\r\nQuấn xong đem chiên khi chiên cho phần gấp mí xuống dưới tránh bị bung lên và dầu cũng để vừa.chiên vàng gấp lên vĩ để ráo dầu rồi cho ra dĩa', '0', 'http://localhost:3001/uploads/09cbc703c1a1ad0354c653679e93923e.jfif', '0', '2025-11-28 02:34:15', 32, 0, 0, NULL, 'appetizer', 'vietnam'),
(19, 5, 'Bún Bò Huế', '1,5 kg xương bò\r\n1,5 kg bắp bò\r\n1 kg chân giò cắt khúc vừa ăn\r\n4-5 lít nước\r\n700 gr sả\r\nGiò lụa\r\nBò viên\r\nTóp mỡ hành phi\r\nHành tây nướng\r\nGừng nướng (ít thui ạ)\r\nGừng nướng (ít thui ạ)\r\nBún\r\nHỗn hợp mắm ruốc:\r\n1,5 muỗng canh mắm ruốc\r\n1,5 thìa canh lớn nước lạnh\r\nSa tế ớt:\r\n100 gr Ớt tươi\r\n50 gr Ớt bột\r\n100 gr Hành tím, tỏi, sả băm\r\n1 muỗng canh dầu điều\r\n1 thìa cà phê muối\r\n1 muỗng canh đường\r\n3 muỗng canh dầu ăn\r\nGia vị ướp bò bắp:\r\n2 muỗng canh nước mắm\r\n1/2 muỗng canh muối\r\n1/2 muỗng canh bột tỏi\r\n1/2 muỗng canh ớt bột\r\n1,5 muỗng canh hành tím băm\r\n1,5 muỗng canh mắm ruốc\r\nGia vị nêm nước dùng:\r\nMuối, hạt nêm, đường, bột canh\r\nHỗn hợp dầu của nước dùng\r\nDầu ăn hoặc mỡ heo\r\nTỏi băm, sả băm, hành tím băm\r\nBột điều đỏ', 'Xương bò rửa sạch ngâm nước lạnh tầm 3,4 tiếng cho ra hết máu bò.\r\n\r\n- Bắp bò với chân giò rửa như bt không cần ngâm.\r\n\r\n- Hoà tan mắm ruốc với nước lạnh rồi để cho nó lắng tầm 3,4 tiếng. Sau khi mắm ruốc lắng, ta chỉ sử dụng nước trong bỏ phần cặn.\r\n||STEP||\r\nSa tế tôm:\r\nLàm nóng dầu ăn rồi hạ lửa cho tỏi vào phi thơm, cho tiếp sả và cuối cùng là hành vô xào thơm thiệt thơm. Rồi đổ ớt bột, ớt tươi vào xào tiếp. Nêm nếm gia vị vào xong rồi tắt bếp bỏ vô lọ hoặc bát\r\n||STEP||\r\nTrần xơ qua bắp bò và xương bò cùng mấy nhánh sả đập dập thêm ít muối. Rồi vớt ra rửa sạch. Đổ tầm 4,5 lít nước vào, cho sả đã dùng qua vào ninh tiếp với xương bò. Nêm thêm muối. Thường xuyên hớt bọt bẩn. Ninh khoảng 3,4 tiếng.\r\n\r\n- Chân giò cũng trần sơ trong nồi riêng. Rồi ninh tầm khoảng 30\' ở nhiệt độ TB vì mình thích ăn dai giòn, ai thích ăn mềm có thể ninh lâu hơn. Không ninh chung với bò.\r\n||STEP||\r\nBắp bò được trộn đều vớt hỗn hợp ướp, để nghỉ 1,2 tiếng. Sau đó đi áp chảo bắp bò cho bắp bò săn lại. Rồi bỏ vô nồi xương bò đã ninh được 3,4 tiếng. Nêm gia vị cho nước dùng. Thả hành tây và gừng nướng vào. Ninh tiếp tầm 35-40\' cho thịt chín rồi vớt ra tô nước lạnh để thịt được săn giòn.\r\n||STEP||\r\nLàm phần hỗn hợp dầu:\r\nThắng mỡ nóng, cho lần lượt hành tím, sả, tỏi băm và bột điều đỏ vào xào thơm. Tắt bếp đổ hết vô nồi nước dùng bò\r\n\r\n- Gặn lấy nước trong của mắm ruốc rồi đổ vào nồi nước dùng. Tiếp đó đổ luôn nước dùng chân giò heo vào nồi xương bò luôn. Cho sả đập dập vào nồi ninh tiếp khoảng 40,50 phút (không ninh sả quá lâu sẽ làm nồng nước dùng). Cuối cùng là nêm nếm lại gia vị cho vừa ăn\r\n||STEP||\r\nCho tất cả các nguyên liệu đã được thái và chuẩn bị vào bát. Chan nước dùng và thưởng thức thôi ạ', '20 phút', 'http://localhost:3001/uploads/858a4f115832f1bc44ccd17b1e6d61d4.jfif', '0', '2025-11-28 02:34:15', 39, 0, 0, NULL, 'main', 'vietnam'),
(20, 5, 'Bánh cuốn (bằng chảo)', '200 gr thịt heo xay\r\n50 gr mỗi thứ: Hành tây, cà rốt, nấm hương, nấm mèo, hành lá\r\nGia vị ướp nhân bánh: dầu hào, dầu mè, đường, tiêu, bột ngọt\r\nNước chấm: ớt, tỏi, đường, bột ngọt, chanh\r\nBột bánh cuốn pha sẵn Mikko\r\nRau sống, hành phi', 'Pha bột gạo với nước. Giữ lửa vừa để nguyên liệu chín đều mà không bị cháy.\r\nXào nhân thịt với mộc nhĩ. Đảo nhẹ tay, giúp gia vị thấm sâu và dậy mùi thơm.\r\nTráng bánh trên vải. Nêm nếm lại trước khi tắt bếp để cân bằng vị.\r\nCho nhân vào và cuốn lại. Để nghỉ 2-3 phút cho hương vị hòa quyện rồi hãy dùng.\r\nXếp bánh ra đĩa. Trình bày trên đĩa ấm để giữ độ ngon lâu hơn.\r\nĂn kèm chả lụa và nước mắm. Giữ lửa vừa để nguyên liệu chín đều mà không bị cháy.\r\n||STEP||\r\nCho thịt vào nguyên liệu đã cắt hạt lựu bên trên. Nêm gia vị vừa ăn: dầu hào, đường, bột ngọt, dầu mè. Trộn đều tất cả lên ướp trong 15\'.\r\n||STEP||\r\nLàm nóng chảo & cho vào 1 ít dầu. Cho thịt & rau củ đã ướp vào chảo xào.\r\n||STEP||\r\nKhi vừa chín tới bạn trút nhân bánh ra tô.\r\n||STEP||\r\nTiếp theo, bạn giã ớt, tỏi, đường, 1 ít bột ngọt để làm nước chấm.\r\n||STEP||\r\nGiã vừa tay, đừng quá nát.\r\n||STEP||\r\nBạn cho tiếp nước mắm, nước cốt chanh, nước lọc vào. Tùy chỉnh lượng nước lọc - đường - nước mắm - nước cốt chanh để có nước chấm vừa ý.\r\n||STEP||\r\nBước tiếp theo là làm vỏ bánh. Mình dùng bột bánh cuốn pha sẵn của Mikko. Bạn pha bột, nước lọc & dầu ăn theo tỷ lệ ghi trên bao bì. Để bột nghỉ ít nhất 20 phút trước khi đổ bánh nhé. (Bạn nên pha bột từ đầu để đỡ mất thời gian đợi).\r\n||STEP||\r\nLàm nóng chảo chống dính, phết lên bề mặt chảo 1 ít dầu. Giảm lửa nhỏ nhất. Cho 1 vá bột vào, nghiêng chảo để bột tráng đều. Đậy kín nắp.\r\n||STEP||\r\nĐến khi bột trong là được, tầm 5-10 giây. Lật úp chảo cho bánh rơi vào đĩa có phết 1 ít dầu đã chuẩn bị sẵn. Bạn cho bột vào chảo để làm mẻ thứ 2.\r\n||STEP||\r\nPhần bánh trong đĩa, bạn cho nhân vào & cuốn bánh. Cuốn xong thì bột trên chảo cũng vừa trong. Cứ vậy, thời gian cho nhân & cuốn bánh vừa vặn với thời gian bột chín là đẹp ?\r\n||STEP||\r\nXếp bánh, rau & nước chấm ra đĩa, rắc lên ít hành phi & ăn ngay cho nóng ?\r\n||STEP||\r\nHức hức, ngon lắm luôn í ?', '0', 'http://localhost:3001/uploads/eb50068a9bddebb51316521004ad7ba7.jfif', '0', '2025-11-28 02:34:15', 33, 0, 0, NULL, 'snack', 'vietnam'),
(21, 6, 'Mực Xào Sa Tế ', '3 cây nấm đùi gà\r\nỚt bột,tương ớt\r\nNước tương,dầu hào\r\nĐường,tỏi,ngò..\r\nGừng,bột ngọt', 'Rửa nấm,xắt theo chiều dọc thành miếng dài,dày.khứa xéo như mực đẹp hơn khứa thẳng đứng.sau đó đem luộc cho chút bột nêm cho nấm ngọt và vài miếng gừng cho bán mùi nấm,nấm dịu lai vớt ra để ráo.ép bớt nước cho dễ quấn quấn nấm cuộn tròn cho sát chặc lại dùng tăm ghim cố định\r\n||STEP||\r\nPha hỗn hợp sauce gồm tương ớt,ớt bột dầu hào nước tương đường chút bột ngọt.thêm vá nước quậy tan.bắc chảo phi tỏi thơm cho nước sauce vào nấu,khi nào thấy sauce đủ áo mực thì cho vào trộn đều.khi nấm thấm thì nhắc xuống rút tăm cho ra dĩa điểm thêm ít cọng ngò và vài khoanh ớt', '0', 'http://localhost:3001/uploads/cd82f41551242cb4f2c15334591b2778.webp', '0', '2025-11-28 02:34:15', 38, 0, 0, NULL, 'snack', 'vietnam'),
(22, 6, 'Xôi Xéo ', '1 kg gạo nếp\r\n200 g đậu xanh lột vỏ\r\n100 g hành tím\r\nGia vị: bột nghệ, muối, dầu ăn', 'Gạo nếp vo sạch, ngâm với 1mcf bột nghệ và chút muối qua đêm để hạt nếp có màu vàng tự nhiên và đậm vị. Đậu xanh cà vỏ vo sạch rồi ngâm nước 2 tiếng cho đậu xanh mềm, sau đó cho vào nồi cơm điện nấu chín hoặc hấp chín rồi nắn thành khối tròn to\r\n||STEP||\r\nGạo nếp sau khi ngâm thì để ráo nước rồi cho vào nồi hấp 30 phút, thỉnh thoảng mở nắp và đảo lại. Hành củ bóc vỏ, rửa sạch và phi hành. Xôi gần chín thì cho thêm vài muỗng dầu hành vào đảo đều cho xôi bóng đẹp, đậy nắp hấp thêm 5 phút\r\n||STEP||\r\nMúc xôi ra dĩa, dùng dao cắt khối đậu xanh to thành những lát mỏng phủ đều lên xôi, rưới thêm ít dầu hành và thêm hành phi lên trên là hoàn tất', '30 phút', 'http://localhost:3001/uploads/d482cb5b532dd3f7fa50d4d4da3965ab.webp', '6', '2025-11-28 02:34:15', 29, 0, 0, NULL, 'appetizer', 'vietnam'),
(23, 6, 'Gà Xào Sả Ớt', '500 gr thịt gà mái, chặt sẵn\r\n4 cây sả\r\n1 trái ớt sừng hoặc 2 trái ớt hiểm\r\n1 tsp bột nghệ/bột cà ri\r\n1/2 tsp muối\r\n1 tbsp nước mắm\r\n1 tbsp đường\r\n1 tsp tỏi', 'Gà làm sẵn mình về rửa sạch chặt khúc vừa ăn. Ướp gia vị muối đường bột nghệ vào 20-30 phút.\r\n||STEP||\r\nPhi thơm tỏi sả ớt với dầu ăn. Cho gà vào xào săn.\r\n||STEP||\r\nThêm 1/2 chén nước đậy nắp 10 phút cho gà chín. Nêm nước mắm vào cho vừa.', '45 phút', 'http://localhost:3001/uploads/84cef05380735f45979891959456f4b7.webp', '4', '2025-11-28 02:34:15', 46, 0, 0, NULL, 'main', 'vietnam'),
(24, 6, 'Canh Bí Đỏ Tôm ', '300 gram tôm\r\n300 ml nước\r\n250 gram bí đỏ\r\nngò\r\nhành lá', 'Ướp tôm với một tí hạt nêm và hành tím\r\n||STEP||\r\nCác bạn ướp thêm 1 tí hạt nêm vào bí đỏ\r\n||STEP||\r\nXào hành tím và tôm trên chảo nóng sau đó đổ nước vào đun sôi, sau đó bỏ bí đỏ vào đậy nấp lại cho nhừ rồi sau đó bỏ hành lá và và xong', '30 phút', 'http://localhost:3001/uploads/ad216052573ca0bd2b6e2dd7cac16197.jfif', '2', '2025-11-28 02:34:15', 29, 0, 0, NULL, 'soup', 'vietnam'),
(25, 6, 'Sườn Xào Chua Ngọt', '300 gram sườn heo\r\n2 trái cà chua\r\n1/2 trái thơm\r\n1 ít hành lá\r\n1 muỗng nước tương\r\n1 muỗng đường\r\n1 muỗng tương cà\r\n1 muỗng tương ớt\r\n1 muỗng cafe hạt nêm\r\n1 muỗng cafe bột ngọt\r\n1 muỗng cafe tiêu\r\n2 muỗng nước lọc\r\n1 muỗng dầu hào\r\n1 ít tỏi băm nhuyễn', 'Sườn heo rửa sạch, trụng nước sôi vớt ráo.\r\nThơm rửa sạch bỏ lõi, cắt miếng vừa ăn.\r\nCà chua rửa sạch cắt múi, bỏ hạt.\r\nHành lá thái khúc.\r\n||STEP||\r\nNước sốt: cho tất cả gia vị trên vào chén, hoà tan.\r\nBắc chảo lên bếp, cho sườn vào chiên vàng. Vớt ra dĩa sạch.\r\n||STEP||\r\nBắc thêm chảo khác phí thơm tỏi băm. Cho nước sốt vào đun sôi, cho tiếp sườn đã chiên vào đảo đều cho thấm gia vị.\r\nTiếp tục cho thơm, cà chua vào đảo thêm vài phút cho hành lá vào, tắt bếp.', '0', 'http://localhost:3001/uploads/1b9cdfbf462e5c8e3c0a6d48cbe9cd90.webp', '0', '2025-11-28 02:34:15', 53, 0, 0, NULL, 'main', 'vietnam'),
(31, 1, 'Phở Bò Hà Nội', '1 kg thịt bò\r\n1 kg xương lợn\r\n0.5 lạng sá sùng khô\r\nquả Quế, hoa hồi, thảo\r\nHành lá, rau thơm, mùi tây, gừng', 'Rửa sạch xương bò. Nấu sôi nước, cho xương bò vào luộc qua rồi chắt đi, cho nước mới (làm như này thì nước sẽ trong)\r\n||STEP||\r\nCho xương bò vào hầm, trong lúc hầm thì liên tục hớt bọt, hầm khoảng 1h rưỡi. Lọc xương, để riêng nước dùng\r\n||STEP||\r\nNướng chín hành, hành tím, gừng, mía. Sau khi nướng xong, cạo sạch vỏ gừng và hành. Rửa các gia vị trên với nước sạch, để ráo. Cắt đôi hành tây, cắt lát gừng.\r\n||STEP||\r\nRang hoa hồi, quế, thảo quả, sá sùng với lửa nhỏ cho đến khi dậy mùi thơm\r\n||STEP||\r\nNấu sôi nước hầm bò, lần lượt bỏ sá sùng và các loại gia vị trên vào nồi. Đun được 10\' thì nêm gia vị vừa miệng\r\n||STEP||\r\nCắt lát mỏng thịt bò theo thớ ngang rồi chan nước dùng lên. Nếu bạn không thích ăn tái thì có thể luộc thịt bò, để tủ lạnh, khi nào ăn thì cắt ra\r\n||STEP||\r\nCho thêm hành lá, và rau mùi, giá tùy sở thích', '2 tiếng', 'http://localhost:3001/uploads/4cdb8524fcd5f9a778160de5611d838c.webp', '6', '2025-11-28 02:47:01', 123, 0, 0, NULL, 'main', 'vietnam'),
(32, 1, 'Cơm Tấm Sườn Nướng và trứng ốp la', '2 miếng Thịt cốt lếch\r\n2 quả trứng gà tươi\r\n1 trái dưa leo\r\nSữa đặc để ướp thịt\r\nHành lá\r\nGia vị muối, đường, tiêu, hạt nêm, ớt, tỏi\r\nCơm nóng', 'Ướp thịt cốt lếch với 2 tép hành đập dập, 1 muỗng canh sữa đặc, 2 muỗng canh nước mắm, 2 muỗng coffee đường, 1 muỗng coffee hạt nêm, bột ớt, tiêu trong vòng 2 giờ. Nếu muốn thịt mềm thì có thể dùng chày hoặc cây đập thịt đập dập.\r\n||STEP||\r\nCắt nhỏ hành lá, đun sôi dầu trên bếp rồi đổ dầu sôi vào chén hành.\r\n||STEP||\r\nRửa sạch dưa leo và cắt thành từng miếng mỏng\r\n||STEP||\r\nChiên trứng ốp la\r\n||STEP||\r\nNướng thịt, có 1 bí quyết cho thịt mềm là trong thời gian nướng nếu thấy thịt bị khô có thể dùng bình xịt nước xịt lên thịt để thịt còn ẩm nhé.\r\n||STEP||\r\nSắp mọi thứ lên đĩa ăn cùng cơm nóng.', '0', 'http://localhost:3001/uploads/87f2c2640f45353d7c82a1d68690b472.webp', '2', '2025-11-28 02:47:01', 44, 0, 0, NULL, 'main', 'vietnam'),
(33, 1, 'Bánh Mì Thịt Nướng Nhà Làm', 'bánh mì, đồ chua, thịt heo\r\nxã băm, tỏi, ớt, cà chua, hành lá, nước mắm, đường, chanh', 'Làm đồ chua đơn giản\r\nHành lá xe sợi ngâm nước.\r\n||STEP||\r\nXay hỗn hợp: tỏi, củ hành tím, xã cây, ít bớt => xay nhuyễn.\r\n||STEP||\r\nSốt ướp thịt nướng:\r\n- 2 mc nước tương lạt (light soy sauce)\r\n- 1 mc dầu hào\r\n- 1 mc bột năng\r\n- 1 mcf tiêu\r\nLưu ý: nếu b dùng nước tương maggi thì giảm hàm lượng nhé vì maggi có độ mặn hơn.\r\n||STEP||\r\nƯớp thịt:\r\n- cho hh nước sốt\r\n- hành tỏi xã băm\r\n- 1 ít bột nghệ\r\n=> ướp thịt 30p trong ngăn mát.\r\n||STEP||\r\nNướng thịt: làm nóng lò 5p với 180*\r\nSet nhiệt: 190* với 13p, trỡ mặt cho thịt chín đều nhé.\r\n||STEP||\r\nLàm nước mắm:\r\n- cho 1 mc đường\r\n- 2 lát chanh\r\n- 2mc nước mắm sống\r\n=> cho nước nóng vào khuấy cho đường tan\r\nSau khi đường tan mới cho tỏi băm + ớt băm vào (lúc này tỏi ớt mới nổi lên mặt, nếu bạn cho vào lúc đầu tỏi ớt sẽ bị chìm).\r\n||STEP||\r\nĐây là các thành phần mình đã chuẩn bị xong cho bánh mì.\r\nLát salad, cà chua, rưới ít nước mắm, cho thịt, hành lá, đồ chua vàp như hình.\r\n||STEP||\r\nSau khi để các thành phần vào bánh mì, cắt đôi tạo kiểu vậy là mình đã có món bánh mì thịt nướng ngon lành :D', '1 tiếng', 'http://localhost:3001/uploads/b750640c50a19d97ba3363868e4f3e17.webp', '2 - 3', '2025-11-28 02:47:01', 48, 0, 0, NULL, 'main', 'vietnam'),
(34, 1, 'Bún Chả Hà Nội', '1-1,3 kg Thịt heo (ba chỉ +thịt nạc vai,có kèm cả thịt và ít mỡ)\r\nRau xà lách 1 búp,ngò rí,tía tô hoặc diếp cá\r\n1 củ cà rốt,1 nữa quả đu đủ xanh có kèm ruột hơi vàng\r\nBún gạo', 'Thịt heo mua về tự băm nhuyễn hoặc mua bảo họ xay sẵn.đem về ướp 3,5 muỗng canh nước mắm đệ nhị,2 muỗng canh dầu hào,2 muỗng canh đường,1 muỗng canh mật ong,2 muỗng cafe hạt nêm,1 muỗng cafe tiêu xay.4 củ hàng tím+1 tép tỏi băm nhuyễn.trộn đều để ướp tầm 30p-1 tiếng cho thấm gia vị rồi cho đi nướng than.\r\n||STEP||\r\nCà rốt gọt vỏ bào mỏng từng lát cắt tỉa hoa tuỳ thích, đu đủ gọt vỏ thái mỏng ngâm cà rốt và đu đủ vào nước muối pha loãng cho hết nhựa. Sau đó vớt ra rổ để ráo rồi để vào bát cho thêm đường,dấm,muối.(lượng gia vị vừa phải)\r\n||STEP||\r\nLàm nước chấm:\r\nCho 600ml nước lọc vào nồi,100gam đường,100ml giấm,100ml nước mắm đảo đều cho tan.sau đó đun sôi,khi thấy sôi lăn tăn thì cho nữa muỗng cafe bột ngọt.đảo nhẹ cho tỏi ớt băm nhuyễn vào nồi tắt bếp,cho nữa muỗng cafe tiêu.\r\n||STEP||\r\nBày bún,rau,chả,nước chấm và dưa chua ra đĩa vậy là ăn thôi', '0', 'http://localhost:3001/uploads/232ead3882e12ca3ba46390f33f5042b.webp', '5 - 6', '2025-11-28 02:47:01', 30, 0, 0, NULL, 'main', 'vietnam'),
(35, 1, 'Gỏi Cuốn Tôm Thịt', '700 gram thịt ba chỉ\r\n700 gram tôm tươi\r\nBún tươi\r\nRau xà lách\r\nrau thơm\r\nlá hẹ\r\ndưa leo\r\nGừng\r\nhành tím\r\nhành lá\r\nMuối\r\n1 mc hạt nêm', 'Thịt rửa sạch với nước muối loãng, để ráo. Cho thịt vô nồi đổ ngập nước cho vô gừng cắt lát + hành tím + hành lá + 1MC hạt nêm luộc cho đến khi thịt chín (trong lúc luộc nhớ vớt bọt thường xuyên). Thịt chín vớt ra thau nước đá lạnh để thịt nguội.\r\n||STEP||\r\nTôm bóc sạch vỏ, rút chỉ lưng, rửa sạch, để ráo. Đổ tôm vô nồi nước luộc thịt luộc chín, vớt ra tô nước đá lạnh.\r\n_ Vớt thịt + tôm ra rổ để thật ráo nước.\r\n||STEP||\r\nCác loại rau rửa sạch, để ráo nước.\r\n_ Dưa leo rửa sạch, cắt lát dài\r\n_ Thịt cắt lát mỏng\r\n_ Tôm cắt làm đôi\r\n_ Bún trụng nước sôi, để ráo.\r\n||STEP||\r\nLàm ướt bánh tráng cuốn. Lần lượt cho rau + bún + dưa leo + thịt + tôm + lá hẹ vô cuốn lại cho chặt tay là được.\r\n||STEP||\r\nGỏi cuốn tôm thịt có thể chấm với nước mắm chua ngọt, mắm nêm hoặc tương đen tuỳ theo sở thích.', '60 phút', 'http://localhost:3001/uploads/4512f7254b7b89e52148af2b5304cb44.webp', '4', '2025-11-28 02:47:01', 36, 0, 0, NULL, 'main', 'vietnam'),
(37, 2, 'Test chức năng ẩn bài viết', 'Test', 'Test', '0', NULL, '0', '2025-12-15 11:08:38', 7, 2, 1, NULL, 'other', 'other'),
(38, 3, 'Bún đậu mắm tôm', '300 g lưỡi heo hoặc thịt chân giò\r\n200 gr đậu khuôn\r\n300 g bún khô hoặc bún tươi\r\n1 số loại rau ăn kèm: kinh giới, xà lách, rau mùi, dưa chuột\r\nMắm tôm chấm\r\n2 tbsp đường\r\n1 quả chanh\r\n2 tsp nước lọc\r\n3 tbsp mắm tôm ngon', 'Bún khô luộc chín xong cho vào túi buộc rồi ép lại thành bánh. Ép tầm 15 phút rồi bỏ ra cắt miếng vừa ăn.\r\nNếu dùng bún tươi thì mua loại bún ép sẵn.\r\nRau mua về rửa sạch để ráo\r\n||STEP||\r\nĐậu thấm khô nước rồi mai đi chiên vàng giòn 2 mặt.\r\n||STEP||\r\nThịt mua về rửa sạch sau đấy mang đi luộc cho chín rồi cắt miếng vừa ăn.\r\n||STEP||\r\nCách pha mắm: cho tất cả các nguyên liệu phần nước mắm vào rồi khuấy đều cho đến khi nổi bọt. Gia giảm mặn ngọt theo khẩu vị gia đình.\r\n||STEP||\r\nMón bún đậu có thể ăn kèm với nhiều topping khác nhau tuy nhiên 2 món chính cần có là đậu rán và thịt luộc.', '1 tiếng', 'http://localhost:3001/uploads/1ea7ca9988408bfd7029b02d2ac21496.webp', '4', '2025-12-27 06:10:54', 4, 0, 0, NULL, 'main', 'vietnam');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_gia`
--

CREATE TABLE `danh_gia` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danh_gia`
--

INSERT INTO `danh_gia` (`id`, `recipe_id`, `user_id`, `rating`, `created_at`) VALUES
(1, 33, 2, 5, '2025-11-28 03:19:49'),
(2, 6, 2, 5, '2025-11-28 03:20:00'),
(3, 33, 1, 4, '2025-11-29 07:10:55'),
(4, 31, 1, 5, '2025-11-29 07:11:08'),
(5, 32, 1, 5, '2025-11-29 07:11:22'),
(6, 34, 1, 5, '2025-11-29 07:11:29'),
(7, 35, 1, 5, '2025-11-29 07:11:46'),
(8, 21, 6, 5, '2025-11-29 07:13:40'),
(9, 11, 4, 5, '2025-11-29 07:23:39'),
(10, 20, 5, 5, '2025-11-29 07:29:16'),
(11, 19, 5, 5, '2025-11-29 07:29:23'),
(12, 17, 5, 5, '2025-11-29 07:29:28'),
(13, 18, 5, 5, '2025-11-29 07:29:35'),
(14, 16, 5, 5, '2025-11-29 07:29:41'),
(15, 6, 3, 5, '2025-11-29 07:30:28'),
(16, 10, 3, 5, '2025-11-29 07:33:29'),
(17, 9, 3, 5, '2025-11-29 07:33:36'),
(18, 8, 3, 5, '2025-11-29 07:33:40'),
(19, 7, 3, 5, '2025-11-29 07:33:44'),
(20, 19, 3, 2, '2025-11-29 07:34:21'),
(21, 31, 2, 5, '2025-11-29 07:35:20'),
(22, 16, 2, 5, '2025-11-29 07:35:59'),
(23, 15, 2, 5, '2025-11-29 07:36:44'),
(24, 25, 2, 5, '2025-11-29 07:36:54'),
(25, 22, 6, 5, '2025-11-29 07:38:29'),
(26, 23, 6, 5, '2025-11-29 07:38:34'),
(27, 24, 6, 5, '2025-11-29 07:38:37'),
(28, 25, 6, 5, '2025-11-29 07:39:05'),
(29, 12, 6, 4, '2025-11-29 07:39:36'),
(30, 14, 6, 2, '2025-11-29 07:39:57'),
(31, 13, 6, 3, '2025-11-29 07:40:03'),
(32, 15, 6, 2, '2025-11-29 07:40:14'),
(33, 15, 4, 5, '2025-11-29 07:41:14'),
(34, 14, 4, 5, '2025-11-29 07:41:29'),
(35, 12, 4, 5, '2025-11-29 07:41:33'),
(36, 13, 4, 5, '2025-11-29 07:41:45'),
(37, 11, 6, 4, '2025-11-29 07:42:25'),
(38, 31, 6, 5, '2025-11-29 07:43:12'),
(39, 31, 4, 5, '2025-11-29 07:44:32'),
(40, 32, 6, 4, '2025-11-29 07:46:58'),
(41, 33, 6, 1, '2025-11-29 07:48:03'),
(42, 35, 6, 3, '2025-11-29 07:48:25'),
(43, 34, 6, 2, '2025-11-29 07:48:30'),
(44, 32, 4, 4, '2025-11-29 07:50:17'),
(45, 35, 4, 2, '2025-11-29 07:50:29'),
(46, 33, 4, 3, '2025-11-29 07:50:48'),
(47, 34, 4, 1, '2025-11-29 07:50:55'),
(48, 31, 5, 5, '2025-11-29 07:53:43'),
(49, 31, 3, 1, '2025-11-29 07:54:04'),
(50, 33, 5, 2, '2025-11-29 07:56:10'),
(51, 35, 3, 5, '2025-11-29 07:57:00'),
(52, 25, 1, 4, '2025-11-29 07:58:06'),
(53, 21, 1, 3, '2025-11-29 07:58:20'),
(54, 23, 1, 5, '2025-11-29 07:58:59'),
(55, 22, 1, 2, '2025-11-29 07:59:16'),
(56, 24, 1, 1, '2025-11-29 07:59:26'),
(57, 15, 1, 4, '2025-11-29 08:00:06'),
(58, 13, 1, 5, '2025-11-29 08:00:15'),
(59, 11, 1, 2, '2025-11-29 08:00:29'),
(60, 14, 1, 3, '2025-11-29 08:00:56'),
(61, 12, 1, 1, '2025-11-29 08:01:03'),
(62, 6, 1, 4, '2025-11-29 08:01:41'),
(63, 7, 1, 2, '2025-11-29 08:01:46'),
(64, 8, 1, 5, '2025-11-29 08:02:03'),
(65, 9, 1, 1, '2025-11-29 08:02:49'),
(66, 10, 1, 3, '2025-11-29 08:02:53'),
(67, 16, 1, 4, '2025-11-29 08:03:41'),
(68, 19, 1, 3, '2025-11-29 08:03:51'),
(69, 17, 1, 5, '2025-11-29 08:04:02'),
(70, 18, 1, 1, '2025-11-29 08:04:07'),
(71, 20, 1, 2, '2025-11-29 08:04:13'),
(72, 32, 3, 3, '2025-11-29 08:04:46'),
(73, 33, 3, 4, '2025-11-29 08:05:02'),
(74, 34, 3, 1, '2025-11-29 08:05:05'),
(75, 25, 3, 5, '2025-11-29 08:05:36'),
(76, 23, 3, 4, '2025-11-29 08:05:42'),
(77, 21, 3, 2, '2025-11-29 08:05:45'),
(78, 22, 3, 3, '2025-11-29 08:05:54'),
(79, 24, 3, 1, '2025-11-29 08:06:24'),
(80, 13, 3, 4, '2025-11-29 08:06:37'),
(81, 15, 3, 3, '2025-11-29 08:06:42'),
(82, 11, 3, 5, '2025-11-29 08:06:45'),
(83, 14, 3, 1, '2025-11-29 08:06:58'),
(84, 12, 3, 2, '2025-11-29 08:07:02'),
(85, 16, 3, 3, '2025-11-29 08:07:40'),
(86, 17, 3, 4, '2025-11-29 08:07:45'),
(87, 18, 3, 5, '2025-11-29 08:07:59'),
(88, 20, 3, 1, '2025-11-29 08:08:04'),
(89, 6, 6, 3, '2025-11-29 08:10:32'),
(90, 8, 6, 2, '2025-11-29 08:10:39'),
(91, 9, 6, 1, '2025-11-29 08:10:43'),
(92, 7, 6, 5, '2025-11-29 08:10:46'),
(93, 20, 6, 5, '2025-11-29 08:11:33'),
(94, 19, 6, 4, '2025-11-29 08:11:39'),
(95, 18, 6, 3, '2025-11-29 08:11:46'),
(96, 16, 6, 2, '2025-11-29 08:11:49'),
(97, 17, 6, 1, '2025-11-29 08:11:52'),
(98, 10, 6, 4, '2025-11-29 08:12:06'),
(99, 25, 4, 4, '2025-11-29 08:14:04'),
(100, 24, 4, 2, '2025-11-29 08:14:10'),
(101, 22, 4, 1, '2025-11-29 08:14:24'),
(102, 21, 4, 5, '2025-11-29 08:14:27'),
(103, 23, 4, 3, '2025-11-29 08:14:43'),
(104, 6, 4, 2, '2025-11-29 08:14:52'),
(105, 8, 4, 4, '2025-11-29 08:14:56'),
(106, 9, 4, 5, '2025-11-29 08:14:59'),
(107, 10, 4, 1, '2025-11-29 08:15:09'),
(108, 7, 4, 3, '2025-11-29 08:15:58'),
(109, 19, 4, 5, '2025-11-29 08:16:53'),
(110, 17, 4, 3, '2025-11-29 08:17:00'),
(111, 16, 4, 2, '2025-11-29 08:17:09'),
(112, 18, 4, 4, '2025-11-29 08:17:13'),
(113, 20, 4, 1, '2025-11-29 08:17:23'),
(114, 13, 2, 5, '2025-11-29 08:18:01'),
(115, 24, 2, 5, '2025-11-29 08:18:10'),
(116, 12, 2, 5, '2025-11-29 08:18:13'),
(117, 34, 2, 5, '2025-11-29 08:18:16'),
(118, 20, 2, 5, '2025-11-29 08:18:18'),
(119, 22, 2, 5, '2025-11-29 08:18:25'),
(120, 9, 2, 5, '2025-11-29 08:18:28'),
(121, 14, 2, 5, '2025-11-29 08:18:30'),
(122, 10, 2, 5, '2025-11-29 08:18:36'),
(123, 18, 2, 5, '2025-11-29 08:18:43'),
(124, 21, 2, 5, '2025-11-29 08:18:48'),
(125, 7, 2, 5, '2025-11-29 08:18:50'),
(126, 19, 2, 5, '2025-11-29 08:18:53'),
(127, 8, 2, 5, '2025-11-29 08:18:59'),
(128, 32, 2, 5, '2025-11-29 08:19:15'),
(129, 32, 5, 1, '2025-11-29 08:22:14'),
(130, 35, 5, 3, '2025-11-29 08:22:24'),
(131, 34, 5, 4, '2025-11-29 08:22:41'),
(132, 24, 5, 5, '2025-11-29 08:23:08'),
(133, 22, 5, 4, '2025-11-29 08:23:12'),
(134, 23, 5, 2, '2025-11-29 08:23:20'),
(135, 25, 5, 1, '2025-11-29 08:23:24'),
(136, 21, 5, 3, '2025-11-29 08:23:34'),
(137, 14, 5, 5, '2025-11-29 08:23:43'),
(138, 12, 5, 3, '2025-11-29 08:23:48'),
(139, 11, 5, 4, '2025-11-29 08:23:55'),
(140, 13, 5, 1, '2025-11-29 08:23:57'),
(141, 15, 5, 2, '2025-11-29 08:24:09'),
(142, 9, 5, 4, '2025-11-29 08:24:32'),
(143, 10, 5, 2, '2025-11-29 08:24:37'),
(144, 6, 5, 3, '2025-11-29 08:24:42'),
(145, 7, 5, 1, '2025-11-29 08:24:47'),
(146, 8, 5, 5, '2025-11-29 08:24:50'),
(147, 38, 3, 5, '2025-12-27 06:11:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorite`
--

CREATE TABLE `favorite` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `favorite`
--

INSERT INTO `favorite` (`id`, `user_id`, `recipe_id`, `created_at`) VALUES
(3, 1, 33, '2025-11-29 07:10:58'),
(4, 1, 31, '2025-11-29 07:11:07'),
(5, 1, 32, '2025-11-29 07:11:25'),
(6, 1, 34, '2025-11-29 07:11:31'),
(7, 1, 35, '2025-11-29 07:11:48'),
(8, 6, 21, '2025-11-29 07:13:43'),
(10, 4, 11, '2025-11-29 07:23:33'),
(11, 5, 20, '2025-11-29 07:29:18'),
(12, 5, 19, '2025-11-29 07:29:24'),
(13, 5, 17, '2025-11-29 07:29:30'),
(14, 5, 18, '2025-11-29 07:29:36'),
(15, 5, 16, '2025-11-29 07:29:40'),
(16, 3, 6, '2025-11-29 07:30:30'),
(17, 3, 10, '2025-11-29 07:33:31'),
(18, 3, 9, '2025-11-29 07:33:37'),
(19, 3, 8, '2025-11-29 07:33:41'),
(20, 3, 7, '2025-11-29 07:33:45'),
(21, 2, 31, '2025-11-29 07:35:22'),
(22, 2, 6, '2025-11-29 07:35:32'),
(23, 2, 16, '2025-11-29 07:35:58'),
(24, 2, 15, '2025-11-29 07:36:46'),
(25, 2, 25, '2025-11-29 07:36:56'),
(26, 6, 22, '2025-11-29 07:38:30'),
(27, 6, 23, '2025-11-29 07:38:34'),
(28, 6, 24, '2025-11-29 07:38:38'),
(29, 6, 13, '2025-11-29 07:40:04'),
(31, 4, 15, '2025-11-29 07:41:20'),
(32, 4, 12, '2025-11-29 07:41:24'),
(33, 4, 14, '2025-11-29 07:41:28'),
(34, 4, 13, '2025-11-29 07:41:44'),
(37, 4, 31, '2025-11-29 07:44:33'),
(38, 6, 32, '2025-11-29 07:47:01'),
(40, 3, 35, '2025-11-29 07:57:01'),
(41, 1, 23, '2025-11-29 07:59:01'),
(42, 1, 13, '2025-11-29 08:00:17'),
(44, 1, 8, '2025-11-29 08:02:39'),
(46, 1, 17, '2025-11-29 08:04:04'),
(47, 3, 25, '2025-11-29 08:05:38'),
(49, 3, 11, '2025-11-29 08:06:46'),
(50, 3, 18, '2025-11-29 08:08:00'),
(51, 6, 25, '2025-11-29 08:09:19'),
(52, 6, 20, '2025-11-29 08:11:34'),
(54, 6, 7, '2025-11-29 08:12:24'),
(57, 4, 21, '2025-11-29 08:16:10'),
(58, 4, 9, '2025-11-29 08:16:34'),
(59, 4, 19, '2025-11-29 08:16:55'),
(60, 5, 31, '2025-11-29 08:22:06'),
(61, 5, 24, '2025-11-29 08:23:09'),
(62, 5, 14, '2025-11-29 08:23:44'),
(63, 5, 8, '2025-11-29 08:24:51'),
(65, 3, 38, '2025-12-27 06:11:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `follow`
--

CREATE TABLE `follow` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `follow`
--

INSERT INTO `follow` (`id`, `follower_id`, `following_id`, `created_at`) VALUES
(2, 4, 1, '2025-11-29 07:25:50'),
(3, 3, 1, '2025-11-29 07:34:10'),
(4, 3, 5, '2025-11-29 07:34:20'),
(5, 3, 4, '2025-11-29 07:34:34'),
(6, 3, 6, '2025-11-29 07:34:39'),
(7, 2, 1, '2025-11-29 07:35:02'),
(8, 2, 5, '2025-11-29 07:35:08'),
(9, 2, 3, '2025-11-29 07:35:14'),
(10, 2, 4, '2025-11-29 07:37:02'),
(11, 2, 6, '2025-11-29 07:37:03'),
(12, 6, 1, '2025-11-29 07:39:10'),
(13, 6, 3, '2025-11-29 07:39:14'),
(14, 6, 2, '2025-11-29 07:39:14'),
(15, 6, 4, '2025-11-29 07:39:30'),
(16, 4, 2, '2025-11-29 07:45:55'),
(17, 4, 6, '2025-11-29 07:45:57'),
(18, 4, 3, '2025-11-29 07:45:57'),
(19, 1, 4, '2025-11-29 07:58:45'),
(20, 1, 3, '2025-11-29 07:58:45'),
(21, 1, 2, '2025-11-29 07:58:46'),
(22, 1, 6, '2025-11-29 07:58:46'),
(23, 1, 5, '2025-11-29 08:01:15'),
(24, 3, 2, '2025-11-29 08:05:21'),
(25, 6, 5, '2025-11-29 08:10:53'),
(26, 4, 5, '2025-11-29 08:15:24'),
(27, 5, 4, '2025-11-29 08:21:55'),
(28, 5, 6, '2025-11-29 08:21:56'),
(29, 5, 2, '2025-11-29 08:21:57'),
(30, 5, 3, '2025-11-29 08:21:57'),
(31, 5, 1, '2025-11-29 08:21:58'),
(33, 7, 1, '2025-12-27 08:26:37'),
(34, 7, 3, '2025-12-27 08:26:40'),
(35, 7, 6, '2025-12-27 08:26:45'),
(36, 7, 5, '2025-12-27 08:26:50'),
(37, 7, 4, '2025-12-27 08:26:59'),
(38, 7, 2, '2025-12-27 08:27:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoi_dung`
--

CREATE TABLE `nguoi_dung` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','moderator','admin') DEFAULT 'user',
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `password_reset_at` timestamp NULL DEFAULT NULL,
  `is_posting_blocked` tinyint(1) DEFAULT 0,
  `posting_blocked_until` datetime DEFAULT NULL,
  `is_commenting_blocked` tinyint(1) DEFAULT 0,
  `commenting_blocked_until` datetime DEFAULT NULL,
  `is_reporting_blocked` tinyint(1) DEFAULT 0,
  `reporting_blocked_until` datetime DEFAULT NULL,
  `monthly_post_violations` int(11) DEFAULT 0,
  `monthly_comment_violations` int(11) DEFAULT 0,
  `monthly_rejected_reports` int(11) DEFAULT 0,
  `last_violation_reset` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoi_dung`
--

INSERT INTO `nguoi_dung` (`id`, `username`, `email`, `password`, `role`, `avatar_url`, `bio`, `created_at`, `password_reset_at`, `is_posting_blocked`, `posting_blocked_until`, `is_commenting_blocked`, `commenting_blocked_until`, `is_reporting_blocked`, `reporting_blocked_until`, `monthly_post_violations`, `monthly_comment_violations`, `monthly_rejected_reports`, `last_violation_reset`) VALUES
(1, 'Thanh Duy', 'TigerDuy2000@gmail.com', '$2b$10$ho56zHRrYaan5avYuzbyo.fQYDw09w0QABK/uWwku4o4ri3dw/JMq', 'moderator', 'http://localhost:3001/uploads/aada7bbfff958274f349691fad627107.jpg', 'PiscesKing\n', '2025-11-28 02:44:14', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05'),
(2, 'Admin', 'admin@gmail.com', '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', 'admin', 'http://localhost:3001/uploads/9d90ac8330b74737a1742e512c480f6b.jpg', NULL, '2025-11-28 02:34:15', NULL, 0, NULL, 0, NULL, 1, '2026-01-26 15:25:53', 0, 0, 0, '2025-12-23 23:48:05'),
(3, 'Phú Đức', 'PhuDuc@gmail.com', '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', 'moderator', 'http://localhost:3001/uploads/e6441af822245d85a862a75d41834e9a.jpg', NULL, '2025-11-28 02:34:15', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05'),
(4, 'Gia Lộc', 'HaGiaLoc@gmail.com', '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', 'user', 'http://localhost:3001/uploads/e0e7bb40affc290f7e25aa21053559ed.jpg', NULL, '2025-11-28 02:34:15', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05'),
(5, 'Khải', 'PhanDinhKhai@gmail.com', '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', 'user', 'http://localhost:3001/uploads/ab74b79c8da59578160d6a3a8e9cbf5d.jpg', NULL, '2025-11-28 02:34:15', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05'),
(6, 'Hoàng Lăm', 'HLam@gmail.com', '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', 'user', 'http://localhost:3001/uploads/dd7db901e482223d4f85ce07a18536df.jpg', NULL, '2025-11-28 02:34:15', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05'),
(7, 'test', 'test@gmail.com', '$2b$10$qQ8T8ISY5PtDNp/a2pZFoe8H9Ji1j8y4My2CStJm3Vnt8b2Z1etWe', 'user', NULL, 'Tài khoảng test', '2025-12-06 20:01:26', NULL, 0, NULL, 0, NULL, 0, NULL, 0, 0, 0, '2025-12-23 23:48:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `sender_role` varchar(20) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'manual',
  `message` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `sender_id`, `receiver_id`, `sender_role`, `type`, `message`, `metadata`, `is_read`, `created_at`, `image_url`) VALUES
(1, 2, 5, 'admin', 'report_warning', 'Bạn nhận được một cảnh báo đến từ Admin (admin).\nĐã có một báo cáo về bài viết \"Bún Bò Huế\" của bạn với lý do: test\n.\nVui lòng phản hồi sớm nhất! Nếu không bài viết sẽ bị đánh dấu; bài viết bị đánh dấu 3 lần sẽ bị khóa bài viết.', '{\"recipe_id\": 19, \"report_id\": 3, \"has_reply\": true, \"reply_id\": 6}', 0, '2025-12-13 12:57:35', NULL),
(2, 5, 2, 'user', 'reply', 'Test', '{\"reply_to\":\"1\"}', 1, '2025-12-13 12:57:59', NULL),
(3, 5, 2, 'user', 'reply', 'test', '{\"reply_to\":\"1\"}', 1, '2025-12-13 12:58:12', NULL),
(4, 2, 1, 'admin', 'report_warning', 'Bạn nhận được một cảnh báo đến từ Admin (admin).\nĐã có một báo cáo về bài viết \"Bánh Mì Thịt Nướng\" của bạn với lý do: test\n.\nVui lòng phản hồi sớm nhất! Nếu không bài viết sẽ bị đánh dấu; bài viết bị đánh dấu 3 lần sẽ bị khóa bài viết.', '{\"recipe_id\": 33, \"report_id\": 4, \"has_reply\": true, \"reply_id\": 5}', 1, '2025-12-13 14:07:53', NULL),
(5, 1, 2, 'moderator', 'reply', 'test\n', '{\"reply_to\":\"4\"}', 1, '2025-12-13 15:07:48', NULL),
(6, 5, 2, 'user', 'reply', 'Test', '{\"reply_to\":\"1\"}', 1, '2025-12-14 10:57:22', NULL),
(7, 3, 4, 'moderator', 'report_warning', 'Bạn nhận được một cảnh báo đến từ Phú Đức (moderator).\nĐã có một báo cáo về bài viết \"Mì Xào Hải Sản\" của bạn với lý do: test.\nVui lòng phản hồi sớm nhất! Nếu không bài viết sẽ bị đánh dấu; bài viết bị đánh dấu 3 lần sẽ bị khóa bài viết.', '{\"recipe_id\":11,\"report_id\":6}', 0, '2025-12-23 13:16:42', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recipe_tags`
--

CREATE TABLE `recipe_tags` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `recipe_tags`
--

INSERT INTO `recipe_tags` (`id`, `recipe_id`, `tag_id`, `created_at`) VALUES
(1, 33, 1, '2025-12-27 04:00:36'),
(2, 33, 2, '2025-12-27 04:00:36'),
(3, 34, 10, '2025-12-27 04:01:07'),
(4, 31, 10, '2025-12-27 04:01:24'),
(5, 35, 10, '2025-12-27 04:02:36'),
(6, 35, 8, '2025-12-27 04:02:36'),
(7, 35, 2, '2025-12-27 04:02:36'),
(8, 21, 10, '2025-12-27 04:03:23'),
(9, 21, 2, '2025-12-27 04:03:23'),
(10, 21, 1, '2025-12-27 04:03:23'),
(11, 22, 10, '2025-12-27 04:03:49'),
(12, 22, 2, '2025-12-27 04:03:49'),
(13, 22, 1, '2025-12-27 04:03:49'),
(14, 22, 7, '2025-12-27 04:03:49'),
(15, 22, 3, '2025-12-27 04:03:49'),
(16, 23, 10, '2025-12-27 04:04:12'),
(17, 24, 10, '2025-12-27 04:04:28'),
(18, 24, 7, '2025-12-27 04:04:28'),
(19, 25, 10, '2025-12-27 04:04:42'),
(20, 11, 10, '2025-12-27 04:05:31'),
(21, 11, 2, '2025-12-27 04:05:31'),
(22, 12, 10, '2025-12-27 04:05:46'),
(23, 12, 9, '2025-12-27 04:05:46'),
(24, 13, 1, '2025-12-27 04:06:24'),
(25, 13, 2, '2025-12-27 04:06:24'),
(26, 13, 7, '2025-12-27 04:06:24'),
(27, 14, 7, '2025-12-27 04:06:49'),
(28, 14, 10, '2025-12-27 04:06:49'),
(29, 15, 1, '2025-12-27 04:07:42'),
(30, 15, 10, '2025-12-27 04:07:42'),
(31, 16, 10, '2025-12-27 04:08:16'),
(32, 17, 10, '2025-12-27 04:09:08'),
(33, 18, 8, '2025-12-27 04:09:25'),
(34, 18, 10, '2025-12-27 04:09:25'),
(35, 18, 7, '2025-12-27 04:09:25'),
(36, 20, 10, '2025-12-27 04:09:48'),
(37, 20, 7, '2025-12-27 04:09:48'),
(38, 20, 1, '2025-12-27 04:09:48'),
(39, 19, 10, '2025-12-27 04:10:10'),
(40, 6, 10, '2025-12-27 04:10:39'),
(41, 7, 8, '2025-12-27 04:11:06'),
(42, 7, 10, '2025-12-27 04:11:06'),
(43, 7, 9, '2025-12-27 04:11:06'),
(44, 8, 10, '2025-12-27 04:11:32'),
(45, 8, 8, '2025-12-27 04:11:32'),
(46, 9, 10, '2025-12-27 04:11:54'),
(47, 9, 1, '2025-12-27 04:11:54'),
(48, 10, 10, '2025-12-27 04:12:24'),
(49, 10, 9, '2025-12-27 04:12:24'),
(50, 10, 1, '2025-12-27 04:12:24'),
(52, 38, 10, '2025-12-27 06:11:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recipe_views`
--

CREATE TABLE `recipe_views` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `client_ip` varchar(45) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `recipe_views`
--

INSERT INTO `recipe_views` (`id`, `recipe_id`, `client_ip`, `user_agent`, `created_at`) VALUES
(1, 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 05:14:26'),
(2, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 05:21:21'),
(3, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 05:46:18'),
(4, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-10 07:09:53'),
(5, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-10 07:12:26'),
(6, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-10 07:22:01'),
(7, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 07:09:31'),
(8, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 08:28:17'),
(9, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:11:45'),
(10, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:16:00'),
(11, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:17:51'),
(12, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:43:20'),
(13, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:44:24'),
(14, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:48:54'),
(15, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:52:33'),
(16, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:54:09'),
(17, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:56:01'),
(18, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 09:57:25'),
(19, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:00:56'),
(20, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:02:49'),
(21, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:23:57'),
(22, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:42:13'),
(23, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:43:43'),
(24, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:43:48'),
(25, 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:43:50'),
(26, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 10:43:53'),
(27, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 11:31:21'),
(28, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 13:09:39'),
(29, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 14:07:34'),
(30, 34, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:09:08'),
(31, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:09:15'),
(32, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:15:48'),
(33, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:22:46'),
(34, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:27:52'),
(35, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:29:57'),
(36, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:38:48'),
(37, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 15:41:16'),
(38, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-13 16:32:52'),
(39, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 08:46:57'),
(40, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 08:48:38'),
(41, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 08:50:19'),
(42, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 08:52:42'),
(43, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 08:57:34'),
(44, 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 09:06:42'),
(45, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 10:55:40'),
(46, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 11:00:19'),
(47, 21, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-14 11:00:35'),
(48, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 07:33:11'),
(49, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:02:44'),
(50, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:14:31'),
(51, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:19:11'),
(52, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:30:49'),
(53, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:35:30'),
(54, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:35:33'),
(55, 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:35:36'),
(56, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:35:43'),
(57, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:35:54'),
(58, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:36:22'),
(59, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:36:55'),
(60, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:39:39'),
(61, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:44:33'),
(62, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:46:52'),
(63, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:46:59'),
(64, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:47:32'),
(65, 34, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:49:20'),
(66, 35, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 08:53:57'),
(67, 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:00:04'),
(68, 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:00:13'),
(69, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:00:22'),
(70, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:01:31'),
(71, 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:01:48'),
(72, 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:01:53'),
(73, 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:05:32'),
(74, 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:06:02'),
(75, 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:06:47'),
(76, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:08:44'),
(77, 9, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:12:49'),
(78, 10, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:16:35'),
(79, 9, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:16:54'),
(80, 16, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:22:24'),
(81, 17, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 09:25:59'),
(82, 16, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:10:48'),
(83, 17, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:10:51'),
(84, 18, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:11:30'),
(85, 18, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:13:19'),
(86, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:20:23'),
(87, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:27:36'),
(88, 18, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:28:01'),
(89, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:30:14'),
(90, 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:32:21'),
(91, 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:35:58'),
(92, 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:39:45'),
(93, 15, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:44:43'),
(94, 21, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:49:02'),
(95, 22, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:51:23'),
(96, 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:54:15'),
(97, 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:54:23'),
(98, 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:56:34'),
(99, 25, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 10:59:35'),
(100, 34, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:14'),
(101, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:17'),
(102, 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:22'),
(103, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:24'),
(104, 22, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:27'),
(105, 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:30'),
(106, 10, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:32'),
(107, 16, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:34'),
(108, 15, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:36'),
(109, 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:38'),
(110, 9, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:40'),
(111, 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:42'),
(112, 17, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:45'),
(113, 35, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:47'),
(114, 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:48'),
(115, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:51'),
(116, 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:00:56'),
(117, 21, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:01'),
(118, 18, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:07'),
(119, 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:10'),
(120, 25, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:14'),
(121, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:18'),
(122, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:22'),
(123, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:25'),
(124, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:01:29'),
(125, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:03:08'),
(126, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:08:44'),
(127, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:01'),
(128, 34, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:05'),
(129, 20, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:07'),
(130, 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:08'),
(131, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:09'),
(132, 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:10'),
(133, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:25'),
(134, 21, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:27'),
(135, 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:28'),
(136, 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:30'),
(137, 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:32'),
(138, 35, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:36'),
(139, 13, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:45'),
(140, 25, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:48'),
(141, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:51'),
(142, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:09:57'),
(143, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:10:31'),
(144, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:11:33'),
(145, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:16:29'),
(146, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:24:05'),
(147, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:25:11'),
(148, 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:35:52'),
(149, 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-15 11:36:58'),
(150, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-18 08:35:40'),
(151, 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-18 08:51:07'),
(152, 34, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-20 06:50:09'),
(153, 34, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-20 06:57:46'),
(154, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:07:22'),
(155, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:08:06'),
(156, 9, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:09:04'),
(157, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:12:54'),
(158, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:19:32'),
(159, 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 13:21:11'),
(160, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 15:54:12'),
(161, 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 18:30:40'),
(162, 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 18:32:34'),
(163, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 18:32:35'),
(164, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 18:38:43'),
(165, 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-23 18:43:56'),
(166, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-25 08:23:22'),
(167, 14, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-25 09:31:56'),
(168, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-25 09:35:07'),
(169, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 03:58:26'),
(170, 32, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 03:59:49'),
(171, 33, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:00:37'),
(172, 34, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:01:08'),
(173, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:01:25'),
(174, 35, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:02:37'),
(175, 21, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:02:52'),
(176, 22, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:03:50'),
(177, 23, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:04:15'),
(178, 24, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:04:29'),
(179, 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:04:43'),
(180, 11, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:05:32'),
(181, 12, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:05:47'),
(182, 13, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:06:25'),
(183, 14, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:06:50'),
(184, 15, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:07:07'),
(185, 16, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:08:23'),
(186, 17, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:09:09'),
(187, 18, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:09:26'),
(188, 20, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:09:49'),
(189, 19, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:10:11'),
(190, 6, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:10:40'),
(191, 7, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:11:08'),
(192, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:11:12'),
(193, 9, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:11:55'),
(194, 10, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:12:27'),
(195, 6, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 04:59:16'),
(196, 38, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:11:00'),
(197, 38, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:32:51'),
(198, 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:37:16'),
(199, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:37:34'),
(200, 38, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:38:32'),
(201, 32, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:39:37'),
(202, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:49:29'),
(203, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:54:02'),
(204, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 06:57:54'),
(205, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 07:26:37'),
(206, 38, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 07:26:40'),
(207, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 07:27:59'),
(208, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 07:34:22'),
(209, 32, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:00:15'),
(210, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:00:17'),
(211, 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:13:01'),
(212, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:13:10'),
(213, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:16:36'),
(214, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:26:35'),
(215, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:26:39'),
(216, 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:26:45'),
(217, 19, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:26:49'),
(218, 9, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 08:26:54'),
(219, 31, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-27 13:41:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recipe_violation_history`
--

CREATE TABLE `recipe_violation_history` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `violated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `step_images`
--

CREATE TABLE `step_images` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `step_index` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `step_images`
--

INSERT INTO `step_images` (`id`, `recipe_id`, `step_index`, `image_url`, `created_at`) VALUES
(4, 33, 0, 'http://localhost:3001/uploads/07378298d47cad706fd27ce01e922f99.webp', '2025-12-15 07:51:16'),
(5, 33, 0, 'http://localhost:3001/uploads/f3d90ead115b443fe7d908f09cae3714.webp', '2025-12-15 07:51:16'),
(6, 33, 0, 'http://localhost:3001/uploads/ae72953a6f8c69cf345c8c0a7146d164.webp', '2025-12-15 07:51:16'),
(7, 33, 1, 'http://localhost:3001/uploads/6cf2448ece84ca59c59ff5e56bbbcdea.webp', '2025-12-15 07:51:17'),
(8, 33, 1, 'http://localhost:3001/uploads/8529f0708345737df0b95c0ab7c7f908.webp', '2025-12-15 07:51:17'),
(9, 33, 1, 'http://localhost:3001/uploads/8ab801bf0243f01a8b351776df4c99b3.webp', '2025-12-15 07:51:17'),
(10, 33, 2, 'http://localhost:3001/uploads/ae2cb9b05b28031f7b0fbcc01a5918f1.webp', '2025-12-15 07:51:17'),
(11, 33, 2, 'http://localhost:3001/uploads/44b67ae7773b85b929d3eba34940caae.webp', '2025-12-15 07:51:17'),
(36, 33, 3, 'http://localhost:3001/uploads/d93dbc0e15e88c9e5c8acb06f87cb224.webp', '2025-12-15 08:02:40'),
(37, 33, 3, 'http://localhost:3001/uploads/dca652a81d1086e110a179e28e3057ee.webp', '2025-12-15 08:02:40'),
(38, 33, 4, 'http://localhost:3001/uploads/5e15915ba343df0a396d8f4cfa1ea029.webp', '2025-12-15 08:02:41'),
(39, 33, 4, 'http://localhost:3001/uploads/8c1404c6e8fa09e4bd77155883412db6.webp', '2025-12-15 08:02:41'),
(40, 33, 5, 'http://localhost:3001/uploads/d95ef6749766eb3e6cdef6eb79757fd4.webp', '2025-12-15 08:02:41'),
(41, 33, 6, 'http://localhost:3001/uploads/0427365710ddf8b43dc4a82a1538572b.webp', '2025-12-15 08:02:42'),
(42, 33, 6, 'http://localhost:3001/uploads/77de611cb371ee0ebd700c6b5cf0e0c6.webp', '2025-12-15 08:02:42'),
(43, 33, 6, 'http://localhost:3001/uploads/df16ea171719cb30ee5821d4c4be1630.webp', '2025-12-15 08:02:42'),
(63, 33, 7, 'http://localhost:3001/uploads/b0beaa7fdbd67d84fc7ff9c2a1902101.webp', '2025-12-15 08:31:34'),
(64, 33, 7, 'http://localhost:3001/uploads/9c1a309fd4ba77282383892d0550f963.webp', '2025-12-15 08:31:34'),
(65, 33, 7, 'http://localhost:3001/uploads/fd1a0062919c2d3c4241615be5812b4e.webp', '2025-12-15 08:31:34'),
(69, 31, 1, 'http://localhost:3001/uploads/9111976086ad3779caca3086206bda97.webp', '2025-12-15 08:44:58'),
(70, 31, 3, 'http://localhost:3001/uploads/0ee445934f3e9180450b915e81828679.webp', '2025-12-15 08:44:58'),
(71, 31, 3, 'http://localhost:3001/uploads/efcfaf722290f6035228364baeb7e9c5.webp', '2025-12-15 08:44:58'),
(72, 34, 3, 'http://localhost:3001/uploads/86207c16d8a9620116daa75a1af056b3.webp', '2025-12-15 08:49:19'),
(73, 35, 0, 'http://localhost:3001/uploads/11075b8d1fba1dd8d9492d85592f0373.webp', '2025-12-15 08:53:46'),
(74, 35, 0, 'http://localhost:3001/uploads/9d6c6e1b204f6def5a07625ab03e28e1.webp', '2025-12-15 08:53:46'),
(75, 35, 0, 'http://localhost:3001/uploads/d6b320c5f96069fa10b82459fbcebd85.webp', '2025-12-15 08:53:46'),
(76, 35, 1, 'http://localhost:3001/uploads/69d2cad36ef34d0dc9a46be40baa59b2.webp', '2025-12-15 08:53:47'),
(77, 35, 1, 'http://localhost:3001/uploads/af76b0bb7336ab0459facca7eeb42d66.webp', '2025-12-15 08:53:47'),
(78, 35, 2, 'http://localhost:3001/uploads/c5515ace1198605d0dc059ce396c4f93.webp', '2025-12-15 08:53:47'),
(79, 35, 3, 'http://localhost:3001/uploads/e03dab1c1250716e7a8234da81b1f039.webp', '2025-12-15 08:53:48'),
(80, 35, 3, 'http://localhost:3001/uploads/f2a6f9dcd31af4d15d03cf8768fc3522.webp', '2025-12-15 08:53:48'),
(81, 35, 4, 'http://localhost:3001/uploads/ca2e72e83dd871371018b821eae70292.webp', '2025-12-15 08:53:48'),
(82, 6, 0, 'http://localhost:3001/uploads/6cf064ad73b262af89cae1ca0fe7ba58.webp', '2025-12-15 09:00:00'),
(83, 6, 0, 'http://localhost:3001/uploads/45590dc694aefcf54ea8e7943e5349e4.webp', '2025-12-15 09:00:00'),
(84, 6, 0, 'http://localhost:3001/uploads/83984de7f32e5ccb0c44bc733e654032.webp', '2025-12-15 09:00:00'),
(85, 6, 1, 'http://localhost:3001/uploads/1598d0e0fc3280ee6ffb8fde594c75d2.webp', '2025-12-15 09:00:00'),
(86, 6, 1, 'http://localhost:3001/uploads/905d88d464e1de03149126d6a30a6acd.webp', '2025-12-15 09:00:00'),
(87, 6, 2, 'http://localhost:3001/uploads/a11730b901cc358ad22a3d1294f05529.webp', '2025-12-15 09:00:01'),
(88, 6, 2, 'http://localhost:3001/uploads/0e43b4874f4cf0242b1c8b277f7ae502.webp', '2025-12-15 09:00:01'),
(89, 6, 2, 'http://localhost:3001/uploads/ecb6ebeec3b26b7ed597131753ea8bc3.webp', '2025-12-15 09:00:01'),
(90, 6, 3, 'http://localhost:3001/uploads/b85650f2fb326eb9e4cbb31b6c2e265e.webp', '2025-12-15 09:00:01'),
(91, 6, 3, 'http://localhost:3001/uploads/bb9fe4fd96f117fd88c58a047db603be.webp', '2025-12-15 09:00:01'),
(92, 6, 3, 'http://localhost:3001/uploads/e47b1f777fa013b5f1d88a0b44c40b28.webp', '2025-12-15 09:00:01'),
(93, 6, 4, 'http://localhost:3001/uploads/37c61b44e17836933eae1a49172aa2b2.webp', '2025-12-15 09:00:02'),
(94, 6, 4, 'http://localhost:3001/uploads/20d4a56a2bf7a2921440a914ab63b2aa.webp', '2025-12-15 09:00:02'),
(95, 6, 4, 'http://localhost:3001/uploads/3bcf1fa4c925b32e8e2aff578abc9e5f.webp', '2025-12-15 09:00:02'),
(96, 6, 5, 'http://localhost:3001/uploads/75b095c10a9c08f54d1b2ba87219d3b1.webp', '2025-12-15 09:00:02'),
(97, 6, 5, 'http://localhost:3001/uploads/3eb943aba14e2a0fc95f39c1170f8319.webp', '2025-12-15 09:00:02'),
(98, 7, 0, 'http://localhost:3001/uploads/7d356f31eb9ea64da41c4515563f2e20.webp', '2025-12-15 09:05:28'),
(99, 7, 0, 'http://localhost:3001/uploads/d7496cd9223d516b5c545c7bc8b30be5.webp', '2025-12-15 09:05:28'),
(100, 7, 0, 'http://localhost:3001/uploads/15e5c6afa5eb3edd9b0dfa68ff7d86fd.webp', '2025-12-15 09:05:28'),
(101, 7, 1, 'http://localhost:3001/uploads/b474f370c4dd3c8878f0686fba4efc1c.webp', '2025-12-15 09:05:29'),
(102, 7, 1, 'http://localhost:3001/uploads/b34cab7f93157301a83680282af6d69c.webp', '2025-12-15 09:05:29'),
(103, 7, 1, 'http://localhost:3001/uploads/486bd7063120d1d6628620877cc3f138.webp', '2025-12-15 09:05:29'),
(104, 7, 2, 'http://localhost:3001/uploads/03f2eb1810fa33fab660c326d2d36a15.webp', '2025-12-15 09:05:29'),
(105, 7, 2, 'http://localhost:3001/uploads/588302d70b10fcea70a2480e5cddc303.webp', '2025-12-15 09:05:29'),
(106, 9, 0, 'http://localhost:3001/uploads/7758e3e64f256c7c876d6124a0adb78d.webp', '2025-12-15 09:12:46'),
(107, 9, 2, 'http://localhost:3001/uploads/2b57b3edfbab974ad286de977541f178.webp', '2025-12-15 09:12:46'),
(108, 9, 3, 'http://localhost:3001/uploads/27e2c28692786e59aa7e96e603feaca3.webp', '2025-12-15 09:12:47'),
(109, 9, 4, 'http://localhost:3001/uploads/28d74072cb01cbf7026446492348a7b3.webp', '2025-12-15 09:12:47'),
(110, 9, 5, 'http://localhost:3001/uploads/e35d83aedeffde85dfe31d58aae86a0d.webp', '2025-12-15 09:12:48'),
(111, 10, 0, 'http://localhost:3001/uploads/f3e59f03f44f3239ea3f95783edee372.webp', '2025-12-15 09:16:30'),
(112, 10, 1, 'http://localhost:3001/uploads/e1661e165ee6a77b175580979788ad4f.webp', '2025-12-15 09:16:31'),
(113, 10, 1, 'http://localhost:3001/uploads/2203196adaccf5022538ba5e2823023c.webp', '2025-12-15 09:16:31'),
(114, 10, 2, 'http://localhost:3001/uploads/538d2ba3034de23b5345bd9d2108161f.webp', '2025-12-15 09:16:31'),
(115, 10, 3, 'http://localhost:3001/uploads/5b651135d03eccda618c236a6b0caf12.webp', '2025-12-15 09:16:32'),
(116, 10, 3, 'http://localhost:3001/uploads/4232f7741eedf0c2bd265c4e5b034a7d.webp', '2025-12-15 09:16:32'),
(117, 10, 4, 'http://localhost:3001/uploads/b9f9820f723bdbe83ffb03038162c5ff.webp', '2025-12-15 09:16:32'),
(118, 10, 5, 'http://localhost:3001/uploads/6a489ed0086042e18601adb9a5763414.webp', '2025-12-15 09:16:33'),
(119, 16, 0, 'http://localhost:3001/uploads/e5fe217339292477251051bf7d783bd6.webp', '2025-12-15 09:22:20'),
(120, 16, 0, 'http://localhost:3001/uploads/38e0e1d08eebfb62399850afbab52d5a.webp', '2025-12-15 09:22:20'),
(121, 16, 0, 'http://localhost:3001/uploads/fd471aa4fbb2a8ba2818d6c73431bcf9.webp', '2025-12-15 09:22:20'),
(122, 16, 1, 'http://localhost:3001/uploads/2cc55333f8a85d162607bc2a28df515f.webp', '2025-12-15 09:22:21'),
(123, 16, 1, 'http://localhost:3001/uploads/e90b98fe64a7e2fe8bad709ccc338cb4.webp', '2025-12-15 09:22:21'),
(124, 16, 2, 'http://localhost:3001/uploads/7e9aec6c54e533bd6e9e7f08fdd678e0.webp', '2025-12-15 09:22:21'),
(125, 16, 2, 'http://localhost:3001/uploads/fdf590eb7613d164e4f2fc7417c3d5e0.webp', '2025-12-15 09:22:21'),
(126, 16, 2, 'http://localhost:3001/uploads/e17c36aa5fa1c9c4325af4ec535c8648.webp', '2025-12-15 09:22:21'),
(127, 17, 0, 'http://localhost:3001/uploads/742356c54ae64da55712580181e749c9.webp', '2025-12-15 09:25:55'),
(128, 17, 0, 'http://localhost:3001/uploads/1a6e3cfd991024d6a0752886c6110ef6.webp', '2025-12-15 09:25:55'),
(129, 17, 1, 'http://localhost:3001/uploads/daadd1cf553aefa97f4fda73d73a2189.webp', '2025-12-15 09:25:56'),
(130, 17, 1, 'http://localhost:3001/uploads/2be88711e2cf7ac1866a922287fe3f9c.webp', '2025-12-15 09:25:56'),
(131, 17, 1, 'http://localhost:3001/uploads/fef0e7ffbf7171eafb456a897a363d41.webp', '2025-12-15 09:25:56'),
(132, 17, 2, 'http://localhost:3001/uploads/3823feda0c9b44070826de49b0d3f92d.webp', '2025-12-15 09:25:56'),
(133, 17, 2, 'http://localhost:3001/uploads/5f830798165f3690efc1bc6d4e74d2d1.webp', '2025-12-15 09:25:56'),
(134, 17, 3, 'http://localhost:3001/uploads/94ca34e0f51639180cca07c9a08e20c7.webp', '2025-12-15 09:25:57'),
(135, 17, 3, 'http://localhost:3001/uploads/3073873ee1f651fbdb528bfacd06e21f.webp', '2025-12-15 09:25:57'),
(136, 18, 0, 'http://localhost:3001/uploads/a1b9bcfcbde2c51eef6373ec3edb47b1.webp', '2025-12-15 10:13:15'),
(137, 18, 0, 'http://localhost:3001/uploads/d603178cb2b69b211467e63df0c07db8.webp', '2025-12-15 10:13:15'),
(138, 19, 5, 'http://localhost:3001/uploads/ad93a4dc5c22c6c1d6541a304ee4238a.webp', '2025-12-15 10:20:21'),
(139, 19, 5, 'http://localhost:3001/uploads/bf9321d59e2c18bebc7ec10c7a318c04.webp', '2025-12-15 10:20:21'),
(140, 20, 0, 'http://localhost:3001/uploads/d326fcef1d89bb0db45ae3e6dcc05db7.webp', '2025-12-15 10:27:17'),
(141, 20, 1, 'http://localhost:3001/uploads/fb53b23b131119344f233c41c6468db2.webp', '2025-12-15 10:27:18'),
(142, 20, 2, 'http://localhost:3001/uploads/c8b83b55b0b6c06badbb24faecb15c5d.webp', '2025-12-15 10:27:18'),
(143, 20, 3, 'http://localhost:3001/uploads/f26c4b2bc30f7294065ad58940bde82d.webp', '2025-12-15 10:27:19'),
(144, 20, 4, 'http://localhost:3001/uploads/75a073b7dce4ae8067483c5289d14df9.webp', '2025-12-15 10:27:19'),
(145, 20, 5, 'http://localhost:3001/uploads/b4a7ff4686445619e0aeb264768cb888.webp', '2025-12-15 10:27:20'),
(146, 20, 6, 'http://localhost:3001/uploads/4010fd30e5271b19165128d7339721c0.webp', '2025-12-15 10:27:20'),
(147, 20, 7, 'http://localhost:3001/uploads/931aec8341a864821a63380d3a69838e.webp', '2025-12-15 10:27:21'),
(148, 20, 8, 'http://localhost:3001/uploads/4d68b1d4c1b22045ec01e73d441748bf.webp', '2025-12-15 10:27:21'),
(149, 20, 9, 'http://localhost:3001/uploads/80c245fc26577ab74902c69e9818c323.webp', '2025-12-15 10:27:22'),
(150, 20, 10, 'http://localhost:3001/uploads/9a5d15c2d774b2de864387d8e2c88f67.webp', '2025-12-15 10:27:23'),
(151, 20, 11, 'http://localhost:3001/uploads/3cbf83e5d6dd91c3c50b1aac0e4b9762.webp', '2025-12-15 10:27:23'),
(152, 20, 12, 'http://localhost:3001/uploads/e0bd5214dd3583ee13af0c428cfb570d.webp', '2025-12-15 10:27:24'),
(153, 12, 2, 'http://localhost:3001/uploads/9871d1d376eb22ddbc49d2d5bc3f4a9f.webp', '2025-12-15 10:32:19'),
(154, 12, 2, 'http://localhost:3001/uploads/3a26d7a02e0b66044481a24ff7f3e0b8.webp', '2025-12-15 10:32:19'),
(155, 13, 0, 'http://localhost:3001/uploads/2d5a61203aad28186093867301b24e03.webp', '2025-12-15 10:35:51'),
(156, 13, 1, 'http://localhost:3001/uploads/9c9b2abe69203e295d4f179cf7116c4e.webp', '2025-12-15 10:35:51'),
(157, 13, 5, 'http://localhost:3001/uploads/cf6feb223f4e852714af500aed63bfab.webp', '2025-12-15 10:35:52'),
(158, 13, 6, 'http://localhost:3001/uploads/f1f84a6b2d2f7a62b0ad8875af99d97f.webp', '2025-12-15 10:35:52'),
(159, 13, 8, 'http://localhost:3001/uploads/0f3b039be1f97c032b8d73324b8983cf.webp', '2025-12-15 10:35:53'),
(160, 13, 8, 'http://localhost:3001/uploads/639e8b3bcb4117856f329c9f8134db0d.webp', '2025-12-15 10:35:53'),
(161, 14, 0, 'http://localhost:3001/uploads/f178fdf48a3212196c8564c5661738e0.webp', '2025-12-15 10:39:41'),
(162, 14, 1, 'http://localhost:3001/uploads/9414e72c081c671d798fc8a0afe506a4.webp', '2025-12-15 10:39:41'),
(163, 14, 1, 'http://localhost:3001/uploads/7bba62972814b32d2b05b2ed8fffcb19.webp', '2025-12-15 10:39:41'),
(164, 14, 2, 'http://localhost:3001/uploads/4338863e10ae909e3ebb58edfe04cda9.webp', '2025-12-15 10:39:42'),
(165, 14, 3, 'http://localhost:3001/uploads/54dbe04dc7c679a15efc0ab20b82c2b8.webp', '2025-12-15 10:39:42'),
(166, 15, 0, 'http://localhost:3001/uploads/c645a30a791cd38bf5d414978d5d21f0.webp', '2025-12-15 10:44:40'),
(167, 15, 0, 'http://localhost:3001/uploads/6289b4c441a2ae520a04c45d0e52e75a.webp', '2025-12-15 10:44:40'),
(168, 15, 0, 'http://localhost:3001/uploads/f76a2ccf3171fb597a75e246d6676ab1.webp', '2025-12-15 10:44:40'),
(169, 15, 1, 'http://localhost:3001/uploads/acbf8f965e9530cc4a87165f4ce88258.webp', '2025-12-15 10:44:40'),
(170, 15, 1, 'http://localhost:3001/uploads/8faa02dad2d4964481aa28c638c4db14.webp', '2025-12-15 10:44:40'),
(171, 15, 1, 'http://localhost:3001/uploads/2266f5fe9b968cff174d335e1f057691.webp', '2025-12-15 10:44:40'),
(172, 15, 2, 'http://localhost:3001/uploads/c26700217b5a80673523fc7b4840e44b.webp', '2025-12-15 10:44:41'),
(173, 15, 2, 'http://localhost:3001/uploads/57a06aa4c991b0a67737c8508287011c.webp', '2025-12-15 10:44:41'),
(174, 21, 0, 'http://localhost:3001/uploads/1c919f4cf2cb4d0a92ef8cd987796507.webp', '2025-12-15 10:48:56'),
(175, 21, 0, 'http://localhost:3001/uploads/ee517ad332715e16524d18454b014695.webp', '2025-12-15 10:48:56'),
(176, 21, 0, 'http://localhost:3001/uploads/f2dfd1ecf54fbda478ee255504b8b57a.webp', '2025-12-15 10:48:56'),
(177, 21, 0, 'http://localhost:3001/uploads/e7c40166fa328024c94cfeeea063fd67.webp', '2025-12-15 10:48:56'),
(178, 21, 0, 'http://localhost:3001/uploads/74f0f0da45e758fdc83d31122535c3ff.webp', '2025-12-15 10:48:56'),
(179, 21, 0, 'http://localhost:3001/uploads/b2b32de4b58c2d2ccd840d510c0abf98.webp', '2025-12-15 10:48:56'),
(180, 21, 1, 'http://localhost:3001/uploads/ea4f23b6f1d9e6153dfb7dbed00c8340.webp', '2025-12-15 10:48:56'),
(181, 21, 1, 'http://localhost:3001/uploads/0d4abe8d9566833a8e3f0225009d2eb7.webp', '2025-12-15 10:48:56'),
(182, 21, 1, 'http://localhost:3001/uploads/571d272f24c599b8fd29ce2fbd9a2d04.webp', '2025-12-15 10:48:56'),
(183, 21, 1, 'http://localhost:3001/uploads/3b84137c89a4ebccdd268008ffb130dd.webp', '2025-12-15 10:48:56'),
(184, 21, 1, 'http://localhost:3001/uploads/97cb560294e9097b43569961f0b94b14.webp', '2025-12-15 10:48:56'),
(185, 21, 1, 'http://localhost:3001/uploads/30ea0df2a527fc710daf78aa15fee500.webp', '2025-12-15 10:48:56'),
(186, 22, 0, 'http://localhost:3001/uploads/a448c288559233abd426b9b2306e1615.webp', '2025-12-15 10:51:21'),
(187, 22, 0, 'http://localhost:3001/uploads/c85071b0dc3ea76aecc6bd65b875af0e.webp', '2025-12-15 10:51:21'),
(188, 22, 1, 'http://localhost:3001/uploads/86bb7039ab32f50008e6fc7eee9cb6aa.webp', '2025-12-15 10:51:21'),
(189, 22, 2, 'http://localhost:3001/uploads/1f4cebfef69d92f68cdffd0fc7ac33d5.webp', '2025-12-15 10:51:22'),
(190, 22, 2, 'http://localhost:3001/uploads/4e633beafe94793e44579fae8926e0ef.webp', '2025-12-15 10:51:22'),
(191, 22, 2, 'http://localhost:3001/uploads/0cc30c451e3d84637f8073d107e24fbf.webp', '2025-12-15 10:51:22'),
(192, 23, 0, 'http://localhost:3001/uploads/25ec40c639a42c56cc711820a8626c6a.webp', '2025-12-15 10:54:12'),
(193, 23, 0, 'http://localhost:3001/uploads/1cd41da74924c75231522bee33483919.webp', '2025-12-15 10:54:12'),
(194, 23, 1, 'http://localhost:3001/uploads/07f189c1256814c267ba75b0ade61e80.webp', '2025-12-15 10:54:12'),
(195, 23, 2, 'http://localhost:3001/uploads/387d1da040ed3c383f9f979f830eeeda.webp', '2025-12-15 10:54:13'),
(196, 24, 0, 'http://localhost:3001/uploads/246c9d41a60dabbb57e3c0d7f1da8f9d.webp', '2025-12-15 10:56:31'),
(197, 24, 1, 'http://localhost:3001/uploads/29b9495a35afad4ccafb7952e77e1dc7.webp', '2025-12-15 10:56:32'),
(198, 24, 2, 'http://localhost:3001/uploads/04426841a6891b92326cce8cc1fb2ae0.webp', '2025-12-15 10:56:32'),
(199, 24, 2, 'http://localhost:3001/uploads/e684f6d8c1710e2131754ed012cca932.webp', '2025-12-15 10:56:32'),
(200, 25, 0, 'http://localhost:3001/uploads/b6faf3a6f7a0eb8b3ce53a26ae24f20c.webp', '2025-12-15 10:59:32'),
(201, 25, 1, 'http://localhost:3001/uploads/5c254021e933f53e182582ecede6099f.webp', '2025-12-15 10:59:32'),
(202, 25, 1, 'http://localhost:3001/uploads/091ab384329acab7e8c6066f12ae84d1.webp', '2025-12-15 10:59:32'),
(203, 25, 2, 'http://localhost:3001/uploads/530a0151f6a93560252a808e9bdce919.webp', '2025-12-15 10:59:33'),
(204, 38, 0, 'http://localhost:3001/uploads/4abba6da604fcdc80ade29a763320226.webp', '2025-12-27 06:10:54'),
(205, 38, 4, 'http://localhost:3001/uploads/30d1a3ec7c8c2b9cca9157bada28ee87.webp', '2025-12-27 06:10:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `usage_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `usage_count`, `created_at`) VALUES
(1, 'Dễ làm', 'de-lam', 8, '2025-12-27 03:37:35'),
(2, 'Nhanh gọn', 'nhanh-gon', 6, '2025-12-27 03:37:35'),
(3, 'Healthy', 'healthy', 1, '2025-12-27 03:37:35'),
(4, 'Ít calo', 'it-calo', 0, '2025-12-27 03:37:35'),
(5, 'Chay', 'chay', 0, '2025-12-27 03:37:35'),
(6, 'Không gluten', 'khong-gluten', 0, '2025-12-27 03:37:35'),
(7, 'Cho trẻ em', 'cho-tre-em', 6, '2025-12-27 03:37:35'),
(8, 'Tiệc tùng', 'tiec-tung', 4, '2025-12-27 03:37:35'),
(9, 'Ngày lễ', 'ngay-le', 3, '2025-12-27 03:37:35'),
(10, 'Gia đình', 'gia-dinh', 23, '2025-12-27 03:37:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_broadcast_read`
--

CREATE TABLE `user_broadcast_read` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `broadcast_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_report_quota`
--

CREATE TABLE `user_report_quota` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `report_type` enum('recipe','comment','user') NOT NULL,
  `remaining_reports` int(11) DEFAULT 3,
  `last_reset` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_report_quota`
--

INSERT INTO `user_report_quota` (`id`, `user_id`, `report_type`, `remaining_reports`, `last_reset`) VALUES
(1, 2, 'comment', 1, '2025-12-27 14:38:09'),
(2, 1, 'user', 3, '2025-12-27 14:40:16'),
(3, 2, 'user', 3, '2025-12-27 15:14:57'),
(4, 7, 'user', 3, '2025-12-27 15:27:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_theme_preferences`
--

CREATE TABLE `user_theme_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `primary_color` varchar(7) DEFAULT '#ff7f50',
  `background_image` longtext DEFAULT NULL,
  `theme_name` varchar(100) DEFAULT NULL,
  `is_shared` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_theme_preferences`
--

INSERT INTO `user_theme_preferences` (`id`, `user_id`, `primary_color`, `background_image`, `theme_name`, `is_shared`, `created_at`, `updated_at`) VALUES
(1, 1, '#ff7f50', NULL, 'Custom Theme', 1, '2025-12-13 10:47:58', '2025-12-23 17:39:13');
INSERT INTO `user_theme_preferences` (`id`, `user_id`, `primary_color`, `background_image`, `theme_name`, `is_shared`, `created_at`, `updated_at`) VALUES
(2, 2, '#ff7f50', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYanhsIARAAABtbnRyUkdCIFhZWiAH4wAMAAEAAAAAAABhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLWp4bCACufkBQHM6b/D/A/Tw9worAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtkZXNjAAABCAAAAERjcHJ0AAABTAAAACR3dHB0AAABcAAAABRjaGFkAAABhAAAACxjaWNwAAABsAAAAAxyWFlaAAABvAAAABRnWFlaAAAB0AAAABRiWFlaAAAB5AAAABRyVFJDAAAB+AAAACBnVFJDAAAB+AAAACBiVFJDAAAB+AAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACYAAAAcAFIARwBCAF8ARAA2ADUAXwBTAFIARwBfAFIAZQBsAF8AUwBSAEcAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAABgAAABwAQwBDADAAAFhZWiAAAAAAAAD21gABAAAAANMtc2YzMgAAAAAAAQxAAAAF3f//8yoAAAeSAAD9kP//+6P///2jAAAD2wAAwIFjaWNwAAAAAAENAAFYWVogAAAAAAAAb58AADj1AAADkFhZWiAAAAAAAABilgAAt4cAABjbWFlaIAAAAAAAACSiAAAPhQAAttZwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKW//bAEMAAgEBAQEBAgEBAQICAgICBAMCAgICBQQEAwQGBQYGBgUGBgYHCQgGBwkHBgYICwgJCgoKCgoGCAsMCwoMCQoKCv/bAEMBAgICAgICBQMDBQoHBgcKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCv/AABEIBaAKAAMBEQACEQEDEQH/xAAeAAEAAgMBAQEBAQAAAAAAAAAAAwgGBwkFBAIBCv/EAGoQAQABAwICBAgEDQ0MBwYEBwAEAwUGAQcIFAkTIzMRFSQ0Q0RTVAIWMWMXISU1QVFVZHJzdIKSJkJFYWJxgYOEkZTC0hIZMjY3UmWToaOz4goYInWissMnKDhGVvNXsdPj8BpHlaTBhf/EABwBAQACAwEBAQAAAAAAAAAAAAADBAUGBwIBCP/EADMRAQABBAAFAgUEAwACAwEBAAAEAQIDBQYREhQxEyEVIjIzNCMkQVEWQlJDRFNhcSWB/9oADAMBAAIRAxEAPwDpQ2hoYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACRYRo1dIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBII0YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQEYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAEgjRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBYRiukRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkASCNGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJARgAAkRiNIACMEgAAAIwSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIACMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEYrpAAABYRiukAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgI1hGkV0iMAAABYRgJFdIAjAAAAAAWEaRXSIwSAjSIwEiNIjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhGK6QSIwAEiNIjWEYjEiNIAAAAjSI0iNIjAAABICMBIjAEaQSIxGkFhGK6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhGkV0iMAEgI0iMASAjSCMSAjASIwAAAAABICukAAEiMAAASAjBICMEaRIACMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEYArpAEgI0iNIjSAI0iMSAjASI1cSJASIwAABGkEiMRpEgAAIwASAjSI0iNIAjASIxIACMAAAEgkV0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEaRXSIwASAAAAAjSIxICMAAAEaRICMEgAAAAAI0iMSCRXSI1hGIwRpABYRpFdIAjWEYArpBIjARq6RIkEgAAI1hGK6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjAAAAAAWEaRXSIwFhGK6RICNIjAEaQSIwAAAAAABGkEiNIjSIwEiMAASCRXSI0iMSArpAEgAAAI0iNIjSIwSAjWEaRXSAAAI0iMAABIjSAI1hGkV0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEYArpABYRiukAFhGIwRpAAAAAEgI1hGK6QAAAWEYjBICukSAjWEYrpAEgI0iNIjSAAI0iMSAAjBIACMEaQSIxGkSAjASI0iNIjAWEYjEiNIAAAjSIxGkSAjAWEaRXSI1hGkV0iNIjEgkV0iNYRiukEiMBIjSIwARgkSAkRiMEaQSIxGkFhGK6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhGkV0iMAAAAABYRpFdIAjABICNIjSI0iMEgI0iNIjSAAAAAI1hGkV0iMAAAEgAAAI1hGkV0gACNIjAAAAAEgIwRpBIjEgIxIjSAI0iMAABIjSAAAAAI0iMAAASArpEgI1hGkV0iMAAEgI1hGkV0iNIjEaQBGCRGCQAEiMRpBIjEgIxIjSIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYRiukEiMSArpABYRiukAFhGK6RICNYRiukAASAjWEaRXSAI1hGkV0iMAEgI0iMBIjSI1hGkV0iNIjAAAAASI0iMEgI1hGkV0iNYRiukAFhGK6QWEaRXSI1hGIwARpBIjEaRIACNIjEaRIACNIjSI0iNYRiMEaRIACMBIjAAAAASI0iNIjEaRIACMAAAAAAAAAEgI1hGK6QAASIwAAAABGkEiNIjSIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIjAASI0iMEgI0iNIjSAAAAI1hGkV0gCNYRpFdIjSIwBIJFdIjWEaRXSI0iMARpBIjASI0gCMBIjEgAIwRpAABYRpFdIjSIwEiNIjABGjEiQASAAAAAjWEYrpABIjAASI0gAACMBIjAAAAAEaQSIwEiNIjBICNYRpFdIjWEYrpAAAAAAAAAAEgI0iMBIjSI0iMRpEgAAI0iMASAjBGkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgI0iMBIjSIwAAAAFhGkV0gACMBIjSI0iMEgI1hGkV0iNYRiMAEgkV0gCNYRpFdIjBIAAACNYRiukEiNIjSAI0iNIjSAI1hGIwASAAAjBGkSAjSI0iNIAjSIxGkAAEYJAASIwABICukAAASAjASIwAAAAAEiNIAAAjSIwEiNIAjAAAWEaRXSIwAAAAAAAAAAAASAjSI0iNIjASIwAEiNIjSIxICMSI0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABICNYRpFdIAjSIxIACMEaQAWEaRXSAI0iMAAAABIjSI1hGK6QABIAAACMEgI1hGK6QAWEYArpAEgI1hGK6QWEaRXSAI1hGK6QBICMBIjEgIwRpEgI0iMBIjSI1hGkV0iMAAAAEgI0iMRpEgAAAI0iNIjSI1hGIwSAAjBGkSAjSIwEiNIjAAASIwEiNIjWEYrpAAAAAAAAAAAAAAAAAABIjAAAEaQSI0iNIAjSI0iNIAjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjSIxGkEiMAASAAjEaNIkASIwAAABGkSAAAAAjABICNYRiMAEaQAWEaRXSIwASAAAAjSIxGkFhGkV0gCNYRpFdIAjAAWEYjAAAEiNIAjWEaRXSAIwAAAFhGkV0gCNIjAAAAAAASI0gCNIjAEgIwRpAEgI1hGK6QAAAAAAAAAAAAAAAAAAAAAAAAABIAACNIjAEaQABICNIjAEaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjSIxICMEgIwRpBIjAAEaRIAAACMBIjASI0iNYRiMAEgK6QASIxGkAEiNIjSAI1hGK6QAWEaRXSI0iMBIjSI0iMARpBIjAEaQSIwBICukASAAAAjWEYrpAABYRiukAAASAjWEaRXSAAAAAAAAI1hGK6QBICNIjSI0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAIwAAFhGK6QSI0iNIjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhGK6QSIxIAACMEaRIACNYRiMAAAAASI0gAAAAAACNIjAAEgIwBIjSIwAASAjSIxGkEiMRpBIjSI0iNIjASI0iNIjEaRICMAAAAAAAAAAAEgI0iNIjSIwSAAjWEYrpEgI1hGK6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABICNYRiukAEiMARpAAEgI0iMARpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEaRXSI0iMAAAAABIjSAAAAAAAAI0iMAAAASArpAEgI0iMARpBYRiukAAAAFhGkV0iNYRpFdIjWEaRXSAI1hGkV0gCNYRiukAAAAAAAAAFhGK6QAWEYjBIJFdIjWEYrpAABYRpFdIjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEaRXSIwRgkSAI0iNIAjSI0iNIAAjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAjABGjEiwjEgIxIjSI0iMAAASCRXSI1hGIwARpBIjSI0iMAAAEgIwASAjAAAAAAAAAAAAAAAAAAAAAAAAAAAAABICMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgI0iMAEgjBYRpFdIjSIxICMAEaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhGK6QSIxGkAEiMAAAAAASAjBGkSJBGkRpEaQRiMEgIwEiMARpEgIwAAFhGK6QAAWEYrpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgI0iMSAjAEiNIAAjSIxIACMSI0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASIwBICNIjVxIsAjBIjEgI0iNXEiQEiMABJDfKJH2IFh8cxPVXRpUYrpABYRpFdIjSIwBICukAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjSIwBGkEiMRpBIjAAAEgAIwBIjSIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgIwEiMSAjAABICMEaQASIwBGkFhGkV0iRGI0gjWEYrpAAAAEgIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAjSIwBGkEiMAAASAjBGkEiMSAjBGkEiMRpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEYjBICMBIjVxIsIxICMSI0gACMAAAEiMRpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABICMAAEgI0iMAARpBIjAAEaQASIwBGkEiMRpBIjAASI0iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABICMBIjSI0iMABIjEgAIwARpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgIwAASAjSIwAEiNIjSIwBIACMEaQSIwBGkEiMARpEgAI0iMBIjSAAIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAJBGjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYRiMASI0iMEgI0iMAARpBYRiukAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjSIwBICukSAjSIxGkEiMRpBIjEgIwASAAjBGkEiMAASAjBIJFdI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IwAAAAARpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASIwBICMEgAIwAAAASAAjEiNIjAAAAAABIAAAACNIjEaRICMAAAAAAAAAEgI0iMBIjSAAIwAASAjSI0iNIjAAAAAWEaRXSAI1hGkV0gCNYRpFdIjWEaRXSI1hGkV0iNYRpFdIjWEaRXSI1hGK6RICNIjSI0gAAACMAEgI1hGAkV0iNIjEaQASIxICMEaQAEYkBICMEaRIAACNIjEaQSI0iNIAAjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAkEaMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAjSIxIAAACMAAEgIwBIjSIwAAAAASAAAAjWEYrpABIjAAEgK6QAAAAAAAAWEYjAEiNIjBICMAAAEgI0iNIjSIwAAASAjWEaRXSAI1hGkV0iMEgAI1hGkV0iNIjEaQWEaRXSAAAAIwAAAFhGAK6QAWEYrpEgAIwEiMASAjABGkEiMRpBIjAEaQWEYrpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgCQRowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWEYAAArpEaMASLiMV0gAsIxXSAAAACwjAAAAAFdIAAAAAAAAAAAAAAAAAALCMAAV0gAAAsIwBXSACwjFdIALCMV0gAsIxXSACwjFdIAALCMAV0gsIwBXSCwjAFdIAAAAAAAALCMAAAAAAV0gAsIwABXSACwjFdIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkWEaNXSP/Z', 'Custom Theme', 1, '2025-12-13 11:24:31', '2025-12-18 07:40:49');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin_hidden_recipes`
--
ALTER TABLE `admin_hidden_recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hidden_by` (`hidden_by`),
  ADD KEY `unhidden_by` (`unhidden_by`),
  ADD KEY `idx_recipe_active` (`recipe_id`,`is_active`);

--
-- Chỉ mục cho bảng `bao_cao`
--
ALTER TABLE `bao_cao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_bao_cao_target_type` (`target_type`),
  ADD KEY `idx_bao_cao_comment` (`comment_id`),
  ADD KEY `idx_bao_cao_reported_user` (`reported_user_id`);

--
-- Chỉ mục cho bảng `binh_luan`
--
ALTER TABLE `binh_luan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_recipe_id` (`recipe_id`),
  ADD KEY `parent_comment_id` (`parent_comment_id`);

--
-- Chỉ mục cho bảng `broadcast_notifications`
--
ALTER TABLE `broadcast_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Chỉ mục cho bảng `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_comment_user` (`comment_id`,`user_id`),
  ADD KEY `fk_comment_like_user` (`user_id`);

--
-- Chỉ mục cho bảng `comment_violation_history`
--
ALTER TABLE `comment_violation_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `idx_comment_violation_user` (`user_id`);

--
-- Chỉ mục cho bảng `cong_thuc`
--
ALTER TABLE `cong_thuc`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_recipe_category` (`category`),
  ADD KEY `idx_recipe_cuisine` (`cuisine`);

--
-- Chỉ mục cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rating` (`recipe_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_recipe_id_rating` (`recipe_id`);

--
-- Chỉ mục cho bảng `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`recipe_id`),
  ADD KEY `idx_recipe_id_favorite` (`recipe_id`);

--
-- Chỉ mục cho bảng `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Chỉ mục cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_sender` (`sender_id`),
  ADD KEY `idx_notifications_receiver_created` (`receiver_id`,`created_at`);

--
-- Chỉ mục cho bảng `recipe_tags`
--
ALTER TABLE `recipe_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_recipe_tag` (`recipe_id`,`tag_id`),
  ADD KEY `idx_recipe_tags_recipe` (`recipe_id`),
  ADD KEY `idx_recipe_tags_tag` (`tag_id`);

--
-- Chỉ mục cho bảng `recipe_views`
--
ALTER TABLE `recipe_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipe_time` (`recipe_id`,`created_at`),
  ADD KEY `idx_ip_recipe` (`client_ip`,`recipe_id`,`created_at`);

--
-- Chỉ mục cho bảng `recipe_violation_history`
--
ALTER TABLE `recipe_violation_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `idx_violation_history_recipe` (`recipe_id`);

--
-- Chỉ mục cho bảng `step_images`
--
ALTER TABLE `step_images`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_step_image` (`recipe_id`,`step_index`,`image_url`),
  ADD KEY `idx_recipe_step` (`recipe_id`,`step_index`);

--
-- Chỉ mục cho bảng `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_tags_slug` (`slug`);

--
-- Chỉ mục cho bảng `user_broadcast_read`
--
ALTER TABLE `user_broadcast_read`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_broadcast` (`user_id`,`broadcast_id`),
  ADD KEY `broadcast_id` (`broadcast_id`);

--
-- Chỉ mục cho bảng `user_report_quota`
--
ALTER TABLE `user_report_quota`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_report_type` (`user_id`,`report_type`);

--
-- Chỉ mục cho bảng `user_theme_preferences`
--
ALTER TABLE `user_theme_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin_hidden_recipes`
--
ALTER TABLE `admin_hidden_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `bao_cao`
--
ALTER TABLE `bao_cao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT cho bảng `binh_luan`
--
ALTER TABLE `binh_luan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `broadcast_notifications`
--
ALTER TABLE `broadcast_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `comment_violation_history`
--
ALTER TABLE `comment_violation_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cong_thuc`
--
ALTER TABLE `cong_thuc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT cho bảng `favorite`
--
ALTER TABLE `favorite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT cho bảng `follow`
--
ALTER TABLE `follow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `recipe_tags`
--
ALTER TABLE `recipe_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT cho bảng `recipe_views`
--
ALTER TABLE `recipe_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT cho bảng `recipe_violation_history`
--
ALTER TABLE `recipe_violation_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `step_images`
--
ALTER TABLE `step_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT cho bảng `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `user_broadcast_read`
--
ALTER TABLE `user_broadcast_read`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user_report_quota`
--
ALTER TABLE `user_report_quota`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_theme_preferences`
--
ALTER TABLE `user_theme_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `admin_hidden_recipes`
--
ALTER TABLE `admin_hidden_recipes`
  ADD CONSTRAINT `admin_hidden_recipes_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_hidden_recipes_ibfk_2` FOREIGN KEY (`hidden_by`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_hidden_recipes_ibfk_3` FOREIGN KEY (`unhidden_by`) REFERENCES `nguoi_dung` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `bao_cao`
--
ALTER TABLE `bao_cao`
  ADD CONSTRAINT `bao_cao_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bao_cao_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `nguoi_dung` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `binh_luan`
--
ALTER TABLE `binh_luan`
  ADD CONSTRAINT `binh_luan_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `binh_luan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `binh_luan_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `binh_luan` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `broadcast_notifications`
--
ALTER TABLE `broadcast_notifications`
  ADD CONSTRAINT `broadcast_notifications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `fk_comment_like_comment` FOREIGN KEY (`comment_id`) REFERENCES `binh_luan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comment_like_user` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `comment_violation_history`
--
ALTER TABLE `comment_violation_history`
  ADD CONSTRAINT `comment_violation_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_violation_history_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `bao_cao` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cong_thuc`
--
ALTER TABLE `cong_thuc`
  ADD CONSTRAINT `cong_thuc_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD CONSTRAINT `danh_gia_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `danh_gia_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `favorite`
--
ALTER TABLE `favorite`
  ADD CONSTRAINT `favorite_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `follow_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follow_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notifications_sender` FOREIGN KEY (`sender_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `recipe_tags`
--
ALTER TABLE `recipe_tags`
  ADD CONSTRAINT `recipe_tags_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipe_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `recipe_views`
--
ALTER TABLE `recipe_views`
  ADD CONSTRAINT `recipe_views_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `recipe_violation_history`
--
ALTER TABLE `recipe_violation_history`
  ADD CONSTRAINT `recipe_violation_history_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipe_violation_history_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `bao_cao` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `step_images`
--
ALTER TABLE `step_images`
  ADD CONSTRAINT `step_images_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `cong_thuc` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_broadcast_read`
--
ALTER TABLE `user_broadcast_read`
  ADD CONSTRAINT `user_broadcast_read_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_broadcast_read_ibfk_2` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcast_notifications` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_report_quota`
--
ALTER TABLE `user_report_quota`
  ADD CONSTRAINT `user_report_quota_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
