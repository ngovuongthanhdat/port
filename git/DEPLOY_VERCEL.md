# Hướng Dẫn Tự Deploy Lên Vercel (Chuẩn Hóa Kiến Trúc)

Cấu trúc dự án đã được chuẩn hóa hoàn toàn theo kiến trúc **Vercel Serverless Function** (`/api`) kết hợp **Vite React Frontend** (`/dist`) và lưu trữ dữ liệu Media/CMS bằng **Vercel Blob**. Bạn có thể deploy theo 2 cách đơn giản dưới đây.

---

## 🚀 Cách 1: Deploy qua GitHub & Vercel Dashboard (Khuyên dùng - Đơn giản nhất)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Khởi tạo và đẩy code lên repository GitHub cá nhân:
   ```bash
   git add .
   git commit -m "feat: standardize architecture for Vercel deployment"
   git push origin main
   ```

### Bước 2: Import dự án vào Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập.
2. Bấm nút **Add New...** > **Project**.
3. Chọn Repository vừa tạo từ GitHub và nhấn **Import**.
4. Cấu hình tự động đã được định nghĩa sẵn trong `vercel.json`:
   - **Framework Preset**: `Vite` (hoặc `Other`)
   - **Build Command**: `vite build` (hoặc để mặc định từ `package.json`)
   - **Output Directory**: `dist`
5. Nhấn **Deploy**. Vercel sẽ tự động build frontend và serverless functions tại `/api`.

### Bước 3: Kích hoạt Vercel Blob (Lưu trữ ảnh, video và CMS)
Sau khi deploy lần đầu hoàn tất:
1. Vào trang dự án trên Vercel Dashboard > tab **Storage**.
2. Chọn **Connect Database** > chọn **Blob** > Đặt tên (ví dụ: `portfolio-media`) > Bấm **Create**.
3. Chọn môi trường (`Production`, `Preview`, `Development`) và nhấn **Connect**.
4. Vercel sẽ tự động gán biến môi trường `BLOB_READ_WRITE_TOKEN`.
5. Vào tab **Deployments**, chọn deployment mới nhất và bấm **Redeploy** (để nhận biến môi trường mới).

🎉 **Xong!** Giờ đây bạn có thể vào trang `/admin` (Mật mã mặc định: `admin2026`), tải ảnh/video trực tiếp lên CDN tốc độ cao của Vercel Blob và quản lý toàn bộ nội dung mà không sợ mất dữ liệu.

---

## 💻 Cách 2: Deploy trực tiếp bằng Vercel CLI

Nếu bạn muốn deploy trực tiếp từ terminal trên máy tính cá nhân:

```bash
# 1. Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# 2. Đăng nhập Vercel
vercel login

# 3. Liên kết và tạo Blob Store (tùy chọn)
vercel link

# 4. Deploy lên môi trường Production
vercel --prod
```

---

## ⚙️ Chi Tiết Kiến Trúc Đã Chuẩn Hóa

| Thành phần | Đường dẫn | Vai trò trên Vercel |
|---|---|---|
| **Frontend** | `/src`, `index.html` | Build ra thư mục tĩnh `/dist`, phục vụ qua Vercel Edge Network |
| **Backend API** | `/api/index.ts`, `/api/app.ts` | Tự động biên dịch thành Vercel Serverless Function xử lý mọi request `/api/*` |
| **Database / CMS** | `/api/db.ts` | Lưu trữ cấu trúc danh mục, dự án, thông tin cá nhân. Tự động đồng bộ với Vercel Blob (`cms/portfolio-store.json`) khi có `BLOB_READ_WRITE_TOKEN` |
| **Media Storage** | `@vercel/blob/client` | Upload trực tiếp ảnh/video từ trình duyệt lên Vercel Blob (bỏ qua giới hạn 4.5MB của serverless) |
| **Local Dev** | `server.ts` | Chạy dev server cục bộ với Vite middleware mượt mà |
| **Cấu hình Vercel** | `vercel.json` | Quy tắc rewrite chuẩn xác: định tuyến `/api/:path*` vào Serverless function và các route còn lại vào SPA `index.html` |

---

## 🔑 Mật Khẩu Quản Trị Mặc Định
- Mật khẩu admin: `admin2026`
- Bạn có thể đổi mật khẩu bất kỳ lúc nào tại giao diện Quản trị (`/admin`).
