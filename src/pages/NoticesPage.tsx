import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createAdminNotice,
  deleteAdminNotice,
  updateAdminNotice,
  type NoticeItem,
  type NoticePayload,
} from '../api'
import { NoticeModal } from '../components/notices/NoticeModal'
import { NoticeTable } from '../components/notices/NoticeTable'
import { useAdminNoticesQuery, type NoticeFilters } from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'

const defaultFilters: NoticeFilters = {
  page: 1,
  pageSize: 10,
}

type ModalState =
  | {
      mode: 'create'
      notice: null
    }
  | {
      mode: 'edit'
      notice: NoticeItem
    }
  | null

export function NoticesPage() {
  const { token } = useAdminOutlet()
  const [filters, setFilters] = useState<NoticeFilters>(defaultFilters)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const noticesQuery = useAdminNoticesQuery(token, filters, Boolean(token))
  const response = noticesQuery.data
  const notices = response?.list ?? []
  const totalNotices = response?.total ?? 0

  const saveNoticeMutation = useMutation({
    mutationFn: async (payload: NoticePayload) => {
      if (modalState?.mode === 'edit') {
        return updateAdminNotice(token, modalState.notice.id, payload)
      }

      return createAdminNotice(token, {
        title: payload.title ?? '',
        content: payload.content ?? '',
        ...(payload.englishTitle ? { englishTitle: payload.englishTitle } : {}),
        ...(payload.englishContent ? { englishContent: payload.englishContent } : {}),
        ...(payload.thaiTitle ? { thaiTitle: payload.thaiTitle } : {}),
        ...(payload.thaiContent ? { thaiContent: payload.thaiContent } : {}),
        ...(payload.koreanTitle ? { koreanTitle: payload.koreanTitle } : {}),
        ...(payload.koreanContent ? { koreanContent: payload.koreanContent } : {}),
      })
    },
    onSuccess: async () => {
      await noticesQuery.refetch()
      setModalState(null)
    },
  })

  const deleteNoticeMutation = useMutation({
    mutationFn: async (noticeId: number) => {
      setDeletingId(noticeId)
      return deleteAdminNotice(token, noticeId)
    },
    onSuccess: async () => {
      await noticesQuery.refetch()
    },
    onSettled: () => {
      setDeletingId(null)
    },
  })

  return (
    <div className="page-stack">
      <header className="page-titlebar">
        <div className="page-header">
          <p className="eyebrow">Notice Management</p>
          <h1>公告管理</h1>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => {
            saveNoticeMutation.reset()
            setModalState({ mode: 'create', notice: null })
          }}
        >
          新建公告
        </button>
      </header>

      <section className="summary-row">
        <div className="summary-card">
          <span>公告总数</span>
          <strong>{totalNotices}</strong>
        </div>
        <div className="summary-card">
          <span>当前页</span>
          <strong>{filters.page}</strong>
        </div>
      </section>

      <NoticeTable
        notices={notices}
        total={totalNotices}
        page={filters.page}
        pageSize={filters.pageSize}
        busy={noticesQuery.isFetching}
        deletingId={deletingId}
        onPageChange={(page) => setFilters((state) => ({ ...state, page }))}
        onEdit={(notice) => {
          saveNoticeMutation.reset()
          setModalState({ mode: 'edit', notice })
        }}
        onDelete={(notice) => {
          if (!window.confirm(`确定删除公告「${notice.title}」吗？`)) return
          deleteNoticeMutation.mutate(notice.id)
        }}
      />

      <NoticeModal
        key={modalState?.mode === 'edit' ? modalState.notice.id : modalState?.mode ?? 'closed'}
        open={Boolean(modalState)}
        notice={modalState?.notice ?? null}
        busy={saveNoticeMutation.isPending}
        error={saveNoticeMutation.error?.message}
        onClose={() => {
          setModalState(null)
          saveNoticeMutation.reset()
        }}
        onSubmit={(payload) => saveNoticeMutation.mutate(payload)}
      />

      {deleteNoticeMutation.error ? <p className="status error">{deleteNoticeMutation.error.message}</p> : null}
    </div>
  )
}
