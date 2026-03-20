-- ============================================================
-- DATABASE: diabetes_db
-- Charset: utf8mb4 (hỗ trợ tiếng Việt đầy đủ)
-- ============================================================

CREATE DATABASE IF NOT EXISTS diabetes_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE diabetes_db;

-- ============================================================
-- BẢNG 1: users — Tài khoản người dùng
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL                        COMMENT 'Họ và tên đầy đủ',
    email           VARCHAR(100)    NOT NULL UNIQUE                 COMMENT 'Email đăng nhập (unique)',
    password        VARCHAR(255)    NOT NULL                        COMMENT 'Mật khẩu đã hash (bcrypt)',
    dob             DATE            NULL                            COMMENT 'Ngày sinh',
    gender          ENUM('male','female','other') NULL              COMMENT 'Giới tính',
    phone           VARCHAR(15)     NULL                            COMMENT 'Số điện thoại',
    avatar_url      VARCHAR(500)    NULL                            COMMENT 'Đường dẫn ảnh đại diện',
    role            ENUM('user','admin') NOT NULL DEFAULT 'user'    COMMENT 'Phân quyền',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1              COMMENT '1=hoạt động, 0=bị khóa',
    last_login      DATETIME        NULL                            COMMENT 'Lần đăng nhập gần nhất',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email     (email),
    INDEX idx_role      (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB COMMENT='Tài khoản người dùng';


-- ============================================================
-- BẢNG 2: records — Lịch sử chẩn đoán sơ bộ
-- ============================================================
CREATE TABLE IF NOT EXISTS records (
    id                  INT             AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL                    COMMENT 'Liên kết tới users.id',

    -- Chỉ số sinh học đầu vào
    glucose             FLOAT           NULL                        COMMENT 'Glucose huyết tương lúc đói (mg/dL)',
    hba1c               FLOAT           NULL                        COMMENT 'HbA1c (%)',
    bmi                 FLOAT           NULL                        COMMENT 'Chỉ số khối cơ thể (kg/m²)',
    blood_pressure      FLOAT           NULL                        COMMENT 'Huyết áp tâm thu (mmHg)',
    waist               FLOAT           NULL                        COMMENT 'Vòng eo (cm)',
    age                 INT             NULL                        COMMENT 'Tuổi (năm)',
    family_history      TINYINT(1)      NULL                        COMMENT '1=có tiền sử gia đình, 0=không',
    insulin             FLOAT           NULL                        COMMENT 'Insulin (mu U/ml) - tùy chọn',
    skin_thickness      FLOAT           NULL                        COMMENT 'Độ dày nếp gấp da (mm) - tùy chọn',
    pregnancies         INT             NULL                        COMMENT 'Số lần mang thai (nữ) - tùy chọn',

    -- Kết quả từ mô hình ML
    risk_score          FLOAT           NOT NULL                    COMMENT 'Xác suất mắc bệnh (0.0 – 1.0)',
    risk_level          ENUM('low','medium','high') NOT NULL        COMMENT 'Mức nguy cơ: low<0.3, medium<0.6, high>=0.6',
    model_used          VARCHAR(50)     NOT NULL DEFAULT 'random_forest' COMMENT 'Tên mô hình ML đã dùng',
    model_version       VARCHAR(20)     NULL                        COMMENT 'Phiên bản model (vd: v1.0)',

    -- Ghi chú
    note                TEXT            NULL                        COMMENT 'Ghi chú của người dùng',

    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id       (user_id),
    INDEX idx_risk_level    (risk_level),
    INDEX idx_created_at    (created_at)
) ENGINE=InnoDB COMMENT='Lịch sử chẩn đoán sơ bộ của người dùng';


-- ============================================================
-- BẢNG 3: categories — Danh mục bài viết sức khỏe
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE                 COMMENT 'Tên danh mục (vd: Dinh dưỡng, Vận động)',
    slug        VARCHAR(100)    NOT NULL UNIQUE                 COMMENT 'URL-friendly (vd: dinh-duong)',
    description VARCHAR(255)    NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_slug (slug)
) ENGINE=InnoDB COMMENT='Danh mục bài viết giáo dục sức khỏe';


