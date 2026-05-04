import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true
})

const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form'])

const cleanNode = (node: Element) => {
  Array.from(node.children).forEach(child => {
    const tagName = child.tagName.toLowerCase()
    if (BLOCKED_TAGS.has(tagName)) {
      child.remove()
      return
    }

    Array.from(child.attributes).forEach(attr => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on')) {
        child.removeAttribute(attr.name)
        return
      }
      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
        child.removeAttribute(attr.name)
      }
    })

    cleanNode(child)
  })
}

const sanitizeHtml = (html: string) => {
  if (typeof window === 'undefined') return html
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  cleanNode(doc.body)
  return doc.body.innerHTML
}

export const renderMarkdown = (source?: string | null) => {
  const raw = (source || '').trim()
  if (!raw) return '<p>暂无正文内容</p>'
  return sanitizeHtml(marked.parse(raw) as string)
}
