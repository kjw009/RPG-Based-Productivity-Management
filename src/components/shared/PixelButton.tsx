/**
 * Custom pixel-style button component with variant and size options.
 */
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'gold' | 'purple'
type Size = 'xs' | 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'pixel-btn-primary',
  success: 'pixel-btn-success',
  danger:  'pixel-btn-danger',
  gold:    'pixel-btn-gold',
  purple:  'pixel-btn-purple',
}

const sizeClass: Record<Size, string> = {
  xs: 'pixel-btn-xs',
  sm: 'pixel-btn-sm',
  md: '',
}

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`pixel-btn ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
