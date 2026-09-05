import { NextResponse } from 'next/server'

type Message = { role: 'assistant' | 'user'; text: string }

const SYSTEM_PROMPT = `You are Tidy Assistant for Tidy Tiling Ltd, a professional New Zealand tiling business. Be concise, warm and practical. Help customers with bathroom tiling, shower tiling, kitchen splashbacks, floor tiling, tile repairs, renovation tiling, waterproofing questions, preparation, timelines and quote requests. Never invent fixed prices, guarantees, certifications, availability or service areas. If price is asked, explain that pricing depends on area, tile type, substrate/preparation, demolition, waterproofing and complexity, then offer a free quote. If the user is clearly planning a project, ask for location, project type, approximate size, timing and whether existing tiles need removal. Encourage a quote request when appropriate. Do not give unsafe DIY advice for waterproofing or structural work. Keep replies under 120 words.`

function localReply(text: string) {
  const q = text.toLowerCase()

  if (q.includes('hamilton') || q.includes('where') || q.includes('area') || q.includes('location')) {
    return { reply: 'We can review your location as part of the quote request. Send your suburb or city and the project type, and the team can confirm whether the job is within the current service area.', suggestQuote: true }
  }
  if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('$')) {
    return { reply: 'Tiling price depends on the area, tile size/type, surface preparation, removal of old tiles, waterproofing and layout complexity. The best next step is a free quote so the team can price the actual job rather than guess.', suggestQuote: true }
  }
  if (q.includes('bathroom') || q.includes('shower')) {
    return { reply: 'For bathroom or shower tiling, the important details are the approximate size, whether old tiles need removal, the condition of the substrate, tile type and whether waterproofing is part of the scope. I can help you send those details for a free quote.', suggestQuote: true }
  }
  if (q.includes('kitchen') || q.includes('splashback')) {
    return { reply: 'Yes — kitchen splashbacks are one of the core services. Helpful quote details are the wall dimensions, tile style/size, whether the old splashback needs removal, and your location.', suggestQuote: true }
  }
  if (q.includes('floor')) {
    return { reply: 'Floor tiling can be quoted once we know the approximate square metres, tile size, room type, surface condition and whether existing flooring needs removal. Larger tiles and uneven floors can need extra preparation.', suggestQuote: true }
  }
  if (q.includes('repair') || q.includes('grout') || q.includes('crack')) {
    return { reply: 'For repairs, it helps to know whether the issue is a cracked tile, loose tile, damaged grout or a wider moisture/movement problem. Photos and the location of the damage make assessment much easier.', suggestQuote: true }
  }
  if (q.includes('how long') || q.includes('time') || q.includes('days')) {
    return { reply: 'Timing depends on project size and preparation. A small splashback may be much quicker than a full bathroom, which can involve removal, substrate work, waterproofing, curing and tiling. Share the project type and approximate size and I can guide you on what affects the timeline.', suggestQuote: false }
  }
  if (q.includes('waterproof')) {
    return { reply: 'Waterproofing is an important part of wet-area work and should be assessed as part of the full bathroom or shower scope. The exact requirements depend on the existing substrate and project details, so it is best confirmed during quoting/site assessment.', suggestQuote: true }
  }
  if (q.includes('quote') || q.includes('book') || q.includes('visit') || q.includes('start')) {
    return { reply: 'Absolutely. I can collect the project details now. Please include your name, phone, email, location, project type and a short description of the work.', suggestQuote: true }
  }

  return { reply: 'I can help with bathroom, shower, kitchen splashback, floor, repair and renovation tiling. Tell me what space you are working on, your location and roughly how big the job is, and I’ll guide you to the right next step.', suggestQuote: false }
}

function extractResponseText(data: any): string | null {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim()
  const output = Array.isArray(data?.output) ? data.output : []
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []
    for (const part of content) {
      if (typeof part?.text === 'string' && part.text.trim()) return part.text.trim()
    }
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = (Array.isArray(body?.messages) ? body.messages : []) as Message[]
    const latest = [...messages].reverse().find((m) => m.role === 'user')?.text?.trim() || ''

    if (!latest) return NextResponse.json({ reply: 'Tell me a little about your tiling project and I’ll help.' })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json(localReply(latest))

    const conversation = messages.slice(-10).map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.text}`).join('\n')
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-5.6-luna',
        instructions: SYSTEM_PROMPT,
        input: conversation,
        max_output_tokens: 220,
      }),
    })

    if (!response.ok) {
      console.error('AI chat request failed:', await response.text())
      return NextResponse.json(localReply(latest))
    }

    const data = await response.json()
    const reply = extractResponseText(data) || localReply(latest).reply
    const suggestQuote = /(quote|price|cost|bathroom|shower|kitchen|floor|repair|renovation|project|book|visit)/i.test(latest)
    return NextResponse.json({ reply, suggestQuote })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ reply: 'I can help you with a free quote request. Tell me what you need tiled and your location.', suggestQuote: true })
  }
}
