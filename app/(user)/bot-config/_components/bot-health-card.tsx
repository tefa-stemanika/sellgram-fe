'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, Clock, KeyRound, RefreshCw, Webhook, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'
import type { Tone } from '@/lib/status-tokens'
import { getBotHealth, type BotHealth } from '@/services/bot-health'

const ISSUE_LABELS: Record<string, string> = {
  TOKEN_MISSING: 'Token bot belum diisi',
  TOKEN_INVALID: 'Token bot tidak valid',
  WEBHOOK_URL_MISSING: 'Webhook tidak terpasang',
  WEBHOOK_URL_INVALID: 'URL webhook tidak valid',
  WEBHOOK_LAST_ERROR_RECENT: 'Telegram melaporkan error webhook terbaru',
  WEBHOOK_PENDING_BACKLOG: 'Antrian update menumpuk di webhook',
  WEBHOOK_CHECK_FAILED: 'Status webhook tidak dapat diperiksa',
  WEBHOOK_URL_MISMATCH: 'URL webhook tidak sesuai yang diharapkan',
  BOT_NOT_SPAWNED: 'Runtime bot belum aktif',
  TELEGRAM_API_UNREACHABLE: 'API Telegram tidak dapat dihubungi',
  CONFIG_UNAVAILABLE: 'Konfigurasi bot tidak tersedia'
}

const CRITICAL_CODES = new Set([
  'TOKEN_MISSING',
  'TOKEN_INVALID',
  'WEBHOOK_URL_MISSING',
  'WEBHOOK_URL_INVALID',
  'WEBHOOK_URL_MISMATCH'
])

const TONE_DOT: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  processing: 'bg-status-processing',
  confirmed: 'bg-status-confirmed',
  neutral: 'bg-status-neutral'
}

type CheckRow = {
  key: string
  icon: LucideIcon
  label: string
  tone: Tone
  detail: string
}

function statusTone(status: string | undefined): Tone {
  const s = (status ?? '').toLowerCase()
  if (s === 'ok') return 'success'
  if (s === 'warning' || s === 'warn' || s === 'degraded') return 'warning'
  if (s === 'error' || s === 'critical' || s === 'failed') return 'error'
  return 'neutral'
}

function buildRows(health: BotHealth): CheckRow[] {
  const { token, webhook, runtime, activity } = health.checks
  const rows: CheckRow[] = []

  rows.push({
    key: 'token',
    icon: KeyRound,
    label: 'Token bot',
    tone: statusTone(token.status),
    detail:
      token.status === 'ok'
        ? `@${token.username ?? '-'} (ID ${token.botId ?? '-'})${token.firstName ? ` — ${token.firstName}` : ''}`
        : (token.error ?? 'Token tidak valid')
  })

  rows.push({
    key: 'webhook',
    icon: Webhook,
    label: 'Webhook',
    tone: statusTone(webhook.status),
    detail:
      webhook.status === 'ok'
        ? `${webhook.pendingUpdateCount ?? 0} update menunggu${webhook.url ? ` — ${webhook.url}` : ''}`
        : (webhook.error ?? webhook.lastErrorMessage ?? 'Webhook bermasalah')
  })

  rows.push({
    key: 'runtime',
    icon: Zap,
    label: 'Runtime',
    tone: runtime.active ? 'success' : 'warning',
    detail: runtime.active ? 'Bot berjalan' : 'Bot tidak aktif'
  })

  rows.push({
    key: 'activity',
    icon: Clock,
    label: 'Aktivitas terakhir',
    tone: activity.lastUpdateAt ? 'success' : 'neutral',
    detail: activity.lastUpdateAt ? formatDateTime(activity.lastUpdateAt) : 'Belum ada update tercatat'
  })

  return rows
}

type BotHealthCardProps = {
  token: string
}

export function BotHealthCard({ token }: BotHealthCardProps) {
  const [health, setHealth] = useState<BotHealth | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (refresh: boolean) => {
      if (!token) return
      setIsLoading(true)
      setError(null)
      try {
        setHealth(await getBotHealth(token, refresh))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memeriksa kesehatan bot')
      } finally {
        setIsLoading(false)
      }
    },
    [token]
  )

  useEffect(() => {
    if (!token) {
      setHealth(null)
      return
    }
    void load(false)
  }, [token, load])

  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-small-header">Kesehatan bot</h2>
              {health && <StatusBadge kind="bot-health" value={health.status.toUpperCase()} withDot />}
            </div>
            <p className="text-caption mt-0.5 text-muted-foreground">
              {health
                ? `Diperiksa ${formatDateTime(health.checkedAt)}${health.cached ? ' · hasil cache' : ' · hasil live'}`
                : 'Validitas token, webhook, runtime, dan aktivitas terakhir.'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-2" disabled={isLoading} onClick={() => void load(true)}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Memeriksa...' : 'Periksa ulang'}
        </Button>
      </div>

      {isLoading && !health ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="ml-auto h-3.5 w-44" />
            </div>
          ))}
        </div>
      ) : health ? (
        <>
          <ul className="mt-4 divide-y divide-border">
            {buildRows(health).map((row) => {
              const Icon = row.icon
              return (
                <li key={row.key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-36 shrink-0 text-body-sm">{row.label}</span>
                  <span className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[row.tone]}`} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-body-sm text-muted-foreground" title={row.detail}>
                    {row.detail}
                  </span>
                </li>
              )
            })}
          </ul>
          {health.issues.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {health.issues.map((issue) => {
                const isCritical = issue.severity === 'critical' || CRITICAL_CODES.has(issue.code)
                return (
                  <li key={issue.code} className="flex items-center gap-2 text-caption">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${isCritical ? 'bg-error' : 'bg-warning'}`}
                      aria-hidden
                    />
                    <span className={isCritical ? 'font-medium text-error' : 'font-medium text-warning'}>
                      {ISSUE_LABELS[issue.code] ?? issue.code}
                    </span>
                    {issue.message && <span className="truncate text-muted-foreground">{issue.message}</span>}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : error ? (
        <p className="mt-4 text-body-sm text-muted-foreground">{error}</p>
      ) : null}
    </Surface>
  )
}
