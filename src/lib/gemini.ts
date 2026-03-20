import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is missing from environment variables.')
}

// Inisialisasi Gemini client
export const genAI = new GoogleGenerativeAI(apiKey || '')

// Helper untuk format JSON respons AI
export const geminiOptions = {
  generationConfig: {
    temperature: 0.1, // Set rendah agar jawaban deterministik
  }
}

// Prompt Helper untuk Smart Input
export async function parseSmartInput(textInput: string) {
  if (!apiKey) throw new Error('API Key missing')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    ...geminiOptions,
  })

  const prompt = `
Anda adalah asisten keuangan pintar (Smart Input AI).
Ekstrak informasi berikut dari input teks pengguna dan kembalikan HANYA dalam format JSON.
Format JSON yang diharapkan:
{
  "amount": number (ambil nilai nominal, ubah misalnya '50 ribu' menjadi 50000, 'cepek' menjadi 100000, abaikan Rp/titik/koma),
  "categoryName": string (tebak satu kata kategori pengeluaran/pemasukan terdekat dalam bahasa inggris, contoh: 'Food', 'Transport', 'Shopping', 'Salary'),
  "walletName": string (tebak kata nama dompet/bank dalam input jika ada, contoh: 'Cash', 'Gopay', 'BCA', 'Mandiri'. Jika tidak ada, kosongkan string ini),
  "note": string (tulis keterangan sisa atau seluruh kalimat, contoh: "Beli kopi starbucks"),
  "type": string ("expense" jika ini pengeluaran, "income" jika pemasukan, "transfer" jika memindahkan uang. Secara default pengeluaran jika ada kata beli/jajan/bayar/keluar)
}

Input pengguna: "${textInput}"
`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // AI kadang membalas dengan markdown ```json \n ... \n ```
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('Error parsing smart input:', error)
    throw new Error('Gagal mengekstrak data dari input')
  }
}

// Prompt Helper untuk Receipt Scanner
export async function parseReceiptImage(base64Image: string, mimeType: string) {
  if (!apiKey) throw new Error('API Key missing')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    ...geminiOptions,
  })

  // Format base64 yang dibutuhkan SDK Gemini
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  }

  const prompt = `
Anda adalah asisten keuangan pintar untuk Receipt Scanner. 
Ekstrak informasi berikut dari gambar struk belanja ini dan kembalikan HANYA dalam format JSON.
Format JSON yang diharapkan:
{
  "amount": number (ambil TOTAL AKHIR pembayaran, abaikan PPN/kembalian. Pastikan berupa angka bulat dlm IDR, misal 50000),
  "categoryName": string (pilih satu kategori paling cocok dalam bahasa Inggris, contoh: 'Food', 'Groceries', 'Shopping', 'Health', 'Transport'),
  "note": string (buat ringkasan singkat dari item-item yg dibeli di struk tsb, contoh: "Indomaret: Beli Roti, Susu, Sabun"),
  "type": "expense"
}
`

  try {
    const result = await model.generateContent([prompt, imagePart])
    const responseText = result.response.text()
    
    // AI kadang membalas dengan markdown
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('Error parsing receipt:', error)
    throw new Error('Gagal mengekstrak data dari struk belanja')
  }
}

// Prompt Helper untuk Financial Advisor
export async function getFinancialAdvice(transactionsSummaryJSON: string) {
  if (!apiKey) throw new Error('API Key missing')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7 // Sedikit lebih kreatif untuk memberi saran
    }
  })

  const prompt = `
Anda adalah konsultan keuangan pribadi (Financial Advisor) yang sangat ahli dan ramah.
Berikut adalah data ringkasan transaksi pengguna bulan ini dalam format JSON:
${transactionsSummaryJSON}

Berdasarkan data tersebut, berikan HANYA 3 poin saran keuangan yang praktis, suportif, dan mudah dipahami dalam bahasa Indonesia.
Fokus pada pola pengeluaran atau sisa saldo.
Kembalikan HANYA sebuah array string JSON (tanpa markdown), contoh:
[
  "Pengeluaran untuk makanan cukup besar bulan ini, coba kurangi jajan di luar ya.",
  "Bagus! Anda masih memiliki sisa budget yang sehat.",
  "Pertimbangkan untuk mulai menyisihkan 10% dari sisa saldo untuk dana darurat."
]
`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleanJson) as string[]
  } catch (error) {
    console.error('Error getting financial advice:', error)
    throw new Error('Gagal mendapatkan saran keuangan')
  }
}
