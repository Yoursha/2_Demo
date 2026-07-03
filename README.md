# Morden Database Demo — Redis & MongoDB Atlas & Cassandra

Demo HỆ THỐNG QUẢN LÝ ỨNG DỤNG GIAO ĐỒ ĂN TRỰC TUYẾN sử dụng nhiều loại cơ sở dữ liệu NoSQL trong một hệ thống thực tế.

---

## Nhóm thực hiện

| MSSV | Họ và tên | Email |
|---|---|---|
| 19120592 | Đỗ Duy Nam | 19120592@student.hcmus.edu.vn |
| 21120259 | Nguyễn Quang Khải | 21120259@student.hcmus.edu.vn |
| 22120162 | Nguyễn Đăng Khoa | 22120162@student.hcmus.edu.vn |

| Tính năng | Database | Lý do chọn |
|---|---|---|
| Đăng nhập / Đăng ký | **MongoDB Atlas** | Document store, lưu thông tin user linh hoạt |
| Danh sách nhà hàng & menu | **Redis Cloud** | Cache in-memory, đọc cực nhanh |
| Lịch sử thanh toán | **Apache Cassandra** | Column-Family, tối ưu cho ghi nhiều / đọc theo user |

---

## Yêu cầu

- [Node.js](https://nodejs.org) >= 20
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (để chạy Cassandra)
- Tài khoản [MongoDB Atlas](https://cloud.mongodb.com) (free tier)

---

## Cài đặt

### 1. Clone và cài dependencies

```bash
cd "D:\morden_database\BT\DATH\2_Demo"
npm install
```

### 2. Tạo file `.env`

Tạo file `.env` ở thư mục gốc (`D:\morden_database\BT\DATH\2_Demo\.env`):

```env
PORT=3000
DB_PASSWORD=<mật_khẩu_MongoDB_Atlas_của_bạn>
```
*Sử dụng file .env trong folder bài nộp*

### 3. Khởi động Apache Cassandra (Docker)

```bash
# Lần đầu — tải image và chạy container
docker run -d --name cassandra-demo -p 9042:9042 cassandra:5

# Chờ ~45 giây để Cassandra khởi động xong, kiểm tra bằng:
docker logs cassandra-demo --tail 5
```

> Từ lần sau chỉ cần: `docker start cassandra-demo`

---

## Chạy server

```bash
cd "D:\morden_database\BT\DATH\2_Demo"
node source/server/app.js
```

Khi khởi động thành công sẽ thấy:

```
✅ Successfully connected to MongoDB Atlas
✅ Successfully connected to Redis Cloud
✅ Successfully connected to Apache Cassandra
   Seeded 9 demo payment records into Cassandra.
🚀 Server running on http://localhost:3000
```

---

## Mở giao diện

Mở file trực tiếp trong trình duyệt:

```
source/UI/index.html
```

### Tài khoản demo có sẵn lịch sử thanh toán

| Username | Password | Giao dịch |
|---|---|---|
| `nam.do` | bất kỳ | 6 giao dịch |
| `admin` | bất kỳ | 3 giao dịch |

> Nếu nhập username chưa tồn tại, hệ thống tự tạo tài khoản mới.

---

## API Endpoints

| Method | URL | Mô tả | DB |
|---|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập / tạo tài khoản | MongoDB |
| `POST` | `/api/auth/logout` | Đăng xuất | — |
| `GET` | `/api/restaurants` | Danh sách nhà hàng | Redis |
| `GET` | `/api/restaurants/:id/menu` | Menu của nhà hàng | Redis |
| `POST` | `/api/payments/add` | Thêm giao dịch thanh toán | Cassandra |
| `GET` | `/api/payments/history/:username` | Lịch sử thanh toán theo user | Cassandra |

---

## Cấu trúc thư mục

```
2_Demo/
├── .env                        # Biến môi trường (tự tạo, không commit)
├── package.json
└── source/
    ├── server/
    │   ├── app.js              # Entry point
    │   ├── db.js               # Kết nối MongoDB Atlas
    │   ├── redisDb.js          # Kết nối Redis Cloud
    │   ├── cassandraDb.js      # Kết nối Cassandra + seed demo data
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── paymentsController.js
    │   │   └── restaurantController.js
    │   └── routes/
    │       ├── authRoutes.js
    │       ├── paymentsRoutes.js
    │       └── restaurantRoutes.js
    └── UI/
        └── index.html          # Giao diện demo (mở thẳng trong trình duyệt)
```
