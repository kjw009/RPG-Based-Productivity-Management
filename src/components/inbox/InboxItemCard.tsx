import PixelButton from '../shared/PixelButton'
import type { InboxItem } from '../../types'

interface Props {
  item: InboxItem
  onProcess: (item: InboxItem) => void
  onDiscard: (id: string) => void
}

const SOURCE_LABEL: Record<InboxItem['source'], string> = {
  manual: 'IN-APP',
  tasks:  'TASKS',
  gmail:  'GMAIL',
}

const SOURCE_COLOR: Record<InboxItem['source'], string> = {
  manual: 'text-rpg-muted',
  tasks:  'text-amber-400',
  gmail:  'text-rpg-hp',
}

export default function InboxItemCard({ item, onProcess, onDiscard }: Props) {
  const meta = item.source_meta

  return (
    <div className="inventory-slot p-3 flex gap-3 items-start">
      <div className="flex-1 min-w-0">
        <div className="font-body text-body-base text-rpg-text leading-snug">{item.content}</div>

        {meta?.from && (
          <div className="font-pixel text-pixel-xs text-rpg-muted mt-0.5 truncate">
            from: {meta.from}
          </div>
        )}
        {meta?.body_preview && (
          <div className="font-body text-body-sm text-rpg-muted mt-0.5 line-clamp-2">
            {meta.body_preview}
          </div>
        )}

        <span className={`font-pixel text-pixel-xs mt-1 inline-block ${SOURCE_COLOR[item.source]}`}>
          [{SOURCE_LABEL[item.source]}]
        </span>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <PixelButton size="xs" variant="gold" onClick={() => onProcess(item)}>
          PROCESS →
        </PixelButton>
        <PixelButton size="xs" variant="danger" onClick={() => onDiscard(item.id)}>
          ✕ DISCARD
        </PixelButton>
      </div>
    </div>
  )
}
