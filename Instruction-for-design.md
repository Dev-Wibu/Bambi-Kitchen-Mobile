# Hướng Dẫn Thiết Kế UI/UX - React Native App

> **Mục đích**: Hướng dẫn từ A-Z để làm việc với dự án về mặt thiết kế giao diện

---

## 📱 Tổng Quan Dự Án

Đây là ứng dụng di động được xây dựng bằng **React Native** với **Expo**, hỗ trợ đa nền tảng:

- ✅ iOS (iPhone/iPad)
- ✅ Android (điện thoại/máy tính bảng)
- ✅ Web (trình duyệt)

**Công nghệ chính cho UI/UX:**

- **NativeWind**: Hệ thống CSS Tailwind cho React Native (giống Tailwind CSS trên web)
- **React Native Reusables**: Thư viện component UI cơ bản, có sẵn nhiều component đẹp, lấy ý tưởng từ shadcn.
- **Expo**: Framework để chạy và xem ứng dụng trực tiếp

---

## 🚀 Cách Chạy Dự Án (Cho Designer)

### Bước 1: Cài Đặt Phần Mềm Cần Thiết

1. **Cài Node.js** (phiên bản mới nhất):
   - Tải tại: https://nodejs.org/

2. **Cài App Expo Go** trên điện thoại:
   - iOS: Tải từ App Store
   - Android: Tải từ Google Play Store

### Bước 2: Cài Đặt Dependencies (Thư Viện)

Mở **Terminal** (hoặc Command Prompt trên Windows), di chuyển đến thư mục dự án và chạy:

```bash
# Cài đặt các thư viện
npm i
```

**Lưu ý**: Chỉ cần chạy 1 lần duy nhất hoặc khi có thư viện mới được thêm vào.

### Bước 3: Chạy Ứng Dụng

```bash
# Khởi động server development
npx expo start
```

Sau khi chạy lệnh trên, một **QR code** sẽ hiện ra trong terminal.

### Bước 4: Xem Trên Điện Thoại

1. Mở ứng dụng **Expo Go** trên điện thoại
2. Quét **QR code** từ terminal
3. Ứng dụng sẽ tải và hiển thị trên điện thoại
4. **Mọi thay đổi trong code sẽ tự động cập nhật trên điện thoại** (Hot Reload)

### Bước 5: Xem Trên Web (Không khuyến khích)

```bash
# Chạy trên trình duyệt web
npm run web
# HOẶC
npx expo start (Có sẵn link web)
```

Ứng dụng sẽ mở tự động trong trình duyệt tại `http://localhost:8081`

---

## 🎨 Hệ Thống Styling (Cách Tạo Giao Diện)

### NativeWind (Tailwind CSS cho React Native)

Dự án sử dụng **NativeWind** - một hệ thống styling giống hệt Tailwind CSS trên web, nhưng cho React Native.

#### Ưu Điểm:

- ✅ Viết style trực tiếp trong component (không cần file CSS riêng)
- ✅ Có sẵn hàng trăm class tiện ích
- ✅ Responsive design dễ dàng
- ✅ Dark mode tự động
- ✅ Customize dễ dàng

#### Ví Dụ Cơ Bản:

```jsx
// Button màu cam, chữ trắng, bo góc, padding
<Button className="bg-[#FF6D00] text-white rounded-lg px-6 py-3">
  Đăng Nhập
</Button>

// Text lớn, đậm, màu đen
<Text className="text-2xl font-bold text-black">
  Chào Mừng
</Text>

// Container flex, căn giữa
<View className="flex-1 items-center justify-center px-6">
  {/* Nội dung */}
</View>
```

#### Màu Sắc Của Dự Án (tham khảo thôi):

```javascript
// Màu chính (Primary)
- Cam chính: #FF6D00
- Cam hover/active: #FF4D00
- Cam gradient: #FF8A00 → #FF6D00

// Màu nền
- Trắng: #FFFFFF (light mode)
- Xám đậm: #1F2937 (dark mode)

// Màu chữ
- Đen: #000000 (tiêu đề)
- Xám: #757575 (label, mô tả)
- Xám nhạt: #9CA3AF (text phụ light mode)
- Xám đậm: #6B7280 (text phụ dark mode)

// Màu thông báo
- Xanh lá (Success): #10B981
- Đỏ (Error): #EF4444
- Xanh dương (Info): #3B82F6
- Cam (Warning): #F59E0B
```

#### Spacing (Khoảng Cách):

NativeWind sử dụng hệ thống spacing theo bội số của 4px:

```
px-1  = 4px
px-2  = 8px
px-3  = 12px
px-4  = 16px
px-6  = 24px
px-8  = 32px
px-12 = 48px
px-16 = 64px
```

