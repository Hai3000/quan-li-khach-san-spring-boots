# Quản Lý Khách Sạn - Hotel Management System

Dự án full-stack quản lý khách sạn sử dụng Spring Boot + React JS + MongoDB.

## Yêu cầu hệ thống

- **Java**: 17+
- **Maven**: 3.8+
- **Node.js**: 18+
- **MongoDB**: 6.0+ (chạy trên `localhost:27017`)

## Cấu trúc dự án

```
QuanLyKhachSan-J2EE/
├── backend/          # Spring Boot API (port 8080)
├── frontend/         # React + Vite (port 5173)
├── README.md
└── .gitignore
```

## Chạy dự án

### 1. Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên `localhost:27017`.

### 2. Chạy Backend
```bash
cd backend
mvn spring-boot:run
```
Backend sẽ chạy tại: `http://localhost:8080`

### 3. Chạy Frontend
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

## Kết nối

- Frontend proxy `/api/*` requests tới Backend (`http://localhost:8080`)
- Backend kết nối MongoDB database: `quanlykhachsan`
- CORS đã được cấu hình cho phép Frontend gọi Backend

## Cấu trúc Backend (Spring Boot)

```
com.hotel/
├── config/           # Cấu hình (CORS, MongoDB)
├── controller/       # REST Controllers
├── model/            # MongoDB Documents (Entities)
├── repository/       # MongoDB Repositories
├── service/          # Business Logic
├── dto/              # Data Transfer Objects
└── exception/        # Exception Handlers
```

## Cấu trúc Frontend (React)

```
src/
├── api/              # API utilities (gọi backend)
├── App.jsx           # Component chính
├── App.css           # Styles cho App
├── index.css         # Global styles
└── main.jsx          # Entry point
```
