import { useState } from 'react'
import MessageForm from '../components/MessageForm'
import MessageHistory from '../components/MessageHistory'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../hooks/useAuth'
import { useMessageActions } from '../hooks/useMessageActions'

export default function Home() {
  const auth = useAuth()
  const actions = useMessageActions(auth.token)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-4">
        <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-medium">Authentication</h2>
          {!auth.token ? (
            <AuthForms onLogin={auth.login} onRegister={auth.register} loading={auth.loading} />
          ) : (
            <button className="rounded bg-rose-600 px-3 py-2 hover:bg-rose-500" onClick={auth.logout}>Logout</button>
          )}
        </section>
        <StatusPanel
          authenticated={Boolean(auth.token)}
          userLabel={auth.user?.username ?? auth.user?.email}
          loading={auth.loading || actions.loading}
          error={auth.error ?? actions.error}
        />
      </div>

      <div className="space-y-4">
        <MessageForm
          loading={actions.loading}
          onCreateBlock={actions.sendBlockMessage}
          onCreateComment={actions.sendComment}
          onLoadComments={actions.loadComments}
        />
        <button className="rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600" onClick={actions.loadBlocks}>Refresh blocks</button>
        <MessageHistory blocks={actions.blocks} comments={actions.comments} logs={actions.logs} />
      </div>
    </div>
  )
}

type AuthProps = {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, username: string) => Promise<void>
  loading: boolean
}

function AuthForms({ onLogin, onRegister, loading }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  return (
    <div className="grid gap-2">
      <input className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <input className="rounded border border-slate-700 bg-slate-800 p-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={loading} className="rounded bg-indigo-600 px-3 py-2 hover:bg-indigo-500 disabled:opacity-60" onClick={() => onLogin(email, password)}>Login</button>
        <button disabled={loading} className="rounded bg-emerald-600 px-3 py-2 hover:bg-emerald-500 disabled:opacity-60" onClick={() => onRegister(email, password, username)}>Register</button>
      </div>
    </div>
  )
}
