'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

type ChatMessage = { role: 'assistant' | 'user'; text: string }

const starters = ['Bathroom tiling', 'Get a free quote', 'Do you service Hamilton?', 'How long does tiling take?']

export default function TidyChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hi 👋 I’m Tidy Assistant. I can help with tiling services, project timing, preparation, service areas and free quote requests. What are you planning?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quoteMode, setQuoteMode] = useState(false)
  const [quoteStatus, setQuoteStatus] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, quoteMode, quoteStatus])

  async function sendMessage(text?: string) {
    const value = (text ?? input).trim()
    if (!value || loading) return

    setInput('')
    const next = [...messages, { role: 'user' as const, text: value }]
    setMessages(next)
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-10) }),
      })
      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'I can help you request a quote.' }])
      if (data.suggestQuote) setQuoteMode(true)
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'I can still help you send a free quote request. Tap “Start quote” below.' }])
    } finally {
      setLoading(false)
    }
  }

  async function submitQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setQuoteStatus('Sending…')
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to send quote.')
      setQuoteStatus('Done! Your request has been sent to Tidy Tiling Ltd.')
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Perfect — your quote request is in. The team can now review your project details and contact you.' }])
      form.reset()
    } catch (err) {
      setQuoteStatus(err instanceof Error ? err.message : 'Unable to send quote.')
    }
  }

  return (
    <>
      <button className="chatLauncher" onClick={() => setOpen((v) => !v)} aria-label="Open Tidy Assistant">
        <span className="chatPulse" />
        {open ? '×' : '✦'}
      </button>

      {open && (
        <aside className="chatPanel" aria-label="Tidy Tiling chat assistant">
          <div className="chatHeader">
            <div className="chatAvatar">TT</div>
            <div><strong>Tidy Assistant</strong><span><i /> Online • instant help</span></div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="chatBody">
            <div className="chatIntro"><b>Smart project help</b><span>Ask about bathrooms, floors, splashbacks, repairs, timing or quotes.</span></div>
            {messages.map((m, i) => <div key={i} className={`chatBubble ${m.role}`}>{m.text}</div>)}
            {loading && <div className="chatBubble assistant typing"><span/><span/><span/></div>}

            {!quoteMode && messages.length < 4 && (
              <div className="chatStarters">
                {starters.map((s) => <button key={s} onClick={() => s === 'Get a free quote' ? setQuoteMode(true) : sendMessage(s)}>{s}</button>)}
              </div>
            )}

            {quoteMode && (
              <form className="chatQuote" onSubmit={submitQuote}>
                <div className="chatQuoteTop"><b>Free quote request</b><button type="button" onClick={() => setQuoteMode(false)}>Hide</button></div>
                <input name="name" required placeholder="Your name" />
                <input name="phone" required placeholder="Phone" />
                <input name="email" required type="email" placeholder="Email" />
                <select name="type" required defaultValue=""><option value="" disabled>Project type</option><option>Bathroom Tiling</option><option>Shower Tiling</option><option>Kitchen Splashback</option><option>Floor Tiling</option><option>Tile Repair</option><option>Renovation Tiling</option></select>
                <input name="location" placeholder="Suburb / city" />
                <textarea name="message" required rows={3} placeholder="Tell us briefly about the project" />
                <button className="chatQuoteSend" type="submit">Send to Tidy Tiling →</button>
                {quoteStatus && <p>{quoteStatus}</p>}
              </form>
            )}
            <div ref={endRef} />
          </div>

          <form className="chatInput" onSubmit={(e) => { e.preventDefault(); sendMessage() }}>
            <button type="button" className="chatPlus" onClick={() => setQuoteMode(true)} title="Start quote">＋</button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Tidy Assistant…" />
            <button type="submit" disabled={loading}>➤</button>
          </form>
          <div className="chatFooter">Tidy Tiling Ltd • Smart assistant</div>
        </aside>
      )}
    </>
  )
}
