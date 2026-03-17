import { useState } from 'react'

type Props = {
  loading: boolean
  onCreateBlock: (title: string, text: string) => Promise<void>
  onCreateComment: (blockId: string, comment: string) => Promise<void>
  onLoadComments: (blockId: string) => Promise<void>
}

export default function MessageForm({ loading, onCreateBlock, onCreateComment, onLoadComments }: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [blockId, setBlockId] = useState('')
  const [comment, setComment] = useState('')

  return (
    <section className="space-y-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="text-lg font-medium">Send message</h2>
      <div className="grid gap-2">
        <input className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Block title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Message text" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        <button disabled={loading} onClick={() => onCreateBlock(title, text)} className="rounded bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500 disabled:opacity-60">
          {loading ? 'Sending...' : 'Create text block'}
        </button>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <h3 className="mb-2 font-medium">Comments</h3>
        <div className="grid gap-2">
          <input className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Block UUID" value={blockId} onChange={(e) => setBlockId(e.target.value)} />
          <textarea className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="flex gap-2">
            <button disabled={loading} onClick={() => onCreateComment(blockId, comment)} className="rounded bg-emerald-600 px-3 py-2 hover:bg-emerald-500 disabled:opacity-60">Add comment</button>
            <button disabled={loading} onClick={() => onLoadComments(blockId)} className="rounded bg-slate-700 px-3 py-2 hover:bg-slate-600 disabled:opacity-60">Load comments</button>
          </div>
        </div>
      </div>
    </section>
  )
}
