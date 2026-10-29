# Hệ thống quản lý món ăn trên nền tảng đám mây

## 1. Giới thiệu

Dự án xây dựng hệ thống quản lý món ăn trên nền tảng đám mây, hỗ trợ xem danh sách, xem chi tiết, thêm, cập nhật, xóa và tìm kiếm món ăn.

Đây là bài thực hành học phần Điện toán đám mây.

## 2. Công nghệ sử dụng

* Frontend: React, Vite.
* Backend: Node.js, Express.
* Cơ sở dữ liệu: MongoDB Atlas.
* Quản lý mã nguồn: Git, GitHub.
* Đóng gói ứng dụng: Docker.
* Lưu trữ Docker image: Docker Hub.
* Triển khai: Render.

## 3. Cấu trúc dự án

```text
236429_TranQuocHung/
├── frontend/
├── backend/
├── .gitignore
└── README.md
```

* `frontend/`: Mã nguồn giao diện React.
* `backend/`: Mã nguồn API Node.js và Express.
* `.gitignore`: Các tệp không đưa lên Git.
* `README.md`: Tài liệu dự án.

## 4. Yêu cầu môi trường

* Node.js và npm.
* Git.
* Docker Desktop.
* Tài khoản MongoDB Atlas.
* Tài khoản GitHub và Docker Hub.

## 5. Cài đặt dự án

Clone repository:

```bash
git clone https://github.com/franciTran/236429_TranQuocHung.git
cd 236429_TranQuocHung
```

## 6. Chạy Backend

Sau khi hoàn thành backend:

```bash
cd backend
npm install
npm run dev
```

## 7. Chạy Frontend

Sau khi hoàn thành frontend, mở terminal riêng:

```bash
cd frontend
npm install
npm run dev
```

## 8. Cơ sở dữ liệu

Sử dụng MongoDB Atlas với:

* Database: `236429_TranQuocHung`
* Collection: `foods`

Thông tin kết nối được cấu hình bằng biến môi trường và không đưa thông tin xác thực lên repository công khai.

## 9. Triển khai

Backend và frontend được đóng gói bằng Docker, lưu trữ image trên Docker Hub và triển khai trên Render.

URL triển khai sẽ được bổ sung sau khi hoàn thành.

## 10. Thông tin sinh viên

* Họ tên: Trần Quốc Hưng
* MSSV: 236429
* Học phần: Điện toán đám mây
