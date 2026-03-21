# 🚀 Aicount: Dokumentasi Fitur & User Flow

Aicount adalah aplikasi manajemen keuangan keluarga modern berbasi *Artificial Intelligence*. Aplikasi ini dibangun untuk mempermudah pencatatan keuangan yang konvensional menjadi otomatis dan cerdas, menggunakan pengenalan teks natural (*Smart Input*) dan pemindaian gambar (*Receipt Scanner*).

---

## 🛠️ Stack Teknologi
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router DOM, Zustand (Global State)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Real-time Subscriptions)
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash / Gemini 2.5)
- **Icons**: Lucide React

---

## ✅ FItur Terimplementasi (Working Features)

### 1. Autentikasi & Profil Pengguna
- **Email/Password & Google OAuth**: Mendukung pendaftaran dan masuk menggunakan akun Google secara terintegrasi langsung dengan Supabase Auth.
- **Onboarding Cerdas**: Sistem hanya menampilkan halaman Onboarding (memilih Wallet awal, Saldo, dan Kategori default) pada akun yang **baru saja dibuat** (< 5 menit). Akun lama akan langsung *di-skip* menuju Beranda.
- **Profile Page**: Menampilkan daftar kepemilikan dompet, perhitungan *Total Asset* yang reaktif, informasi *Family Code* untuk undang anggota (basis kolaborasi), dan tombol keluar (Logout).

### 2. Manajemen Dompet (Wallets)
- **Dukungan Multi-Tipe**: Menyediakan klasifikasi dompet Cash, Bank (BCA, Mandiri, BNI, dll), dan E-wallet (GoPay, OVO, Dana, dll) secara instan.
- **Card UI Tanpa Swipe**: Antarmuka kartu vertikal yang bersih dimana pengguna langsung dapat menekan tombol **Edit Balance** dan **Hapus Dompet** tanpa harus kebingungan menggeser (swipe).
- **Penanganan Saldo Minus**: Dompet dirancang realistis mengikuti dunia nyata dimana saldo bisa saja tertulis minus (direpresentasikan dengan teks berwarna merah) apabila pengeluaran melebihi sisa dana, sehingga melatih pengguna melacak hutang/kartu kredit tanpa menghambat pencatatan transaksi dasar.

### 3. Pengelolaan Transaksi (Transactions)
*Transaksi adalah bagian terkuat dari Aicount karena menawarkan 3 cara penginputan:*
- **Manual Form**: Form pengisian layaknya aplikasi pada umumnya dengan pemilih tanggal (*Date Picker*) ala slide-up mobile dan pemilih Kategori Dinamis. Pengguna juga bebas **menambahkan Kategori Kustom (Custom Category)** lengkap beserta *emoji*-nya jika tidak ada dalam pilihan default.
- **✨ AI Smart Input (Teks)**: Pengguna cukup mengetik *"Beli kopi di Sbux pake gopay 50 ribu"* dan Gemini AI akan secara ajaib memecahnya masuk ke pengeluaran Food & Beverage sejumlah Rp50.000 ke dompet GoPay.
- **📸 AI Scanner (Voice/Receipt)**: Pengguna bisa membuka kamera / unggah foto struk belanjaan (contoh: bon Indomaret). AI akan membedah isi struk dan mencari besaran total belanjanya tanpa perlu diinput manual.

### 4. Manajemen Anggaran (Budgeting)
- **Anggaran Per Kategori**: Anggota keluarga dapat menetapkan batas anggaran (limit) setiap bulannya untuk masing-masing kategori pengeluaran (misal: Makan, Tagihan Listrik, Bensin).
- **Indikator Real-time Progress Bar**: Progress bar disajikan dengan peringatan *warning* warna hijau, kuning (hampir batas), dan merah (melewati batas anggaran).
- **Edit & Delete Budget**: Pengguna dimudahkan mengubah-ubah batas anggaran yang dibuatnya karena keadaan ekonomi yang dinamis atau harga kebutuhan yang tiba-tiba berfluktuasi. 
- **Time-Travel (Month Picker)**: Rekapitulasi dapat dilihat berdasarkan pemilihan bulan tertentu.