**Lưu ý**: `p` = padding, `m` = margin, `x` = horizontal, `y` = vertical, `t` = top, `b` = bottom, `l` = left, `r` = right

---

## 📦 Thư Viện UI Components Có Sẵn

Dự án đã cài đặt sẵn nhiều component UI chất lượng cao từ **React Native Reusables**:

### Danh Sách Components:

1. **Button** - Nút bấm
2. **Input** - Ô nhập liệu
3. **Text** - Văn bản
4. **Dialog** - Hộp thoại
5. **Alert Dialog** - Thông báo cảnh báo
6. **Progress** - Thanh tiến trình
7. **Checkbox** - Ô chọn
8. **Switch** - Công tắc bật/tắt
9. **Radio Group** - Nhóm nút radio
10. **Select** - Dropdown chọn
11. **Tabs** - Tab điều hướng
12. **Accordion** - Menu thu gọn
13. **Avatar** - Ảnh đại diện
14. **Tooltip** - Chú thích
15. **Popover** - Menu popup
16. **Separator** - Đường phân cách
17. **Label** - Nhãn
18. **Toggle** - Công tắc chuyển đổi
19. **Dropdown Menu** - Menu xổ xuống
20. **Context Menu** - Menu ngữ cảnh
21. **Hover Card** - Thẻ hiển thị khi hover
22. **Menubar** - Thanh menu
23. **Collapsible** - Vùng thu gọn

### Vị Trí Components:

Tất cả components đều nằm trong thư mục:

```
 /components/ui/
```

Ví dụ:

- ` /components/ui/button.tsx`
- ` /components/ui/input.tsx`
- ` /components/ui/text.tsx`

---

## 🎭 Dark Mode (Chế Độ Tối)

Ứng dụng hỗ trợ **dark mode** tự động:

### Cách Sử Dụng:

```tsx
// Light mode: bg-white, Dark mode: bg-gray-900
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Xin chào</Text>
</View>
```

**Quy tắc**: Thêm `dark:` trước class để áp dụng cho dark mode.

### Màu Sắc Dark Mode (Tham khảo):

```javascript
// Background
- Light: bg-white (#FFFFFF)
- Dark: bg-gray-900 (#111827)

// Text
- Light: text-black (#000000)
- Dark: text-white (#FFFFFF)

// Card/Surface
- Light: bg-gray-50 (#F9FAFB)
- Dark: bg-gray-800 (#1F2937)

// Border
- Light: border-gray-300
- Dark: border-gray-700
```

---

## 🖼️ Icons (Biểu Tượng)

Dự án sử dụng 2 thư viện icon:

### 1. Expo Vector Icons

```jsx
import { MaterialIcons } from '@expo/vector-icons';

<MaterialIcons name="home" size={24} color="#FF6D00" />
<MaterialIcons name="person" size={24} color="black" />
```

**Xem tất cả icons**: https://icons.expo.fyi/

### 2. Lucide React Native

```jsx
import { Heart, ShoppingCart, User } from 'lucide-react-native';

<Heart size={24} color="#FF6D00" />
<ShoppingCart size={24} color="black" />
```

**Xem tất cả icons**: https://lucide.dev/icons/

---

## 📸 Hình Ảnh

### Sử Dụng Expo Image (Tối Ưu Hơn):

```jsx
import { Image } from 'expo-image';

// Hình từ URL
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
/>

// Hình từ assets
<Image
  source={require('@/assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
  contentFit="contain"
/>
```

**Content Fit Options**:

- `cover` - Lấp đầy, cắt nếu cần
- `contain` - Vừa khít, không cắt
- `fill` - Kéo giãn
- `scale-down` - Thu nhỏ nếu lớn hơn

### Vị Trí Assets:

Đặt hình ảnh trong:

```
 /assets/images/
```

---

## 🎯 Responsive Design

### Breakpoints (Điểm Ngắt):

```jsx
// Mobile first approach
<View className="w-full md:w-1/2 lg:w-1/3">{/* Nội dung */}</View>
```

**Kích thước:**

- `sm:` - Từ 640px trở lên
- `md:` - Từ 768px trở lên
- `lg:` - Từ 1024px trở lên
- `xl:` - Từ 1280px trở lên

### Platform-Specific Styling:

```jsx
import { Platform } from "react-native";

// iOS: padding 20px, Android: padding 16px
<View className={Platform.OS === "ios" ? "p-5" : "p-4"}>{/* Nội dung */}</View>;
```

---

## 🎨 Thiết Kế Chuẩn Của Dự Án

### Typography (Kiểu Chữ):

