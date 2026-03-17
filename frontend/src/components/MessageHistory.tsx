import { formatDate } from '../utils/format'
import type { Block, Comment } from '../services/api'

type LogItem = {
  id: string
  type: 'info' | 'success' | 'error'
  message: string
  createdAt: string
}

type Props = {
  blocks: Block[]
  comments: Comment[]
  logs: LogItem[]
}

export default function MessageHistory({ blocks, comments, logs }: Props) {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-medium">Message history & logs</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Blocks</h3>
          <ul className="space-y-2 text-sm">
            {blocks.map((block) => <li key={block.id} className="rounded bg-slate-800 p-2"><p className="font-medium">{block.title}</p><p className="line-clamp-2 text-slate-300">{block.text}</p></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Comments</h3>
          <ul className="space-y-2 text-sm">
            {comments.map((c) => <li key={c.id} className="rounded bg-slate-800 p-2"><p>{c.comment}</p><p className="text-xs text-slate-400">{c.username}</p></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Request logs</h3>
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="rounded bg-slate-800 p-2">
                <p className={log.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}>{log.message}</p>
                <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
