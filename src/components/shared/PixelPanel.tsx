import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'crimson'
  padding?: boolean
}

const panelClass = {
  default: 'pixel-panel',
  gold: 'pixel-panel-gold',
  crimson: 'pixel-panel-crimson',
}

export default function PixelPanel({
  children,
  className = '',
  variant = 'default',
  padding = true,
}: Props) {
  return (
    <div className={`${panelClass[variant]} ${padding ? 'p-3' : ''} ${className} relative`}>
      {children}
    </div>
  )
}
