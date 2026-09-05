type Quote = {
  id: string
  customer_name: string
  phone: string
  email: string
  project_type: string
  location: string | null
  status: string
  created_at: string
  estimated_value: number | null
}

async function getQuotes(): Promise<Quote[]> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  try {
    const response = await fetch(
      `${url}/rest/v1/quotes?select=id,customer_name,phone,email,project_type,location,status,created_at,estimated_value&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'no-store',
      }
    )
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

const statusLabel: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  site_visit: 'Site Visit',
  quote_sent: 'Quote Sent',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

export default async function AdminPage() {
  const quotes = await getQuotes()
  const newCount = quotes.filter((q) => q.status === 'new').length
  const activeCount = quotes.filter((q) => ['accepted', 'in_progress'].includes(q.status)).length
  const completedCount = quotes.filter((q) => q.status === 'completed').length
  const pipeline = quotes.reduce((sum, q) => sum + Number(q.estimated_value || 0), 0)

  return (
    <main style={{minHeight:'100vh',background:'#0d0e10',color:'#f4f0e8',fontFamily:'Arial, sans-serif',padding:'32px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,marginBottom:32,flexWrap:'wrap'}}>
          <div>
            <p style={{letterSpacing:3,fontSize:12,color:'#c6a766',margin:0}}>TIDY TILING LTD</p>
            <h1 style={{fontSize:40,margin:'8px 0 4px'}}>Admin Dashboard</h1>
            <p style={{color:'#9e9e9e',margin:0}}>Leads, quotes and active jobs in one place.</p>
          </div>
          <a href="/" style={{color:'#111',background:'#d8b66c',padding:'12px 18px',borderRadius:10,textDecoration:'none',fontWeight:700}}>View Website</a>
        </div>

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16,marginBottom:28}}>
          {[
            ['New Leads', newCount],
            ['Active Jobs', activeCount],
            ['Completed', completedCount],
            ['Pipeline Value', `$${pipeline.toLocaleString('en-NZ')}`],
          ].map(([label,value]) => (
            <article key={label} style={{background:'#17191d',border:'1px solid #272a30',borderRadius:16,padding:22}}>
              <span style={{color:'#92959c',fontSize:13}}>{label}</span>
              <strong style={{display:'block',fontSize:32,marginTop:10}}>{value}</strong>
            </article>
          ))}
        </section>

        <section style={{background:'#14161a',border:'1px solid #272a30',borderRadius:18,overflow:'hidden'}}>
          <div style={{padding:'20px 22px',borderBottom:'1px solid #272a30',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{margin:0,fontSize:22}}>Recent Quote Requests</h2>
              <p style={{margin:'6px 0 0',color:'#8f9298',fontSize:13}}>Newest customer enquiries from the website.</p>
            </div>
            <span style={{fontSize:12,color:'#c6a766'}}>LIVE DATA WHEN SUPABASE IS CONNECTED</span>
          </div>

          {quotes.length === 0 ? (
            <div style={{padding:40,textAlign:'center',color:'#8f9298'}}>
              <p style={{fontSize:18,color:'#ddd'}}>No quote data yet.</p>
              <p>Once Supabase environment variables are added and the schema is run, website enquiries will appear here automatically.</p>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead>
                  <tr style={{textAlign:'left',color:'#92959c',fontSize:12}}>
                    {['Customer','Project','Location','Status','Contact','Received'].map(h => <th key={h} style={{padding:'14px 18px',borderBottom:'1px solid #272a30'}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} style={{borderBottom:'1px solid #22252a'}}>
                      <td style={{padding:'17px 18px',fontWeight:700}}>{q.customer_name}</td>
                      <td style={{padding:'17px 18px'}}>{q.project_type}</td>
                      <td style={{padding:'17px 18px',color:'#b7b7b7'}}>{q.location || '—'}</td>
                      <td style={{padding:'17px 18px'}}><span style={{background:'#23262b',padding:'7px 10px',borderRadius:999,color:'#d8b66c',fontSize:12}}>{statusLabel[q.status] || q.status}</span></td>
                      <td style={{padding:'17px 18px',color:'#b7b7b7'}}><div>{q.phone}</div><div style={{fontSize:12,marginTop:3}}>{q.email}</div></td>
                      <td style={{padding:'17px 18px',color:'#8f9298'}}>{new Date(q.created_at).toLocaleDateString('en-NZ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p style={{color:'#686b71',fontSize:12,marginTop:18}}>Security note: this dashboard must be protected with admin authentication before production launch.</p>
      </div>
    </main>
  )
}
