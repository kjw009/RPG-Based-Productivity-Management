/**
 * SectionHeader — reusable header bar for each dashboard section.
 *
 * Renders a thematic icon, the section title, an optional subtitle,
 * and an optional actions slot (e.g. buttons) pushed to the right.
 * Icons are auto-mapped from the section title via SECTION_ICONS,
 * but can be overridden with the `icon` prop.
 */

import { ReactNode } from 'react'

/** Props for the SectionHeader component */
interface Props {
  title: string           // Section name displayed in the header
  sub?: string            // Optional subtitle (e.g. "3 active") shown to the right of the title
  icon?: string           // Override the auto-mapped icon for this section
  actions?: ReactNode     // Optional slot for action buttons (rendered with ml-auto to push right)
}

/**
 * Maps well-known section titles to their thematic RPG icons.
 * If a title isn't listed here and no `icon` prop is provided,
 * the fallback icon '✦' is used.
 */
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

/**
 * Renders a horizontal header bar for a dashboard section.
 * Layout: [icon] [TITLE] [subtitle?] ———————— [actions?]
 *
 * @param title   - Bold section name
 * @param sub     - Muted subtitle text (optional)
 * @param icon    - Emoji/character override for the leading icon (optional)
 * @param actions - ReactNode slot for buttons/controls aligned to the right (optional)
 */
export default function SectionHeader({ title, sub, icon, actions }: Props) {
  // Use the explicit icon prop, fall back to the title-based map, then '✦'
  const sectionIcon = icon ?? SECTION_ICONS[title] ?? '✦'

  return (
    <div className="section-header mb-3 flex items-center">
      {/* Thematic icon leading the title */}
      <span className="mr-2 text-sm opacity-80">{sectionIcon}</span>
      {/* Section title text — styled by the .section-header CSS class */}
      <span>{title}</span>
      {/* Optional subtitle — smaller, gold-tinted, slightly transparent */}
      {sub && <span className="text-rpg-gold ml-3 font-grimoire text-grimoire-sm opacity-80">{sub}</span>}
      {/* Optional actions slot — ml-auto pushes it to the far right of the flex row */}
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  )
}
