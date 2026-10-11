import type { Metadata } from 'next'

import RegisterLayout from './_layouts/register-layout'

export const metadata: Metadata = {
  title: 'Daftar',
  robots: {
    index: false,
    follow: false
  }
}

const RegisterPage = () => {
  return <RegisterLayout />
}

export default RegisterPage
