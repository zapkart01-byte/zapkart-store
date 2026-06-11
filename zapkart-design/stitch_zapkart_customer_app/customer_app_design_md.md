# ZapKart Unified System - Customer App Design

---
name: ZapKart Unified System
colors:
  primary: '#ff6b00'
  on-primary: '#ffffff'
  primary-container: '#ffebe0'
  on-primary-container: '#4d1e00'
  secondary: '#6b7280'
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f1eded'
  surface-container-high: '#ebe8e7'
  surface-container-highest: '#e5e2e2'
  on-surface: '#0d0d0d'
  on-surface-variant: '#9ca3af'
  outline: '#d1d5db'
  outline-variant: '#f0f0f0'
  error: '#ef4444'
  success: '#16a34a'

typography:
  font-family: 'Inter, sans-serif'
  headline-lg:
    size: 28px
    weight: Bold
    letter-spacing: -0.02em
  headline-md:
    size: 24px
    weight: Bold
  headline-sm:
    size: 20px
    weight: Bold
  title-md:
    size: 17px
    weight: SemiBold
  body-md:
    size: 15px
    weight: Regular
  body-sm:
    size: 13px
    weight: Regular
  label-md:
    size: 11px
    weight: Bold
    letter-spacing: 0.05em

layout:
  grid: 8px
  margin-mobile: 16px
  corner-radius-sm: 8px
  corner-radius-md: 12px
  corner-radius-lg: 14px
  corner-radius-xl: 20px

components:
  buttons:
    primary:
      bg: '#ff6b00'
      text: '#ffffff'
      height: 52px
      radius: 14px
      font: 15px Bold
    secondary:
      bg: '#ffffff'
      border: '1px solid #e9ecef'
      text: '#0d0d0d'
      height: 52px
      radius: 14px
  cards:
    bg: '#ffffff'
    radius: 12px
    shadow: '0 4px 12px rgba(0,0,0,0.05)'
