import { useState, useRef, useEffect } from 'react'
import PixelButton from '../shared/PixelButton'
import PixelPanel from '../shared/PixelPanel'
import InboxItemCard from './InboxItemCard'
import ProcessInboxItem from './ProcessInboxItem'
import { useInbox } from '../../hooks/useInbox'
import { usePlayer } from '../../hooks/usePlayer'
import type { InboxItem } from '../../types'

interface Props {
  userId: string
}

export default function InboxSection({ userId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showCapture, setShowCapture] = useState(false)
  const [draft, setDraft] = useState('')
  const [processingItem, setProcessingItem] = useState<InboxItem | null>(null)
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: items, isLoading, addItem, deleteItem } = useInbox(userId)
  const { data: player } = usePlayer(userId)

  const count = items?.length ?? 0

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft])

  useEffect(() => {
    if (showCapture && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showCapture])

  function handleCapture() {
    if (!draft.trim()) return
    addItem.mutate(draft.trim())
    setDraft('')
    setShowCapture(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleCapture()
    }
    if (e.key === 'Escape') {
      setShowCapture(false)
      setDraft('')
    }
  }

  function handleDiscard(id: string) {
    deleteItem.mutate(id)
    if (processingItem?.id === id) setProcessingItem(null)
  }

  async function copyToken() {
    if (!player?.sync_token) return
    await navigator.clipboard.writeText(player.sync_token)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  return (
    <section>
      {/* Collapsed header bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="section-header flex-1 flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all mb-0"
        >
          <span>{expanded ? '▼' : '▶'}</span>
          <span>INBOX</span>
          {count > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white font-pixel text-[10px] leading-none">
              {count}
            </span>
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowCapture((v) => !v) }}
          className="flex items-center justify-center w-7 h-7 rounded border-2 border-rpg-border bg-rpg-surface text-rpg-gold font-grimoire text-grimoire-lg hover:bg-rpg-border hover:text-white transition-colors flex-shrink-0"
          title="Quick capture"
        >
          +
        </button>
        {/* Sync setup toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowTokenSetup((v) => !v) }}
          className="flex items-center justify-center w-7 h-7 rounded border-2 border-rpg-border bg-rpg-surface text-rpg-muted font-grimoire text-grimoire-sm hover:bg-rpg-border hover:text-white transition-colors flex-shrink-0"
          title="Sync setup"
        >
          ⚙
        </button>
      </div>

      {/* Sync setup panel — shows the HUB_SYNC_TOKEN for the Apps Script */}
      {showTokenSetup && (
        <PixelPanel className="mb-2 flex flex-col gap-2">
          <p className="font-grimoire text-grimoire-sm text-rpg-gold">Sync Setup</p>
          <p className="font-body text-body-sm text-rpg-muted">
            Copy this token into your Apps Script as the <code>HUB_SYNC_TOKEN</code> script property.
          </p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 pixel-input font-body text-body-sm text-rpg-text truncate select-all">
              {player?.sync_token ?? '— player not loaded —'}
            </code>
            <PixelButton size="xs" variant="gold" onClick={copyToken} disabled={!player?.sync_token}>
              {tokenCopied ? '✓' : 'COPY'}
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      {/* Quick capture inline */}
      {showCapture && (
        <PixelPanel className="mb-2">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              className="pixel-input resize-none overflow-hidden flex-1"
              placeholder="Capture a thought… (Ctrl+Enter)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={500}
            />
            <PixelButton
              size="xs"
              variant="gold"
              onClick={handleCapture}
              disabled={!draft.trim() || addItem.isPending}
            >
              {addItem.isPending ? '...' : '↵'}
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      {/* Expanded item list */}
      {expanded && (
        <div className="flex flex-col gap-1">
          {isLoading && (
            <div className="font-grimoire text-grimoire-sm text-rpg-muted p-2">Loading...</div>
          )}

          {!isLoading && count === 0 && (
            <PixelPanel className="mb-1">
              <p className="font-grimoire text-grimoire-sm text-rpg-muted">Inbox empty.</p>
            </PixelPanel>
          )}

          {count > 0 && (
            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {(items ?? []).map((item) =>
                processingItem?.id === item.id ? (
                  <ProcessInboxItem
                    key={item.id}
                    item={item}
                    userId={userId}
                    onDone={() => setProcessingItem(null)}
                  />
                ) : (
                  <InboxItemCard
                    key={item.id}
                    item={item}
                    onProcess={(i) => setProcessingItem(i)}
                    onDiscard={handleDiscard}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
