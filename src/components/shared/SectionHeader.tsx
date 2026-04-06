import { ReactNode } from 'react'

interface Props {
  title: string
  sub?: string
  icon?: string
  actions?: ReactNode
}

// Map section titles to thematic icons
const SECTION_ICONS: Record<string, string> = {
  'DAILY TASKS': '☀',
  'QUESTS':      '⚔',
  'PROJECTS':    '📜',
  'AREAS':       '🗺',
  'HABITS':      '♦',
  'ABILITIES':   '✧',
  'ITEM SHOP':   '⚗',
  'INBOX':       '📥',
}

export default function SectionHeader({ title, sub, icon, actions }: Props) {
  const sectionIcon = icon ?? SECTION_ICONS[title] ?? '✦'

  return (
    <div className="section-header mb-3 flex items-center">
      <span className="mr-2 text-sm opacity-80">{sectionIcon}</span>
      <span>{title}</span>
      {sub && <span className="text-rpg-gold ml-3 font-grimoire text-grimoire-sm opacity-80">{sub}</span>}
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  )
}
