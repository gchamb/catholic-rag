import { useRef, useState } from 'react'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB, matches server constraint

type Status = 'idle' | 'uploading' | 'success' | 'error'

function Upload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string>('')

  function validateAndSetFile(selected: File | null) {
    setMessage('')
    setStatus('idle')

    if (!selected) {
      setFile(null)
      return
    }

    if (selected.type !== 'application/pdf') {
      setFile(null)
      setStatus('error')
      setMessage('Only PDF files are allowed.')
      return
    }

    if (selected.size > MAX_SIZE) {
      setFile(null)
      setStatus('error')
      setMessage('File exceeds the 5MB limit.')
      return
    }

    setFile(selected)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const dropped = event.dataTransfer.files[0] ?? null
    validateAndSetFile(dropped)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file) return

    setStatus('uploading')
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/document', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Upload failed (${res.status})`)
      }

      setStatus('success')
      setMessage('Document uploaded successfully.')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Upload failed.')
    }
  }

  const isUploading = status === 'uploading'

  return (
    <div className="mx-auto h-full w-full max-w-2xl overflow-y-auto px-6 py-10">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cardinal-600/10 text-cardinal-600">
          <ScrollIcon className="h-7 w-7" />
        </div>
        <h2 className="font-serif text-3xl text-cardinal-700">
          Offer a document
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Upload Catholic texts, OCIA materials, or writings to enrich the
          companion. PDF only, up to 5MB.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div
          className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            file
              ? 'border-cardinal-500 bg-cardinal-50/40'
              : 'border-gold-400/50 bg-parchment-100/40 hover:border-gold-400 hover:bg-parchment-100'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
            hidden
          />
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <FileIcon className="mb-2 h-8 w-8 text-cardinal-600" />
              <span className="font-medium text-stone-800">{file.name}</span>
              <span className="text-sm text-stone-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-stone-500">
              <UploadIcon className="h-8 w-8" />
              <span className="text-sm">
                Drag &amp; drop a PDF here, or click to browse
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || isUploading}
          className="mt-6 w-full rounded-xl bg-cardinal-600 px-4 py-3 font-medium text-parchment-50 shadow-sm transition hover:bg-cardinal-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {isUploading ? 'Offering…' : 'Upload document'}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              status === 'success'
                ? 'text-emerald-700'
                : status === 'error'
                  ? 'text-cardinal-700'
                  : 'text-stone-600'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
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

function FileIcon({ className = '' }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

function ScrollIcon({ className = '' }: { className?: string }) {
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
      <path d="M8 3h11a1 1 0 0 1 1 1v14a3 3 0 0 1-3 3H6" />
      <path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2z" />
      <path d="M9 8h7" />
      <path d="M9 12h7" />
    </svg>
  )
}

export default Upload
