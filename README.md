# 💰 Aplikasi Pelacakan Keuangan - Dokumentasi API

## 📡 Endpoint & Respons Lengkap

### 1. Registrasi Pengguna
- **URL:** `/register`
- **Metode:** `POST`

#### Request
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "rahasia123"
}
```

#### Respons Sukses (201)
```json
{
  "status": "Sukses",
  "pesan": "berhasil register",
  "user_id": "user-aBcD1EfGh",
  "email": "john@example.com",
  "username": "johndoe"
}
```

#### Respons Gagal - Email Sudah Digunakan (409)
```json
{
  "status": "Error",
  "pesan": "Email sudah di gunakan"
}
```

#### Respons Gagal - Kesalahan Server (500)
```json
{
  "status": "database error",
  "pesan": "gagal login"
}
```

### 2. Login Pengguna
- **URL:** `/login`
- **Metode:** `POST`

#### Request
```json
{
  "email": "john@example.com",
  "password": "rahasia123"
}
```

#### Respons Sukses (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
}
```

#### Respons Gagal - Email Tidak Ditemukan (404)
```json
{
  "status": "Error", 
  "pesan": "Email atau password tidak ditemukan"
}
```

#### Respons Gagal - Password Salah (401)
```json
{
  "status": "Error",
  "pesan": "Email atau password salah"
}
```

### 3. Tambah Transaksi
- **URL:** `/transactions/{user_id}`
- **Metode:** `POST`

#### Request
```json
{
  "jumlah": 500000,
  "type": "pemasukan",
  "deskripsi": "Gaji bulanan",
  "tanggal": "2024-03-28"
}
```

#### Respons Sukses (201)
```json
{
  "status": "Sukses",
  "pesan": "Berhasil menambahkan transaksi"
}
```

#### Respons Gagal (500)
```json
{
  "status": "Error",
  "pesan": "Gagal menambahkan transaksi: [detail error]"
}
```

### 4. Ringkasan Transaksi
- **URL:** `/transactions/{user_id}`
- **Metode:** `GET`

#### Respons Sukses (200)
```json
{
  "status": "Sukses", 
  "data": {
    "user_id": "user-aBcD1EfGh",
    "total_pemasukan": 5000000,
    "total_pengeluaran": 2500000,
    "saldo_sekarang": 2500000
  }
}
```

### 5. Detail Transaksi
- **URL:** `/transactions/detail/{user_id}`
- **Metode:** `GET`

#### Respons Sukses (200)
```json
{
  "status": "Sukses",
  "pesan": "Berhasil mendapatkan detail transaksi",
  "data": [
    {
      "id": 1,
      "user_id": "user-aBcD1EfGh",
      "amount": "Rp 500.000",
      "type": "pemasukan",
      "description": "Gaji bulanan",
      "transaction_date": "2024-03-28"
    },
    {
      "id": 2,
      "user_id": "user-aBcD1EfGh", 
      "amount": "Rp 200.000",
      "type": "pengeluaran",
      "description": "Bayar listrik",
      "transaction_date": "2024-03-25"
    }
  ]
}
```

### 6. Chatbot AI
- **URL:** `/chatbot/{user_id}`
- **Metode:** `POST`

#### Request
```json
{
  "text": "Berapa saldo saya hari ini?"
}
```

#### Respons Sukses (200)
```json
{
  "status": "Sukses",
  "pesan": "Berdasarkan data transaksi Anda, saldo saat ini adalah Rp 2.500.000. Apakah ada yang bisa saya bantu?"
}
```

#### Respons Gagal (500)
```json
{
  "status": "Error", 
  "pesan": "Maaf terjadi masalah servis, mohon tunggu dan kirim kembali"
}
```
