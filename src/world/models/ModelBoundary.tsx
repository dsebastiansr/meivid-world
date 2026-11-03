import { Component, type ReactNode } from 'react'

// Si el GLB está dañado o falla al cargar, mostramos el respaldo en vez de romper el juego
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('No se pudo cargar un modelo 3D, se usa la forma de respaldo:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
