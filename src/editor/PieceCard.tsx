import { cn } from '@/lib/utils'
import type { CatalogFamily } from '@/data/catalog'
import { Preview, type PreviewSource } from './Preview'

interface PieceCardProps {
  label: string
  preview: PreviewSource
  active: boolean
  onClick: () => void
  compact?: boolean // tamaño chico (para variantes)
}

// Una ficha del menú: imagen de la pieza arriba y su nombre abajo. Resaltada si está activa.
export function PieceCard({ label, preview, active, onClick, compact = false }: PieceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        'flex min-w-0 flex-col items-center gap-1 rounded-xl border text-center leading-tight font-bold transition-colors',
        compact ? 'p-1.5 text-[10px]' : 'p-2 text-[11px]',
        active ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'bg-card hover:bg-muted',
      )}
    >
      <Preview source={preview} size={compact ? 40 : 56} />
      <span className="w-full truncate">{label}</span>
    </button>
  )
}

// Las variantes de una familia como fichas con su imagen: Normal · Grande · Retorcido…
export function VariantGrid({
  family,
  value,
  onChange,
}: {
  family: CatalogFamily
  value: string
  onChange: (key: string) => void
}) {
  if (family.variants.length < 2) return null

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold text-muted-foreground">Variantes de {family.label.toLowerCase()}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {family.variants.map((variant) => (
          <PieceCard
            key={variant.key}
            compact
            label={variant.label}
            preview={{ url: variant.url ?? family.url, node: variant.node, emoji: family.emoji }}
            active={variant.key === value}
            onClick={() => onChange(variant.key)}
          />
        ))}
      </div>
    </div>
  )
}