-- ============================================================
-- BẢNG 4: articles — Bài viết giáo dục sức khỏe
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    category_id     INT             NOT NULL                    COMMENT 'Liên kết tới categories.id',
    title           VARCHAR(255)    NOT NULL                    COMMENT 'Tiêu đề bài viết',
    slug            VARCHAR(255)    NOT NULL UNIQUE             COMMENT 'URL-friendly',
    summary         VARCHAR(500)    NULL                        COMMENT 'Tóm tắt ngắn (~2 câu)',
    content         LONGTEXT        NOT NULL                    COMMENT 'Nội dung đầy đủ (HTML hoặc Markdown)',
    thumbnail_url   VARCHAR(500)    NULL                        COMMENT 'Ảnh đại diện bài viết',
    author          VARCHAR(100)    NULL DEFAULT 'Admin'        COMMENT 'Tác giả',
    is_published    TINYINT(1)      NOT NULL DEFAULT 1          COMMENT '1=công khai, 0=nháp',
    views           INT             NOT NULL DEFAULT 0          COMMENT 'Số lượt xem',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category_id   (category_id),
    INDEX idx_slug          (slug),
    INDEX idx_is_published  (is_published)
) ENGINE=InnoDB COMMENT='Bài viết giáo dục sức khỏe';


-- ============================================================
-- BẢNG 5: recommendations — Khuyến nghị theo mức nguy cơ
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    risk_level  ENUM('low','medium','high') NOT NULL            COMMENT 'Áp dụng cho mức nguy cơ nào',
    type        ENUM('diet','exercise','medical','lifestyle') NOT NULL COMMENT 'Loại khuyến nghị',
    title       VARCHAR(200)    NOT NULL                        COMMENT 'Tiêu đề ngắn',
    content     TEXT            NOT NULL                        COMMENT 'Nội dung khuyến nghị chi tiết',
    priority    INT             NOT NULL DEFAULT 1              COMMENT 'Thứ tự hiển thị (nhỏ = ưu tiên cao)',
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_risk_level (risk_level),
    INDEX idx_type       (type)
) ENGINE=InnoDB COMMENT='Khuyến nghị tự động theo mức nguy cơ';


-- ============================================================
-- BẢNG 6: feedback — Phản hồi của người dùng về kết quả
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    record_id   INT             NOT NULL                        COMMENT 'Liên kết tới records.id',
    user_id     INT             NOT NULL                        COMMENT 'Liên kết tới users.id',
    rating      TINYINT         NOT NULL                        COMMENT 'Đánh giá độ chính xác: 1–5 sao',
    comment     TEXT            NULL                            COMMENT 'Nhận xét tự do',
    doctor_confirmed TINYINT(1) NULL                            COMMENT '1=bác sĩ xác nhận đúng, 0=sai, NULL=chưa khám',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    INDEX idx_record_id (record_id),
    INDEX idx_rating    (rating)
) ENGINE=InnoDB COMMENT='Phản hồi của người dùng về kết quả chẩn đoán';


-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================

-- Danh mục bài viết
INSERT INTO categories (name, slug, description) VALUES
('Dinh dưỡng',      'dinh-duong',   'Chế độ ăn uống phù hợp cho người có nguy cơ tiểu đường'),
('Vận động',        'van-dong',     'Các bài tập thể dục hỗ trợ kiểm soát đường huyết'),
('Phòng ngừa',      'phong-ngua',   'Cách phòng ngừa và phát hiện sớm bệnh tiểu đường'),
('Kiến thức chung', 'kien-thuc',    'Thông tin cơ bản về bệnh đái tháo đường');

-- Khuyến nghị theo mức nguy cơ
INSERT INTO recommendations (risk_level, type, title, content, priority) VALUES
-- Nguy cơ thấp
('low', 'diet',      'Duy trì chế độ ăn cân bằng',       'Tiếp tục duy trì chế độ ăn giàu rau xanh, ngũ cốc nguyên hạt. Hạn chế đường và thức ăn chế biến sẵn.', 1),
('low', 'exercise',  'Vận động đều đặn 30 phút/ngày',    'Duy trì ít nhất 150 phút hoạt động thể chất mức độ vừa mỗi tuần như đi bộ nhanh, đạp xe, bơi lội.', 2),
('low', 'medical',   'Kiểm tra sức khỏe định kỳ',        'Nên xét nghiệm đường huyết định kỳ 1–2 năm/lần để theo dõi sự thay đổi.', 3),

