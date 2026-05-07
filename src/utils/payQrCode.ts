import QRCode from 'qrcode'

interface PayQrCodeData {
  qrCode?: string
  qrCodeUrl?: string
}

export const buildPayQrCodeUrl = async (data?: PayQrCodeData | null) => {
  if (data?.qrCode) {
    return QRCode.toDataURL(data.qrCode, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M'
    })
  }

  return data?.qrCodeUrl || ''
}