```jsx
// Tiêu đề lớn
<Text className="text-3xl font-bold text-black dark:text-white">
  Tiêu Đề
</Text>

// Tiêu đề vừa
<Text className="text-2xl font-semibold text-black dark:text-white">
  Tiêu Đề Phụ
</Text>

// Văn bản thông thường
<Text className="text-base text-gray-700 dark:text-gray-300">
  Nội dung văn bản
</Text>

// Label/Nhãn
<Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
  Email
</Text>
```

### Button Styles:

```jsx
// Primary button (Nút chính)
<Button className="bg-[#FF6D00] active:bg-[#FF4D00] rounded-lg px-6 py-3">
  <Text className="text-white font-semibold">Đăng Nhập</Text>
</Button>

// Secondary button (Nút phụ)
<Button className="bg-gray-200 dark:bg-gray-700 rounded-lg px-6 py-3">
  <Text className="text-gray-800 dark:text-white font-semibold">Hủy</Text>
</Button>

// Ghost button (Nút trong suốt)
<Button className="bg-transparent">
  <Text className="text-[#FF6D00] font-semibold">Bỏ Qua</Text>
</Button>
```

### Card Styles:

```jsx
<View className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800">{/* Nội dung card */}</View>
```

### Input Styles:

```jsx
<TextInput
  className="rounded-lg border border-gray-300 px-4 py-3 text-black dark:border-gray-600 dark:text-white"
  placeholder="Nhập email"
  placeholderTextColor="#9CA3AF"
/>
```

---

## 🔧 File Quan Trọng Cần Biết

### 1. Cấu Hình Màu Sắc và Theme:

```
 /tailwind.config.js
```

Chỉnh sửa màu sắc, font chữ, spacing, v.v.

### 2. Global Styles:

```
 /global.css
```

CSS toàn cục, áp dụng cho toàn bộ ứng dụng.

### 3. Components UI:

```
 /components/ui/
```

Tất cả UI components có sẵn.

### 4. Screens/Pages:

```
 /app/
```

Các màn hình của ứng dụng.

### 5. Assets (Hình ảnh, Icon):

```
 /assets/
├── images/         # Hình ảnh
└── fonts/          # Font chữ (nếu có)
```

---

## 🛠️ Tools Hữu Ích Cho Designer

### 1. Expo Snack (Code Online)

Viết và xem kết quả React Native trực tuyến:

- Link: https://snack.expo.dev/

### 2. Tailwind CSS Cheat Sheet

Tra cứu các class Tailwind:

- Link: https://nerdcave.com/tailwind-cheat-sheet

### 3. NativeWind Docs

Tài liệu chính thức NativeWind:

- Link: https://www.nativewind.dev/

### 4. Figma to React Native (Đề xuất)

Plugin Figma để export design sang React Native code:

- Tìm "Figma to React Native" trong Figma Community

### 5. Nx Console (Khuyên Dùng)

Extension VS Code giúp quản lý và chạy các lệnh của dự án một cách dễ dàng hơn.

#### Cài Đặt Nx Console:

1. **Mở VS Code**
2. **Vào Extensions** (hoặc nhấn `Ctrl+Shift+X` / `Cmd+Shift+X` trên Mac)
3. **Tìm kiếm**: "Nx Console"
4. **Cài đặt** extension từ tác giả Nrwl

#### Cách Sử Dụng Nx Console:

##### Chạy Các Scripts/Tasks:

1. **Mở Nx Console**:
   - Nhấn biểu tượng Nx trên thanh bên trái VS Code
   - Hoặc nhấn `Ctrl+Shift+P` và gõ "Nx Console"

2. **Xem Danh Sách Scripts**: (Đoạn này không nhớ, thông thường sau khi npm i thì chỉ cần mở lại vscode -> bấm icon nx -> bấm refresh workplace là hoạt động)
   - Trong panel Nx Console, bạn sẽ thấy phần **"SCRIPTS"** hoặc **"TASKS"**
   - Mở rộng để xem tất cả scripts có sẵn trong `package.json`

3. **Chạy Scripts**:
   - **`start`** - Khởi động app (giống `npx expo start` nhưng chỉ có link web, không có mã QR, nên không khuyến khích chạy bằng, nên gõ lệnh ở terminal)
     -> Click vào script → Nhấn nút ▶️ (Run)
   - **`start-clean`** - Khởi động app với cache xóa sạch (cũng không có mã QR, nên không khuyến khích chạy bằng nx, nên gõ lệnh ở terminal)
     -> Dùng khi gặp lỗi styling hoặc cần reset
   - **`android`** - Chạy trên Android emulator (phải cài sẵn Android Studio để thêm giả lập cho máy, chạy khá nặng)
   - **`ios`** - Chạy trên iOS simulator (Chỉ dùng được trên máy mac)
   - **`format`** - Format code tự động (Prettier)
     -> Chạy trước khi code và commit
   - **`lint`** - Kiểm tra lỗi code
   - **`typecheck`** - Kiểm tra lỗi TypeScript
   - **`doctor`** - Kiểm tra các lỗi cấu hình, dependencies không tương thích, hoặc các vấn đề khác có thể gây lỗi khi build hoặc run app

