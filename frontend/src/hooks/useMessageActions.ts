import { useState } from 'react'
import { createBlock, createComment, getComments, listBlocks, type Block, type Comment } from '../services/api'

type LogItem = {
  id: string
  type: 'info' | 'success' | 'error'
  message: string
  createdAt: string
}

export function useMessageActions(token: string | null) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogItem[]>([])

  const addLog = (type: LogItem['type'], message: string) => {
    setLogs((prev) => [{ id: crypto.randomUUID(), type, message, createdAt: new Date().toISOString() }, ...prev])
  }

  const run = async <T,>(action: () => Promise<T>, successMessage: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await action()
      addLog('success', successMessage)
      return result
    } catch (e) {
      const message = (e as { message?: string }).message ?? 'Request failed'
      setError(message)
      addLog('error', message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const loadBlocks = async () => {
    if (!token) return
    const data = await run(() => listBlocks(token), 'Blocks loaded')
    setBlocks(data)
  }

  const sendBlockMessage = async (title: string, text: string) => {
    if (!token) throw new Error('Login required')
    const block = await run(() => createBlock(token, title, text), `Block "${title}" created`)
    setBlocks((prev) => [block, ...prev])
  }

  const sendComment = async (blockId: string, comment: string) => {
    if (!token) throw new Error('Login required')
    const created = await run(() => createComment(token, blockId, comment), 'Comment created')
    setComments((prev) => [created, ...prev])
  }

  const loadComments = async (blockId: string) => {
    const list = await run(() => getComments(blockId), 'Comments loaded')
    setComments(list.items)
  }

  return { blocks, comments, loading, error, logs, loadBlocks, sendBlockMessage, sendComment, loadComments }
}
