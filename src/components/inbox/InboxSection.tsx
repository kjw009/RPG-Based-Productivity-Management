import { useState, useRef, useEffect } from 'react'
import SectionHeader from '../shared/SectionHeader'
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
  const [draft, setDraft] = useState('')
  const [processingItem, setProcessingItem] = useState<InboxItem | null>(null)
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: items, isLoading, addItem, deleteItem } = useInbox(userId)
  const { data: player } = usePlayer(userId)

  const count = items?.length ?? 0

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft])

  function handleCapture() {
    if (!draft.trim()) return
    addItem.mutate(draft.trim())
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter submits
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleCapture()
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
      <SectionHeader
        title="INBOX"
        sub={count > 0 ? `${count} to process` : 'clear'}
      />

      {/* Capture input */}
      <PixelPanel className="mb-3">
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            className="pixel-input resize-none overflow-hidden"
            placeholder="Capture a thought, idea, or note… (Ctrl+Enter to add)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={500}
          />
          <div className="flex items-center gap-2">
            <PixelButton
              size="sm"
              variant="gold"
              onClick={handleCapture}
              disabled={!draft.trim() || addItem.isPending}
            >
              {addItem.isPending ? 'SAVING...' : '+ CAPTURE'}
            </PixelButton>
            {addItem.isError && (
              <span className="font-pixel text-pixel-xs text-rpg-hp">Failed to save.</span>
            )}
          </div>
        </div>
      </PixelPanel>

      {/* Items */}
      {isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-2">Loading inbox...</div>
      )}

      {!isLoading && count === 0 && (
        <PixelPanel className="mb-3">
          <p className="font-body text-body-base text-rpg-muted">Inbox is empty. Capture something!</p>
        </PixelPanel>
      )}

      {count > 0 && (
        <div className="flex flex-col gap-2 mb-3">
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

      {/* Apps Script sync token setup */}
      <div className="mt-1">
        <PixelButton
          size="xs"
          variant="primary"
          onClick={() => setShowTokenSetup((v) => !v)}
        >
          {showTokenSetup ? '▼' : '▶'} SYNC SETUP
        </PixelButton>

        {showTokenSetup && (
          <PixelPanel className="mt-2">
            <div className="font-pixel text-pixel-xs text-rpg-gold mb-2">GOOGLE APPS SCRIPT SYNC</div>
            <p className="font-body text-body-sm text-rpg-muted mb-3">
              Paste this token into the Apps Script&apos;s Script Properties as{' '}
              <code className="font-pixel text-pixel-xs text-rpg-text">HUB_SYNC_TOKEN</code>.
              It lets the script insert items without exposing your account credentials.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <code className="font-pixel text-pixel-xs text-rpg-text bg-rpg-bg px-2 py-1 border border-rpg-border select-all break-all">
                {player?.sync_token ?? '…'}
              </code>
              <PixelButton size="xs" variant="success" onClick={copyToken}>
                {tokenCopied ? '✓ COPIED' : 'COPY'}
              </PixelButton>
            </div>

            <div className="font-pixel text-pixel-xs text-rpg-muted mt-3 leading-relaxed">
              Script Properties needed:{' '}
              <span className="text-rpg-text">SUPABASE_URL</span>,{' '}
              <span className="text-rpg-text">SUPABASE_ANON_KEY</span>,{' '}
              <span className="text-rpg-text">HUB_SYNC_TOKEN</span>
            </div>
          </PixelPanel>
        )}
      </div>
    </section>
  )
}
