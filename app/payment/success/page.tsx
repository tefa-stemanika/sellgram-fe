import type { Metadata } from 'next'
import { PaymentSuccessClient } from './_components/payment-success-client'

export const metadata: Metadata = {
  title: 'Pembayaran Berhasil',
  robots: {
    index: false,
    follow: false
  }
}

const PaymentSuccessPage = () => {
  return <PaymentSuccessClient />
}

export default PaymentSuccessPage
