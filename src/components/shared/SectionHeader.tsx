/**
 * SectionHeader — Military command section title bar.
 *
 * Renders a tactical icon, section designation, optional count, and action slot.
 * The `//` bracket prefix is applied by the `.section-header` CSS class.
 */

import { ReactNode } from 'react'

interface Props {
  title: string        // Section designation displayed in the header
  sub?: string         // Optional info label (e.g. "3 active") shown after title
  icon?: string        // Override the auto-mapped icon for this section
  actions?: ReactNode  // Optional slot for action buttons (pushed right via ml-auto)
}

/**
 * Maps section titles to tactical military icons.
 * Fallback: '◈'
 */
const SECTION_ICONS: Record<string, string> = {
  'DAILY TASKS': '◈',
  'QUESTS':      '▷',
  'PROJECTS':    '▦',
  'AREAS':       '◉',
  'HABITS':      '◎',
  'ABILITIES':   '⚡',
  'ITEM SHOP':   '⬡',
  'INBOX':       '▼',
}

/**
 * Renders a horizontal command header for a dashboard section.
 * Layout: // [icon] [DESIGNATION] [count?] ──── [actions?]
 */
export default function SectionHeader({ title, sub, icon, actions }: Props) {
  const sectionIcon = icon ?? SECTION_ICONS[title] ?? '◈'

  return (
    <div className="section-header mb-3">
      {/* Tactical icon */}
      <span className="mr-2 opacity-60" style={{ fontSize: 9 }}>{sectionIcon}</span>
      {/* Section designation */}
      <span>{title}</span>
      {/* Count / status label */}
      {sub && (
        <span
          className="ml-3 font-pixel text-pixel-xs"
          style={{ color: '#2d5a7a', opacity: 0.9 }}
        >
          [{sub}]
        </span>
      )}
      {/* Actions pushed to right */}
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  )
}
