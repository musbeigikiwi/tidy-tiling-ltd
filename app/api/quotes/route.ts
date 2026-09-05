import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Backend is not configured yet.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, phone, email, type, location, message } = body

    if (!name || !phone || !email || !type || !message) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/quotes`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        customer_name: name,
        phone,
        email,
        project_type: type,
        location: location || null,
        message,
        status: 'new',
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('Supabase quote insert failed:', details)
      return NextResponse.json({ error: 'Unable to save quote request.' }, { status: 500 })
    }

    const created = await response.json()
    return NextResponse.json({ ok: true, quote: created?.[0] ?? null }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
