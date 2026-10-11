import { cn } from '@/lib/utils'

type TelegramChatPreviewProps = {
  /** Each string renders as one bot bubble. Newlines inside a bubble are preserved. */
  lines: string[]
  title?: string
  className?: string
}

export function TelegramChatPreview({ lines, title = 'Telegram', className }: TelegramChatPreviewProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg border border-border bg-cover bg-center shadow-l1', className)}
      style={{ backgroundImage: 'url(/images/telegram-chat-background.jpg)' }}
      role="img"
      aria-label={title}
    >
      <div className="space-y-2.5 p-4 sm:p-5">
        {lines.map((line, index) => (
          <div key={index} className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-bl-sm bg-white/95 px-3.5 py-2.5 text-sm leading-relaxed text-black shadow-l1 dark:bg-card/95 dark:text-card-foreground">
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