##### Ưu Điểm Của Nx Console:

- ✅ **Giao diện trực quan** - Không cần nhớ lệnh terminal
- ✅ **Một click chạy scripts** - Tiết kiệm thời gian
- ✅ **Xem lịch sử chạy** - Dễ debug
- ✅ **Auto-complete** - Gợi ý tham số khi chạy lệnh
- ✅ **Xem cấu trúc dự án** - Hiểu rõ project layout

##### Ví Dụ Workflow (tham khảo vui)

```
1. Mở VS Code
2. Mở Nx Console (biểu tượng Nx ở sidebar)
3. Click vào script "start" → Nhấn ▶️
4. Chờ QR code hiện ra
5. Quét QR bằng Expo Go trên điện thoại
6. Bắt đầu code!
```

##### Tips:

- **Chạy nhiều task cùng lúc**: Nx Console cho phép chạy nhiều terminal cùng lúc
- **Xem output dễ dàng**: Mỗi task có terminal riêng, dễ theo dõi

---

## 📝 Quy Trình Làm Việc Cho Designer (Tham khảo)

### Bước 1: Thiết Kế Trên Figma/Adobe XD

1. Thiết kế màn hình theo kích thước chuẩn:
   - Mobile: 375x812 (iPhone X)
   - Tablet: 768x1024 (iPad)
2. Sử dụng hệ thống spacing 4px (4, 8, 12, 16, 24, 32, 48, 64)
3. Xuất assets (icon, hình ảnh) ở định dạng PNG hoặc SVG
4. Ghi chú màu sắc, font chữ, kích thước

### Bước 2: Chuyển Design Sang Code

1. Mở file screen tương ứng trong ` /app/`
2. Sử dụng NativeWind classes để styling
3. Sử dụng components có sẵn trong ` /components/ui/`
4. Lưu file và xem kết quả trên điện thoại/web

### Bước 3: Kiểm Tra Responsive

1. Xem trên nhiều kích thước màn hình
2. Kiểm tra dark mode
3. Kiểm tra trên iOS và Android

### Bước 4: Handoff Cho Developer

1. Xuất màu sắc chính xác (hex code)
2. Xuất spacing (margin, padding)
3. Xuất font size và weight
4. Cung cấp assets (hình ảnh, icon)
5. Ghi chú animation/transition (nếu có)

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Khi Cần Thêm Component Mới

- Kiểm tra xem có component tương tự trong `components/ui/` chưa
- Nếu chưa có, yêu cầu developer tạo
- Hoặc tìm component từ React Native Reusables

### 2. Performance (Hiệu Năng)

- ✅ Tối ưu hình ảnh (dùng định dạng WebP nếu được)
- ✅ Giới hạn kích thước hình ảnh (< 500KB)
- ✅ Sử dụng `expo-image` thay vì `Image` từ React Native
- ✅ Dùng icons thay vì hình ảnh khi có thể

### 3. Testing Trên Thiết Bị Thật

- ✅ Luôn test trên điện thoại thật (qua Expo Go)
- ✅ Test cả iOS và Android (tùy chọn)
- ✅ Test dark mode
- ✅ Test các kích thước màn hình khác nhau (tùy chọn)

---

## 🆘 Troubleshooting (Xử Lý Lỗi)

### Lỗi: "Metro bundler không khởi động được"

**Giải pháp:**

```bash
# Xóa cache và khởi động lại
npx expo start -c
```

### Lỗi: "Cannot find module..."

**Giải pháp:**

```bash
# Cài lại dependencies
rm -rf node_modules
npm install
```

### Lỗi: "Styles không hiển thị đúng"

**Giải pháp:**

1. Kiểm tra cú pháp className
2. Xóa cache: `npx expo start -c`
3. Kiểm tra file `tailwind.config.js`

---

## 📚 Tài Liệu Tham Khảo

### Chính Thức:

1. **NativeWind**: https://www.nativewind.dev/
2. **Expo**: https://docs.expo.dev/
3. **React Native**: https://reactnative.dev/
4. **RN Primitives**: https://reactnativereusables.com/docs
5. **Tailwind CSS**: https://tailwindcss.com/docs
