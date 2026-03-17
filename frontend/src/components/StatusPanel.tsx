type Props = {
  authenticated: boolean
  userLabel?: string
  loading: boolean
  error?: string | null
}

export default function StatusPanel({ authenticated, userLabel, loading, error }: Props) {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-medium">Status</h2>
      <div className="space-y-2 text-sm">
        <p>Auth: <span className={authenticated ? 'text-emerald-400' : 'text-amber-400'}>{authenticated ? `Signed in as ${userLabel}` : 'Not signed in'}</span></p>
        <p>Request state: <span className={loading ? 'text-amber-400' : 'text-emerald-400'}>{loading ? 'Loading...' : 'Idle'}</span></p>
        {error ? <p className="rounded bg-rose-900/40 p-2 text-rose-300">Error: {error}</p> : <p className="text-slate-300">No recent errors</p>}
      </div>
    </section>
  )
}