-- Nguy cơ trung bình
('medium', 'diet',      'Kiểm soát lượng carbohydrate',     'Hạn chế cơm trắng, bánh mì trắng, nước ngọt. Ưu tiên thực phẩm có chỉ số GI thấp như gạo lứt, khoai lang.', 1),
('medium', 'exercise',  'Tăng cường vận động aerobic',      'Tập ít nhất 30 phút/ngày, 5 ngày/tuần. Kết hợp bài tập sức bền nhẹ như squat, plank để tăng nhạy cảm insulin.', 2),
('medium', 'medical',   'Tư vấn bác sĩ trong 1–3 tháng',   'Nên gặp bác sĩ để làm xét nghiệm đường huyết lúc đói và HbA1c. Xem xét xét nghiệm dung nạp glucose (OGTT).', 3),
('medium', 'lifestyle', 'Giảm cân nếu thừa cân',            'Giảm 5–7% trọng lượng cơ thể có thể giảm nguy cơ tiến triển thành tiểu đường type 2 đến 58%.', 4),

-- Nguy cơ cao
('high', 'medical',   'Khám bác sĩ ngay trong tuần này',  'Kết quả cho thấy nguy cơ cao. Cần đến cơ sở y tế để xét nghiệm chẩn đoán xác định (glucose lúc đói, HbA1c, OGTT) trong thời gian sớm nhất.', 1),
('high', 'diet',      'Thay đổi chế độ ăn ngay lập tức',  'Loại bỏ hoàn toàn nước ngọt, bánh kẹo, đồ chiên rán. Chia nhỏ bữa ăn thành 5–6 bữa/ngày. Theo dõi lượng carbohydrate mỗi bữa dưới 45g.', 2),
('high', 'exercise',  'Bắt đầu vận động có kiểm soát',    'Bắt đầu với đi bộ 20–30 phút/ngày. Không tập cường độ cao đột ngột. Tham khảo ý kiến bác sĩ về chương trình tập phù hợp.', 3),
('high', 'lifestyle', 'Theo dõi đường huyết tại nhà',     'Cân nhắc mua máy đo đường huyết cá nhân. Ghi lại chỉ số mỗi sáng trước ăn và 2 giờ sau ăn để theo dõi xu hướng.', 4);

-- Bài viết mẫu
INSERT INTO articles (category_id, title, slug, summary, content, author) VALUES
(1, 'Chế độ ăn cho người nguy cơ tiểu đường type 2',
   'che-do-an-nguoi-nguy-co-tieu-duong',
   'Lựa chọn thực phẩm đúng cách có thể giảm đáng kể nguy cơ phát triển tiểu đường type 2.',
   '<h2>Thực phẩm nên ăn</h2><p>Rau xanh, ngũ cốc nguyên hạt, protein nạc, chất béo lành mạnh từ cá, hạt và dầu olive.</p><h2>Thực phẩm cần hạn chế</h2><p>Nước ngọt, bánh kẹo, cơm trắng số lượng lớn, thức ăn nhanh và đồ chiên rán.</p>',
   'Admin'),
(3, 'Hiểu đúng về chỉ số HbA1c',
   'hieu-dung-chi-so-hba1c',
   'HbA1c là gì và tại sao đây là chỉ số quan trọng nhất để theo dõi bệnh tiểu đường?',
   '<h2>HbA1c là gì?</h2><p>HbA1c phản ánh mức đường huyết trung bình trong 2–3 tháng qua. Chỉ số dưới 5.7% là bình thường, 5.7–6.4% là tiền tiểu đường, từ 6.5% trở lên được chẩn đoán là tiểu đường.</p>',
   'Admin'),
(2, '5 bài tập đơn giản giúp kiểm soát đường huyết',
   '5-bai-tap-kiem-soat-duong-huyet',
   'Các bài tập thể dục đơn giản, không cần dụng cụ, có thể thực hiện tại nhà mỗi ngày.',
   '<h2>1. Đi bộ nhanh</h2><p>30 phút đi bộ nhanh mỗi ngày giúp tăng độ nhạy insulin lên đáng kể.</p><h2>2. Squat</h2><p>3 hiệp x 15 lần mỗi ngày giúp tăng cơ bắp chân — nhóm cơ tiêu thụ glucose nhiều nhất.</p>',
   'Admin');