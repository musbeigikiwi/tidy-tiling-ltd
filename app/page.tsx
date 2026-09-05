'use client'

import { FormEvent, useEffect, useState } from 'react'

const services = [
  ['Bathroom Tiling', 'Clean, precise bathroom tiling with careful waterproofing and premium finishing.'],
  ['Shower Tiling', 'Wall and floor tiling designed for wet areas, drainage and long-term durability.'],
  ['Kitchen Splashbacks', 'Modern splashbacks that bring colour, texture and easy cleaning to your kitchen.'],
  ['Floor Tiling', 'Accurate layouts for homes, entries, laundries and high-traffic spaces.'],
  ['Tile Repairs', 'Cracked tile replacement, re-grouting and tidy repair work.'],
  ['Renovation Tiling', 'Complete tiling support for bathroom and home renovation projects.'],
]

const reviews = [
  { name: 'Sarah M.', text: 'Excellent workmanship. The bathroom finish was clean, straight and exactly what we wanted.' },
  { name: 'James R.', text: 'Very tidy work, reliable communication and a great result on our kitchen splashback.' },
  { name: 'Aroha T.', text: 'Professional from quote to completion. We are very happy with the floor tiling.' },
]

export default function Home() {
  const [review, setReview] = useState(0)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = setInterval(() => setReview((r) => (r + 1) % reviews.length), 4500)
    return () => clearInterval(id)
  }, [])

  async function submitQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setSent(false)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = Object.fromEntries(data.entries())

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send quote request.')
      setSent(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send quote request.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top"><span>TIDY</span> TILING <small>LTD</small></a>
        <nav>
          <a href="#services">Services</a><a href="#work">Our Work</a><a href="#reviews">Reviews</a><a href="#about">About</a>
        </nav>
        <a className="navCta" href="#quote">Get a Free Quote</a>
      </header>

      <section id="top" className="hero">
        <div className="heroImage" />
        <div className="overlay" />
        <div className="heroContent">
          <p className="eyebrow">PRECISION • QUALITY • CLEAN FINISH</p>
          <h1>Beautiful tiling.<br/><em>Built to last.</em></h1>
          <p className="heroText">Professional bathroom, kitchen, shower, wall and floor tiling with a sharp eye for detail and a tidy finish.</p>
          <div className="heroButtons"><a className="primary" href="#quote">Get a Free Quote</a><a className="ghost" href="#work">View Our Work</a></div>
          <div className="trust"><span>★★★★★</span><b>Quality workmanship</b><i>Residential & renovation tiling</i></div>
        </div>
        <div className="scrollHint">SCROLL ↓</div>
      </section>

      <section className="stats">
        <div><b>Detail First</b><span>Precise layouts & clean lines</span></div>
        <div><b>Reliable</b><span>Clear communication</span></div>
        <div><b>Professional</b><span>Tidy site & finish</span></div>
        <div><b>NZ Based</b><span>Local tiling service</span></div>
      </section>

      <section id="services" className="section services">
        <div className="sectionHead"><div><p className="eyebrow dark">WHAT WE DO</p><h2>Tiling services for spaces that matter.</h2></div><p>From a small splashback to a complete bathroom renovation, we focus on strong preparation, accurate installation and a clean final result.</p></div>
        <div className="serviceGrid">
          {services.map(([title, text], i) => <article className="serviceCard" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p><a href="#quote">Request quote →</a></article>)}
        </div>
      </section>

      <section id="work" className="workSection">
        <div className="section sectionHead light"><div><p className="eyebrow">SELECTED WORK</p><h2>Spaces transformed with precision.</h2></div><p>Use this area for real Tidy Tiling project photos. The cards use a slow cinematic zoom to keep the page feeling premium.</p></div>
        <div className="projectRail">
          <article className="project p1"><div><small>BATHROOM</small><h3>Modern stone-look bathroom</h3></div></article>
          <article className="project p2"><div><small>KITCHEN</small><h3>Clean subway splashback</h3></div></article>
          <article className="project p3"><div><small>FLOOR</small><h3>Large-format floor tiles</h3></div></article>
          <article className="project p4"><div><small>SHOWER</small><h3>Walk-in shower finish</h3></div></article>
        </div>
      </section>

      <section className="section beforeAfter">
        <div className="beforeCopy"><p className="eyebrow dark">BEFORE & AFTER</p><h2>See the difference quality tiling makes.</h2><p>A dedicated before-and-after gallery can later be connected to the admin dashboard so new projects can be uploaded without editing code.</p><a className="primary darkBtn" href="#quote">Start Your Project</a></div>
        <div className="compare"><div className="before"><span>BEFORE</span></div><div className="after"><span>AFTER</span></div><i /></div>
      </section>

      <section id="reviews" className="reviews">
        <p className="eyebrow">CLIENT FEEDBACK</p><h2>Good work is remembered.</h2>
        <div className="reviewCard" key={review}><div className="stars">★★★★★</div><blockquote>“{reviews[review].text}”</blockquote><b>{reviews[review].name}</b><span>Verified client review</span></div>
        <div className="dots">{reviews.map((_,i)=><button aria-label={`Review ${i+1}`} className={i===review?'active':''} onClick={()=>setReview(i)} key={i}/>)}</div>
      </section>

      <section id="about" className="section about">
        <div className="aboutImage"><div className="badge"><b>TIDY</b><span>by name.<br/>Tidy by nature.</span></div></div>
        <div className="aboutCopy"><p className="eyebrow dark">ABOUT TIDY TILING LTD</p><h2>Craftsmanship you can see in every line.</h2><p>We believe professional tiling is about more than placing tiles. It is about preparation, alignment, waterproofing, detail and leaving the space clean at the end of the job.</p><ul><li>Careful surface preparation</li><li>Clean grout lines and precise cuts</li><li>Clear communication from quote to completion</li><li>Respect for your home and project</li></ul><a href="#quote">Talk about your project →</a></div>
      </section>

      <section id="quote" className="quoteSection">
        <div className="quoteCopy"><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need tiled.</h2><p>Send a few project details and we can review the job and arrange the next step.</p><div className="contactMini"><b>Tidy Tiling Ltd</b><span>Bathroom • Kitchen • Floor • Wall • Renovation</span><span>New Zealand</span></div></div>
        <form className="quoteForm" onSubmit={submitQuote}>
          <div className="two"><label>Your name<input required name="name" placeholder="Full name" /></label><label>Phone<input required name="phone" placeholder="021 ..." /></label></div>
          <div className="two"><label>Email<input required type="email" name="email" placeholder="you@email.com" /></label><label>Project type<select name="type" required defaultValue=""><option value="" disabled>Select service</option><option>Bathroom Tiling</option><option>Shower Tiling</option><option>Kitchen Splashback</option><option>Floor Tiling</option><option>Tile Repair</option><option>Renovation Tiling</option></select></label></div>
          <label>Project location<input name="location" placeholder="Suburb / city" /></label>
          <label>Tell us about the job<textarea required name="message" rows={5} placeholder="Approximate size, tile type, renovation details, preferred timing..." /></label>
          <button className="primary submit" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send Quote Request →'}</button>
          {sent && <p className="success">Thanks — your quote request has been received.</p>}
          {error && <p className="success" style={{color:'#ffb4b4'}}>{error}</p>}
        </form>
      </section>

      <footer><div className="brand footerBrand"><span>TIDY</span> TILING <small>LTD</small></div><p>Professional tiling with a clean finish.</p><div><a href="#services">Services</a><a href="#work">Our Work</a><a href="#reviews">Reviews</a><a href="#quote">Quote</a></div><small>© 2026 Tidy Tiling Ltd. All rights reserved.</small></footer>
    </main>
  )
}
