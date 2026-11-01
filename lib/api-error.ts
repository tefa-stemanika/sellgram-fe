const CODE_COPY: Record<string, string> = {
  PLAN_LIMIT_EXCEEDED: 'Batas paket Anda tercapai. Upgrade paket untuk menambah kuota.',
  FEATURE_NOT_ALLOWED: 'Fitur ini tidak tersedia di paket Anda saat ini.',
  channel_not_supported: 'Broadcast hanya tersedia untuk Telegram.',

  not_configured: 'Credential Evolution API belum dikonfigurasi di sisi server.',
  public_base_url_missing: 'URL publik server belum dikonfigurasi, webhook tidak bisa dipasang.',
  webhook_secret_missing: 'Secret webhook belum dikonfigurasi di sisi server.',
  invalid_number: 'Nomor WhatsApp tidak valid. Gunakan format 628xxxxxxxxxxx.',
  server_unreachable: 'Server Evolution sedang tidak dapat dihubungi.',
  instance_missing: 'Buat instance dulu sebelum scan QR.',
  instance_limit_reached: 'Akun ini sudah punya 1 instance WhatsApp.',
  create_failed: 'Instance WhatsApp gagal dibuat di Evolution.',
  restart_failed: 'Instance WhatsApp gagal direstart.',
  webhook_failed: 'Webhook gagal disinkronkan ke Evolution.'
}

const STATUS_COPY: Record<number, string> = {
  400: 'Permintaan tidak valid. Periksa kembali data yang Anda masukkan.',
  401: 'Sesi Anda berakhir. Silakan masuk kembali.',
  403: 'Anda tidak punya akses untuk aksi ini.',
  404: 'Data tidak ditemukan.',
  408: 'Permintaan melebihi batas waktu. Coba lagi.',
  409: 'Data sudah berubah. Muat ulang halaman lalu coba lagi.',
  422: 'Data yang dikirim tidak sesuai ketentuan.',
  429: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
  500: 'Terjadi kesalahan pada server.',
  502: 'Server upstream menolak permintaan. Coba lagi tidak memperbaiki kondisi ini.',
  503: 'Layanan sedang tidak tersedia. Coba lagi nanti.'
}

export const GENERIC_SERVER_ERROR = 'Terjadi kesalahan pada server.'

export type ApiErrorInfo = {
  message: string
  code?: string
  status?: number
  canRetry: boolean
}

export function copyForErrorCode(code?: string | null): string | null {
  if (!code) return null
  return CODE_COPY[code] ?? null
}

function statusCopy(status?: number): string {
  if (status === undefined) return GENERIC_SERVER_ERROR
  return STATUS_COPY[status] ?? (status >= 500 ? GENERIC_SERVER_ERROR : 'Permintaan gagal.')
}

export function describeApiError(error: unknown, fallback?: string): ApiErrorInfo {
  const err = error as (Error & { code?: string; status?: number }) | null | undefined
  const code = typeof err?.code === 'string' && err.code.length > 0 ? err.code : undefined
  const status = typeof err?.status === 'number' ? err.status : undefined
  const backendMessage = typeof err?.message === 'string' && err.message.trim() !== '' ? err.message.trim() : null

  const message =
    copyForErrorCode(code) ??
    (status !== undefined && status >= 500 ? statusCopy(status) : backendMessage) ??
    (status !== undefined ? statusCopy(status) : null) ??
    fallback ??
    GENERIC_SERVER_ERROR

  return {
    message,
    code,
    status,
    canRetry: status === undefined ? true : status === 503 || (status >= 500 && status !== 502)
  }
}

export function apiErrorMessage(error: unknown, fallback?: string): string {
  return describeApiError(error, fallback).message
}

export function canRetryApiError(error: unknown): boolean {
  return describeApiError(error).canRetry
}
