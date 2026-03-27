import type { Metadata } from 'next'

import LoginLayout from './_layouts/login-layout'

export const metadata: Metadata = {
  title: 'Login',
  robots: {
    index: false,
    follow: false
  }
}

const LoginPage = () => {
  return <LoginLayout />
}

export default LoginPage
