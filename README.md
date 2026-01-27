# 🎲 Lô Tô Việt Nam - Vietnamese Bingo Game

Trò chơi Lô Tô truyền thống Việt Nam với giao diện web hiện đại!

## 🎮 Cách chơi

1. **Người chơi** chọn 1 trong 16 tờ dò
2. **Nhà cái** tự động chọn 1 trong 15 tờ còn lại
3. Hệ thống gọi số từ 1-90 (không trùng lặp)
4. Nhà cái tự động đánh dấu số trên tờ của mình
5. Người chơi click vào ô số để đánh dấu
6. **Ai có 5 số liên tiếp ngang (cùng 1 hàng) trước → THẮNG!** 🎉

## 🚀 Cài đặt Backend (Render.com)

### Bước 1: Tạo Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Bước 2: Deploy lên Render.com
1. Đăng ký tài khoản tại [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository của bạn
4. Cấu hình:
   - **Name**: `loto-vietnam-backend` (hoặc tên khác)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (hoặc paid nếu muốn)
5. Click **"Create Web Service"**
6. Đợi deploy xong, copy URL của bạn (vd: `https://loto-vietnam-backend.onrender.com`)

### Bước 3: Cập nhật Frontend
Mở file `index.html`, tìm dòng này:
```javascript
const SOCKET_URL = 'http://localhost:3000';
```

Thay bằng URL Render.com của bạn:
```javascript
const SOCKET_URL = 'https://your-app-name.onrender.com';
```

## 📱 Deploy Frontend (GitHub Pages)

### Bước 1: Push lên GitHub
```bash
git add index.html
git commit -m "Update backend URL"
git push
```

### Bước 2: Enable GitHub Pages
1. Vào repository trên GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **main** → Folder: **/ (root)**
5. Click **Save**

Sau vài phút, trang web sẽ có tại: `https://your-username.github.io/your-repo-name/`

## 🛠️ Chạy Local để Test

### Backend:
```bash
cd backend
npm install
npm start
```
Server chạy tại: `http://localhost:3000`

### Frontend:
Mở file `index.html` bằng trình duyệt (hoặc dùng Live Server)

## 📝 Cấu trúc Files

```
├── server.js          # Backend Node.js + Socket.io
├── package.json       # Dependencies
├── index.html         # Frontend single HTML
└── README.md          # Hướng dẫn này
```

## 🎨 Tính năng

✅ Text-to-Speech tiếng Việt tự động  
✅ 3 câu rao đa dạng (take turn)  
✅ Timer 15 giây tự động gọi số tiếp theo  
✅ Nhà cái tự động đánh dấu  
✅ Người chơi click để đánh dấu  
✅ Tự động detect người thắng  
✅ Hiệu ứng pháo hoa khi thắng  
✅ Responsive design  

## 🔧 Mở rộng

Để thêm 14 tờ còn lại, mở `server.js` và thêm vào mảng `tickets.tickets`:

```javascript
{
  "id": 3,
  "color": "blue",
  "grid": [
    [/* 9 hàng x 9 cột */]
  ]
},
// ... thêm 13 tờ nữa
```

## 📞 Troubleshooting

**Backend không kết nối được:**
- Kiểm tra URL trong `index.html` có đúng không
- Render.com free tier có thể sleep sau 15 phút không dùng
- Mở DevTools (F12) → Console để xem lỗi

**Text-to-Speech không hoạt động:**
- Đảm bảo trình duyệt hỗ trợ Web Speech API (Chrome, Edge)
- Firefox có thể cần cài đặt thêm

## 🎯 Todo (Tương lai)

- [ ] Thêm đủ 16 tờ dò
- [ ] Thêm 8 màu khác nhau
- [ ] Multiplayer (nhiều người chơi cùng lúc)
- [ ] Leaderboard
- [ ] Sound effects
- [ ] Mobile app version

---

**Made with ❤️ for Vietnamese Bingo lovers!** 🇻🇳
