import { useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [dark, setDark] = useState(true)

  return (
    <div className={dark ? 'dark min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-slate-100 text-slate-900'}>
      <header className="border-b border-slate-700 bg-slate-900/80 px-6 py-4 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold">Text Sender Developer Dashboard</h1>
          <button
            className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
            onClick={() => setDark((v) => !v)}
          >
            {dark ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  )
}
