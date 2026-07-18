import { useEffect, useRef, useState } from 'react'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  content: string
}

const SUGGESTIONS = [
  'What is OCIA and who is it for?',
  'Explain the sacraments of initiation.',
  'What happens at the Rite of Welcome?',
  'How do I prepare for my first confession?',
]

function newId() {
  return Math.random().toString(36).slice(2)
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isSending])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    const userMessage: Message = { id: newId(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    const assistantId = newId()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!res.ok) {
        throw new Error(`Chat request failed (${res.status})`)
      }

      const data = (await res.json()) as { answer?: string }
      const answer =
        data.answer ??
        'No answer was returned from the server.'

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: answer } : m,
        ),
      )
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : 'Something went wrong.'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `I wasn't able to reach the chat service. (${reason})`,
              }
            : m,
        ),
      )
    } finally {
      setIsSending(false)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    void send(input)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <ChiRho className="mb-6 h-16 w-16 text-cardinal-600" />
            <h2 className="font-serif text-4xl text-cardinal-700">
              Pax Christi
            </h2>
            <p className="mt-3 max-w-md text-base text-stone-600">
              A companion for your journey through the Order of Christian
              Initiation of Adults. Ask anything about the faith, the
              sacraments, or the path ahead.
            </p>
            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-xl border border-gold-400/40 bg-parchment-100/70 px-4 py-3 text-left text-sm text-stone-700 transition hover:border-gold-400 hover:bg-parchment-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isSending && (
              <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
                <span>The companion is reflecting…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gold-400/30 bg-parchment-50/80 backdrop-blur">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-4"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about the faith, the sacraments, or your OCIA journey…"
            className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-gold-400/40 bg-white px-4 py-3 text-base text-stone-800 shadow-sm outline-none transition focus:border-cardinal-500 focus:ring-2 focus:ring-cardinal-500/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cardinal-600 text-parchment-50 shadow-sm transition hover:bg-cardinal-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="mb-6 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-cardinal-600 px-4 py-3 text-parchment-50 shadow-sm">
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex justify-start">
      <div className="flex max-w-[85%] gap-3">
        <ChiRho className="mt-1 h-7 w-7 shrink-0 text-gold-500" />
        <div className="rounded-2xl rounded-bl-sm border border-gold-400/30 bg-white px-4 py-3 shadow-sm">
          {message.content ? (
            <p className="whitespace-pre-wrap leading-relaxed text-stone-800">
              {message.content}
            </p>
          ) : (
            <p className="italic text-stone-400">…</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ChiRho({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* P (rho stem + loop) */}
      <path d="M32 58 V 28" />
      <path d="M32 28 H 40 a 8 8 0 0 0 0 -16 H 32" />
      {/* X overlay (chi) */}
      <path d="M20 12 L 44 52" />
    </svg>
  )
}

function SendIcon({ className = '' }: { className?: string }) {
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
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  )
}

export default Chat