### 5. Insight & Bantuan AI Keuangan (AI Advisor)
- **Ringkasan Bulan**: Dari halaman Home, algoritma AI akan merangkum seluruh pembelanjaan bulan berjalan milik pengguna.
- **Personalized Financial Tips**: Melalui sebuah Action khusus, AI meninjau secara mendalam perilaku konsumtif keluarga/pengguna lalu memberikan 3 poin nasihat (*Tips/Warning*) yang di-generate langsung dari model AI (contoh saran: *"Anda terlalu banyak habis di Entertainment, sebaiknya potong biaya langganan"*).

---

## 🗺️ User Flow Utama (Perjalanan Pengguna)

### Flow 1: Registrasi & Onboarding
1. User masuk ke `/register` (Isi Nama Lengkap, Email, Password).
2. Sistem mengecek *timestamp* -> Mengarahkan User ke `/onboarding`.
3. User disuguhkan 3 Step Card:
   - Pilih jenis Wallet pertama (Cash / BCA / GoPay).
   - Masukkan nominal saldo saat ini.
   - Centang kategori-kategori dasar yang diinginkan (Food, Transport, Bills).
4. Klik *Finish*. Data Trigger default di database dihapus, data input user dikirim, user dipindahkan ke layar `/` (Home).

### Flow 2: Pencatatan Transaksi Harian (AI Path)
1. Buka aplikasi, di halaman **Home** atau **Transactions**, klik tombol (+) hijau muda.
2. Bottom-Sheet / Modal Tambah Transaksi muncul.
3. Alih-alih mengisi form panjang, user menekan tombol **Sparkles (✨ AI Input)**.
4. User mengetik: *"Bayar tagihan listrik pake BCA 300rb".* lalu klik Submit.
5. Indikator Loading menyala. Sistem memanggil server Gemini.
6. Form langsung terisi dengan sempurna (Kategori: Bills & Utilities, Dompet: BCA, Nominal: 300.000, Catatan: bayar tagihan listrik).
7. User hanya perlu tap **Save**. Transaksi tercatat, Saldo BCA dipotong `300.000` di server Supabase dan UI langsung ter-update (Real-time).

### Flow 3: Perencanaan & Evaluasi Bulanan (Budgeting)
1. User masuk ke menu `/budget` di awal bulan.
2. User klik tombol (+ Add Budget). Memilih Kategori (misal: Groceries) dan mengatur target `1.000.000`.
3. Selama bulan berjalan, progress bar *Groceries* warna hijau perlahan akan mengisi setiap ada transaksi.
4. Ketika sudah *overbudget*, user mendapat indikator visual warna mereah. User lalu menekan ikon pensil (📝 Edit) untuk merevisi limit bulan tersebut menjadi `1.500.000` lewat Pop-up Modal.
5. Progress bar kembali hijau dan user merasa tenang karena anggarannya berhasil disesuaikan secara dinamis.

### Flow 4: Konsultasi Finansial
1. Di akhir bulan, user kembali ke halaman **Home**.
2. Pada card ringkasan *Spending Insight*, user menekan ikon *Sparkles ✨*.
3. Modal **AI Financial Advisor** akan terbuka dan mensimulasikan "pola mikir".
4. Dalam 3 detik, AI menyajikan analisis data bulanannya dengan ramah layaknya asisten pribadi, memberikan pujian (jika berhemat) atau peringatan (jika boros di sektor tertentu).

---

> 📝 **Catatan**: Seluruh aliran data di aplikasi ini berjalan dengan *Single Source of Truth* melalui Supabase Channel (Real-time). Jika User A mengubah budget atau mengelola dompet dari satu peramban (browser), perubahannya akan langsung tersinkron di perangkat anggota keluarga yang lain secara detak detik yang sama.
