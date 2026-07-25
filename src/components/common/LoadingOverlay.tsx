type LoadingOverlayProps = {
  loading: boolean
  label?: string
}

export function LoadingOverlay({ loading, label = '数据刷新中...' }: LoadingOverlayProps) {
  if (!loading) return null

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
