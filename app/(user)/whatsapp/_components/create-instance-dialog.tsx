'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NUMBER_PATTERN = /^\d{8,15}$/

type CreateInstanceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSubmitting: boolean
  onSubmit: (number?: string) => void
}

export function CreateInstanceDialog({ open, onOpenChange, isSubmitting, onSubmit }: CreateInstanceDialogProps) {
  const [number, setNumber] = useState('')
  const trimmed = number.trim()
  const invalid = trimmed.length > 0 && !NUMBER_PATTERN.test(trimmed)

  const handleSubmit = () => {
    if (invalid || isSubmitting) return
    onSubmit(trimmed || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat instance WhatsApp</DialogTitle>
          <DialogDescription>
            Instance akan dibuat di server Evolution dan webhook otomatis dipasang. Satu akun hanya boleh punya satu
            instance.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="wa-number">Nomor WhatsApp (opsional)</Label>
            <Input
              id="wa-number"
              inputMode="numeric"
              placeholder="6281234567890"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\s/g, ''))}
              aria-invalid={invalid}
            />
            <p className="text-caption text-muted-foreground">
              8&ndash;15 digit. Isi nomor untuk menampilkan kode pairing sebagai alternatif scan QR.
            </p>
            {invalid && <p className="text-caption text-error">Format nomor tidak valid.</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Phone className="mr-1.5 h-4 w-4" />
              {isSubmitting ? 'Membuat...' : 'Buat instance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
