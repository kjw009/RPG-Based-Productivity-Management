interface Props {
  title: string
  sub?: string
}

export default function SectionHeader({ title, sub }: Props) {
  return (
    <div className="section-header mb-3">
      {title}
      {sub && <span className="text-rpg-gold ml-3 font-pixel text-pixel-xs">{sub}</span>}
    </div>
  )
}
