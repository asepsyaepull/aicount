export const walletTypes = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
] as const

export const walletColors = [
  { value: '#2A9D8F', label: 'Teal' },
  { value: '#E76F51', label: 'Coral' },
  { value: '#264653', label: 'Navy' },
  { value: '#E9C46A', label: 'Gold' },
  { value: '#6C63FF', label: 'Purple' },
  { value: '#F4A261', label: 'Orange' },
]

export const bankOptions = [
  { id: 'bca', name: 'BCA', color: '#0066AE', logo: '/logo-payment/Bank-BCA.png' },
  { id: 'mandiri', name: 'Mandiri', color: '#0A3967', logo: '/logo-payment/Bank-Mandiri.png' },
  { id: 'bni', name: 'BNI', color: '#005E6A', logo: '/logo-payment/Bank-BNI.png' },
  { id: 'bri', name: 'BRI', color: '#00529C', logo: '/logo-payment/Bank-BRI.png' },
  { id: 'bsi', name: 'BSI', color: '#00A39E', logo: '/logo-payment/Bank-BSI.png' },
  { id: 'jago', name: 'Bank Jago', color: '#F37021', logo: '/logo-payment/Bank-Jago.png' },
  { id: 'jenius', name: 'Jenius', color: '#00B4CB', logo: '/logo-payment/Bank-Jenius.png' },
  { id: 'permata', name: 'Permata', color: '#00854A', logo: '/logo-payment/Bank-Permata.png' },
]

export const ewalletOptions = [
  { id: 'gopay', name: 'GoPay', color: '#00AED6', logo: '/logo-payment/E-Wallet-Gopay.png' },
  { id: 'ovo', name: 'OVO', color: '#4C3494', logo: '/logo-payment/E-Wallet-OVO.png' },
  { id: 'dana', name: 'DANA', color: '#118EE9', logo: '/logo-payment/E-Wallet-DANA.png' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D', logo: '/logo-payment/E-Wallet-Shopee.png' },
  { id: 'linkaja', name: 'LinkAja', color: '#E31212', logo: '/logo-payment/E-Wallet-LinkAja.png' },
]
