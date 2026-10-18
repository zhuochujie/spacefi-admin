import { useEffect, useState, type FormEvent } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  busy?: boolean
  variant?: 'split' | 'modal'
  extraInfo?: string
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  busy = false,
  variant = 'split',
  extraInfo,
  onPageChange,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState(String(page))
  const safeTotalPages = Math.max(1, totalPages)

  useEffect(() => {
    setJumpPage(String(page))
  }, [page])

  const goToPage = (nextPage: number) => {
    const normalizedPage = Math.min(safeTotalPages, Math.max(1, nextPage))

    if (normalizedPage !== page) {
      onPageChange(normalizedPage)
      return
    }

    setJumpPage(String(normalizedPage))
  }

  const handleJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextPage = Number.parseInt(jumpPage, 10)
    if (!Number.isFinite(nextPage)) {
      setJumpPage(String(page))
      return
    }

    goToPage(nextPage)
  }

  return (
    <div className={`pager pager-${variant}`}>
      <div className="pager-left">
        <button type="button" className="secondary" onClick={() => goToPage(page - 1)} disabled={busy || page <= 1}>
          上一页
        </button>
      </div>
      <div className="pager-center">
        <span>
          {page} / {safeTotalPages}
          {extraInfo ? ` · ${extraInfo}` : ''}
        </span>
        <form className="pager-jump" onSubmit={handleJump}>
          <span>跳至</span>
          <input
            value={jumpPage}
            type="number"
            min={1}
            max={safeTotalPages}
            inputMode="numeric"
            disabled={busy}
            onChange={(event) => setJumpPage(event.target.value)}
          />
          <span>页</span>
          <button type="submit" className="secondary small" disabled={busy}>
            跳转
          </button>
        </form>
      </div>
      <div className="pager-right">
        <button type="button" className="secondary" onClick={() => goToPage(page + 1)} disabled={busy || page >= safeTotalPages}>
          下一页
        </button>
      </div>
    </div>
  )
}
