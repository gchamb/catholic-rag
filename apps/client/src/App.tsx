import { useState } from 'react'
import Chat from './components/Chat'
import Upload from './components/Upload'

type View = 'chat' | 'upload'

function App() {
  const [view, setView] = useState<View>('chat')

  return (
    <div className="parchment-bg flex h-full min-h-0">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gold-400/30 bg-parchment-100/60 md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <CrossEmblem className="h-9 w-9 text-cardinal-600" />
          <div className="leading-tight">
            <p className="font-serif text-lg text-cardinal-700">Catholic RAG</p>
            <p className="text-xs text-stone-500">OCIA Companion</p>
          </div>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          <NavButton
            active={view === 'chat'}
            onClick={() => setView('chat')}
            icon={<ChatIcon className="h-5 w-5" />}
            label="Chat"
          />
          <NavButton
            active={view === 'upload'}
            onClick={() => setView('upload')}
            icon={<UploadIcon className="h-5 w-5" />}
            label="Upload"
          />
        </nav>

        <div className="mt-auto px-5 py-5">
          <p className="font-serif text-sm italic text-stone-500">
            "Ask, and it will be given to you; seek, and you will find."
          </p>
          <p className="mt-1 text-xs text-stone-400">— Matthew 7:7</p>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-2 border-b border-gold-400/30 bg-parchment-100/70 px-4 py-3 md:hidden">
          <CrossEmblem className="h-7 w-7 text-cardinal-600" />
          <span className="font-serif text-lg text-cardinal-700">
            Catholic RAG
          </span>
          <div className="ml-auto flex gap-1">
            <MobileTab
              active={view === 'chat'}
              onClick={() => setView('chat')}
              label="Chat"
            />
            <MobileTab
              active={view === 'upload'}
              onClick={() => setView('upload')}
              label="Upload"
            />
          </div>
        </header>

        <div className="min-h-0 flex-1">
          {view === 'chat' ? <Chat /> : <Upload />}
        </div>
      </main>
    </div>
  )
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? 'bg-cardinal-600 text-parchment-50 shadow-sm'
          : 'text-stone-600 hover:bg-parchment-200/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function MobileTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${
        active
          ? 'bg-cardinal-600 text-parchment-50'
          : 'text-stone-600 hover:bg-parchment-200/60'
      }`}
    >
      {label}
    </button>
  )
}

function CrossEmblem({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M24 4 V 44" />
      <path d="M14 16 H 34" />
    </svg>
  )
}

function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function UploadIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  )
}

export default App
