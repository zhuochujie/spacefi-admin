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
  const [thaiTitle, setThaiTitle] = useState(notice?.thaiTitle ?? '')
  const [thaiContent, setThaiContent] = useState(notice?.thaiContent ?? '')
  const [koreanTitle, setKoreanTitle] = useState(notice?.koreanTitle ?? '')
  const [koreanContent, setKoreanContent] = useState(notice?.koreanContent ?? '')
  const [localError, setLocalError] = useState('')

  if (!open) return null

  const editing = Boolean(notice)
  const normalizedValues = {
    title: title.trim(),
    content: content.trim(),
    englishTitle: englishTitle.trim(),
    englishContent: englishContent.trim(),
    thaiTitle: thaiTitle.trim(),
    thaiContent: thaiContent.trim(),
    koreanTitle: koreanTitle.trim(),
    koreanContent: koreanContent.trim(),
  }
  const titlesAreValid =
    normalizedValues.title.length <= 200 &&
    normalizedValues.englishTitle.length <= 200 &&
    normalizedValues.thaiTitle.length <= 200 &&
    normalizedValues.koreanTitle.length <= 200
  const isValid = Boolean(normalizedValues.title && normalizedValues.content) && titlesAreValid
  const hasChanges = !editing || Object.entries(normalizedValues).some(
    ([key, value]) => value !== String(notice?.[key as keyof NoticeItem] ?? '').trim(),
  )
  const canSubmit = isValid && hasChanges && !busy

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const nextTitle = title.trim()
    const nextContent = content.trim()
    const nextEnglishTitle = englishTitle.trim()
    const nextEnglishContent = englishContent.trim()
    const nextThaiTitle = thaiTitle.trim()
    const nextThaiContent = thaiContent.trim()
    const nextKoreanTitle = koreanTitle.trim()
    const nextKoreanContent = koreanContent.trim()

    if (!nextTitle || !nextContent) {
      setLocalError('中文标题和中文内容必填。')
      return
    }

    if (
      nextTitle.length > 200 ||
      nextEnglishTitle.length > 200 ||
      nextThaiTitle.length > 200 ||
      nextKoreanTitle.length > 200
    ) {
      setLocalError('标题不能超过 200 字符。')
      return
    }

    if (!hasChanges) return

    const payload: NoticePayload = editing
      ? {
          title: nextTitle,
          content: nextContent,
          englishTitle: nextEnglishTitle,
          englishContent: nextEnglishContent,
          thaiTitle: nextThaiTitle,
          thaiContent: nextThaiContent,
          koreanTitle: nextKoreanTitle,
          koreanContent: nextKoreanContent,
        }
      : {
          title: nextTitle,
          content: nextContent,
          ...(nextEnglishTitle ? { englishTitle: nextEnglishTitle } : {}),
          ...(nextEnglishContent ? { englishContent: nextEnglishContent } : {}),
          ...(nextThaiTitle ? { thaiTitle: nextThaiTitle } : {}),
          ...(nextThaiContent ? { thaiContent: nextThaiContent } : {}),
          ...(nextKoreanTitle ? { koreanTitle: nextKoreanTitle } : {}),
          ...(nextKoreanContent ? { koreanContent: nextKoreanContent } : {}),
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
            <div className="field compact field-editable">
              <label htmlFor="notice-thai-title">泰文标题</label>
              <input
                id="notice-thai-title"
                value={thaiTitle}
                onChange={(event) => setThaiTitle(event.target.value)}
                placeholder="请输入泰文标题"
                maxLength={200}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-korean-title">韩文标题</label>
              <input
                id="notice-korean-title"
                value={koreanTitle}
                onChange={(event) => setKoreanTitle(event.target.value)}
                placeholder="请输入韩文标题"
                maxLength={200}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-thai-content">泰文内容</label>
              <textarea
                id="notice-thai-content"
                value={thaiContent}
                onChange={(event) => setThaiContent(event.target.value)}
                placeholder="请输入泰文内容"
                rows={8}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="notice-korean-content">韩文内容</label>
              <textarea
                id="notice-korean-content"
                value={koreanContent}
                onChange={(event) => setKoreanContent(event.target.value)}
                placeholder="请输入韩文内容"
                rows={8}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={!canSubmit}>
              {busy ? '保存中...' : '保存'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
