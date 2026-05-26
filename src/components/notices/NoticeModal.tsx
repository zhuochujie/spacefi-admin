import { useState, type FormEvent } from 'react'
import type { NoticeItem, NoticePayload } from '../../api'

type NoticeModalProps = {
  open: boolean
  notice: NoticeItem | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: NoticePayload) => void
}

export function NoticeModal({
  open,
  notice,
  busy,
  error,
  onClose,
  onSubmit,
}: NoticeModalProps) {
  const [title, setTitle] = useState(notice?.title ?? '')
  const [content, setContent] = useState(notice?.content ?? '')
  const [englishTitle, setEnglishTitle] = useState(notice?.englishTitle ?? '')
  const [englishContent, setEnglishContent] = useState(notice?.englishContent ?? '')
  const [localError, setLocalError] = useState('')

  if (!open) return null

  const editing = Boolean(notice)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const nextTitle = title.trim()
    const nextContent = content.trim()
    const nextEnglishTitle = englishTitle.trim()
    const nextEnglishContent = englishContent.trim()

    if (!nextTitle || !nextContent) {
      setLocalError('中文标题和中文内容必填。')
      return
    }

    if (nextTitle.length > 200 || nextEnglishTitle.length > 200) {
      setLocalError('标题不能超过 200 字符。')
      return
    }

    const payload: NoticePayload = editing
      ? {
          title: nextTitle,
          content: nextContent,
          englishTitle: nextEnglishTitle,
          englishContent: nextEnglishContent,
        }
      : {
          title: nextTitle,
          content: nextContent,
          ...(nextEnglishTitle ? { englishTitle: nextEnglishTitle } : {}),
          ...(nextEnglishContent ? { englishContent: nextEnglishContent } : {}),
        }

    onSubmit(payload)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Notice</p>
            <h2 id="notice-modal-title">{editing ? '编辑公告' : '新建公告'}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="notice-form-grid">
            <div className="field compact field-editable">
              <label htmlFor="notice-title">中文标题</label>
              <input
                id="notice-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="请输入中文标题"
                maxLength={200}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-english-title">英文标题</label>
              <input
                id="notice-english-title"
                value={englishTitle}
                onChange={(event) => setEnglishTitle(event.target.value)}
                placeholder="请输入英文标题"
                maxLength={200}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-content">中文内容</label>
              <textarea
                id="notice-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="请输入中文内容"
                rows={8}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-english-content">英文内容</label>
              <textarea
                id="notice-english-content"
                value={englishContent}
                onChange={(event) => setEnglishContent(event.target.value)}
                placeholder="请输入英文内容"
                rows={8}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={busy}>
              {busy ? '保存中...' : '保存'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
