import type { NoticeItem } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { formatTime } from '../../lib/format'

type NoticeTableProps = {
  notices: NoticeItem[]
  total: number
  page: number
  pageSize: number
  busy: boolean
  deletingId?: number | null
  onPageChange: (page: number) => void
  onEdit: (notice: NoticeItem) => void
  onDelete: (notice: NoticeItem) => void
}

export function NoticeTable({
  notices,
  total,
  page,
  pageSize,
  busy,
  deletingId,
  onPageChange,
  onEdit,
  onDelete,
}: NoticeTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>公告列表</h2>
        <span>{busy ? '刷新中' : `${total} 条`}</span>
      </div>

      {notices.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无公告。</div>
      ) : (
        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>中文标题</th>
                <th>中文内容</th>
                <th>英文标题</th>
                <th>英文内容</th>
                <th>泰文标题</th>
                <th>泰文内容</th>
                <th>韩文标题</th>
                <th>韩文内容</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td>{notice.id}</td>
                  <td>{notice.title}</td>
                  <td className="cell-clip">{notice.content}</td>
                  <td>{notice.englishTitle || '-'}</td>
                  <td className="cell-clip">{notice.englishContent || '-'}</td>
                  <td>{notice.thaiTitle || '-'}</td>
                  <td className="cell-clip">{notice.thaiContent || '-'}</td>
                  <td>{notice.koreanTitle || '-'}</td>
                  <td className="cell-clip">{notice.koreanContent || '-'}</td>
                  <td>{formatTime(notice.createTime)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(notice)}>
                        编辑
                      </button>
                      <button
                        type="button"
                        className="secondary small danger"
                        onClick={() => onDelete(notice)}
                        disabled={deletingId === notice.id}
                      >
                        {deletingId === notice.id ? '删除中' : '删除'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pager pager-split">
        <div className="pager-left">
          <button type="button" className="secondary" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={busy || page <= 1}>
            上一页
          </button>
        </div>
        <div className="pager-center">
          <span>
            {page} / {totalPages}
          </span>
        </div>
        <div className="pager-right">
          <button
            type="button"
            className="secondary"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={busy || page >= totalPages}
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  )
}
