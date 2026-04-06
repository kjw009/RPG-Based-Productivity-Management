/**
 * Displays a single inbox item with metadata and process/discard actions.
 */
import PixelButton from '../shared/PixelButton'
import type { InboxItem } from '../../types'

interface Props {
  item: InboxItem
  onProcess: (item: InboxItem) => void
  onDiscard: (id: string) => void
}

const SOURCE_LABEL: Record<InboxItem['source'], string> = {
  manual: 'In-App',
  tasks:  'Tasks',
  gmail:  'Gmail',
}

const SOURCE_COLOR: Record<InboxItem['source'], string> = {
  manual: 'ink-muted',
  tasks:  'ink-gold',
  gmail:  'ink-hp',
}

export default function InboxItemCard({ item, onProcess, onDiscard }: Props) {
  const meta = item.source_meta

  return (
    <div className="inventory-slot px-2 py-1.5 flex gap-2 items-start">
      <div className="flex-1 min-w-0">
        <div className="font-grimoire text-grimoire-base ink-text leading-snug">{item.content}</div>

        {meta?.from && (
          <div className="font-grimoire text-grimoire-sm ink-muted mt-0.5 truncate italic">
            from: {meta.from}
          </div>
        )}
        {meta?.body_preview && (
          <div className="font-grimoire text-grimoire-sm ink-muted mt-0.5 line-clamp-2 italic">
            {meta.body_preview}
          </div>
        )}

        <span className={`font-grimoire text-grimoire-sm mt-1 inline-block ${SOURCE_COLOR[item.source]}`}>
          [{SOURCE_LABEL[item.source]}]
        </span>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <PixelButton size="xs" variant="gold" onClick={() => onProcess(item)}>
          Process
        </PixelButton>
        <PixelButton size="xs" variant="danger" onClick={() => onDiscard(item.id)}>
          Discard
        </PixelButton>
      </div>
    </div>
  )
}
