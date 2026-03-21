# 🎨 Aicount Style Guide

Aplikasi Aicount menggunakan sistem **Tailwind CSS v4** di mana seluruh konfigurasi warna utama, *typography* (font), dan gaya diatur secara terpusat. 

Dokumen ini akan memandu Anda bagaimana mengubah tema warna aplikasi (misalnya mengubah warna Hijau Tosca menjadi Biru atau Ungu) dengan sangat mudah.

---

## 📍 Dimana Lokasi Konfigurasi Warna?
Seluruh warna dan variabel desain disimpan di satu file CSS utama:
👉 **`src/index.css`** (pada bagian kode yang diblok `@theme { ... }`)

---

## 🎨 Cara Mengubah Warna Utama (Primary Color)

Warna utama saat ini adalah **Hijau Tosca (`#2A9D8F`)**. Jika Anda ingin mengubah warna identitas aplikasi ini (misalnya menjadi **Warna Biru / Blue**), Anda hanya perlu mengubah variabel `--color-primary` dan turunannya di file `src/index.css`.

Buka `src/index.css` dan perhatikan baris berikut:
```css
@theme {
  --color-primary: #2A9D8F;       /* Warna Utama */
  --color-primary-light: #48BFA0; /* Warna Terang Utama (untuk Gradient/Hover) */
  --color-primary-dark: #1E7A6E;  /* Warna Gelap Utama (untuk Active State) */
  --color-primary-50: #F0FDFB;    /* Background sangat pudar (Opacity 5%) */
  --color-primary-100: #CCFBF1;   /* Background pudar (Opacity 10%) */
  --color-primary-200: #99F6E4;   /* Background sedang (Opacity 20%) */
  ...
}
```

**💡 Contoh Rekomendasi Palet Warna Alternatif:**

Jika ingin diubah ke **Tema Biru (Blue Theme)**, ganti konfigurasi di atas menjadi seperti ini:
```css
  --color-primary: #3B82F6;       /* Blue 500 */
  --color-primary-light: #60A5FA; /* Blue 400 */
  --color-primary-dark: #2563EB;  /* Blue 600 */
  --color-primary-50: #EFF6FF;    /* Blue 50 */
  --color-primary-100: #DBEAFE;   /* Blue 100 */
  --color-primary-200: #BFDBFE;   /* Blue 200 */
```

Jika ingin diubah ke **Tema Ungu (Purple Theme)**:
```css
  --color-primary: #8B5CF6;       /* Violet 500 */
  --color-primary-light: #A78BFA; /* Violet 400 */
  --color-primary-dark: #7C3AED;  /* Violet 600 */
  --color-primary-50: #F5F3FF;    /* Violet 50 */
  --color-primary-100: #EDE9FE;   /* Violet 100 */
  --color-primary-200: #DDD6FE;   /* Violet 200 */
```
*(Setelah file `index.css` disimpan, seluruh aplikasi akan langsung berubah warna otomatis!)*

---

## 🌈 Mengubah Warna Aksen & Peringatan (Danger/Warning)

Masih di dalam `@theme` pada `src/index.css`, Anda dapat mengubah warna peringatan:

```css
  /* Warna Error / Tombol Hapus */
  --color-danger: #E76F51;        /* Merah bata */
  --color-danger-light: #FEF2F2;  /* Latar belakang merah pudar */

  /* Warna Peringatan / Kuning */
  --color-warning: #E9C46A;       /* Kuning emas */
  --color-warning-light: #FFFBEB; /* Latar belakang kuning pudar */
```

---

## 🔤 Mengubah Jenis Huruf (Font Family)

Aicount menggunakan **Inter** sebagai font utamanya. Konfigurasinya juga ada di file `src/index.css`:

```css
@theme {
  ...
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

Jika Anda ingin mengganti font (misalnya menjadi Google Font **Poppins** atau **Outfit**):
1. Import link Google Font tersebut di bagian atas file `index.html`.
2. Ubah baris CSS di atas menjadi:
   `--font-sans: 'Poppins', system-ui, sans-serif;`

---

## 🖼️ Gradient Background Utama (Header)
Aplikasi ini menggunakan warna *gradient* yang cantik di bagian Header (latar atas aplikasi). Jika Anda mengubah warna *Primary*, sangat disarankan untuk ikut memperbarui *gradient header* yang ada di bawah file `src/index.css`:

Cari `/* Gradient backgrounds */` dan ganti kode Hex warnanya agar sesuai dengan warna Primary yang baru Anda pilih:
```css
.gradient-header {
  /* Ubah susunan warna hex untuk mengubah warna latar belakang langit-langit aplikasi */
  background: linear-gradient(135deg, #E0F7F3 0%, #B2EBE0 30%, #A8E6CF 60%, #D4F1E9 100%);
}

.gradient-primary {
  /* Digunakan untuk tombol utama (biasanya menggunakan kombinasi warna primary & primary-light) */
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}
```

---

## 🎨 Pola Pemakaian di Code (React/Tailwind)

Jika Anda ingin menambahkan komponen baru, selalu gunakan variabel bawaan aplikasi ketimbang mendeklarasikan warna manual.

**Contoh: Benar ✅** *(Menggunakan token Aicount)*
```tsx
<button className="bg-primary text-white border-primary-100">Simpan</button>
<p className="text-text-muted">Deskirpsi...</p>
```

**Contoh: Salah ❌** *(Akan sulit jika ganti tema di kemudian hari)*
```tsx
<button className="bg-[#2A9D8F] text-white">Simpan</button>
<p className="text-gray-400">Deskripsi...</p>
```

Selamat berkarya dan bereksperimen dengan desain Aicount! ✨
