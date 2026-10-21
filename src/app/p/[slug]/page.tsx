import { createClient } from '@supabase/supabase-js'

interface CustomLink { label: string; url: string; icon?: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; location: string | null; custom_links: CustomLink[]; is_active: boolean
  views: number; template: string
}

// Sistema de 23 plantillas — token: bg, r1, r2, acc, label?, light?
const T: Record<string, {bg:string;r1:string;r2:string;acc:string;label?:string;light?:boolean}> = {
  // Originales
  oscuro:    {bg:'#0f0f14', r1:'#00d4ff', r2:'#7c3aed', acc:'#00d4ff'},
  fusion:    {bg:'#0c0c12', r1:'#c8a84b', r2:'#7c3aed', acc:'#c8a84b'},
  claro:     {bg:'#f5f0ea', r1:'#c8b89a', r2:'#a08060', acc:'#8a6d4b', light:true},
  // Paletas
  dorado:    {bg:'#0b0a06', r1:'#d4a843', r2:'#b8860b', acc:'#d4a843'},
  esmeralda: {bg:'#070f0a', r1:'#2ecc71', r2:'#1abc9c', acc:'#2ecc71'},
  oceano:    {bg:'#060c14', r1:'#3498db', r2:'#2980b9', acc:'#3498db'},
  rubi:      {bg:'#0f0609', r1:'#e74c3c', r2:'#c0392b', acc:'#e74c3c'},
  plata:     {bg:'#0c0c0e', r1:'#bdc3c7', r2:'#95a5a6', acc:'#bdc3c7'},
  violeta:   {bg:'#0a0714', r1:'#9b59b6', r2:'#8e44ad', acc:'#9b59b6'},
  cobre:     {bg:'#0d0906', r1:'#e67e22', r2:'#d35400', acc:'#e67e22'},
  aurora:    {bg:'#080d12', r1:'#00d4aa', r2:'#7c3aed', acc:'#00d4aa'},
  jade:      {bg:'#06100c', r1:'#1abc9c', r2:'#16a085', acc:'#1abc9c'},
  titanio:   {bg:'#0a0b0d', r1:'#7f8c8d', r2:'#95a5a6', acc:'#7f8c8d'},
  ambar:     {bg:'#0e0b06', r1:'#f39c12', r2:'#e67e22', acc:'#f39c12'},
  zafiro:    {bg:'#060a14', r1:'#2980b9', r2:'#1a5276', acc:'#2980b9'},
  carmesi:   {bg:'#100608', r1:'#c0392b', r2:'#922b21', acc:'#c0392b'},
  neon:      {bg:'#050512', r1:'#ff00ff', r2:'#00ffff', acc:'#ff00ff'},
  cielo:     {bg:'#060c14', r1:'#74b9ff', r2:'#0984e3', acc:'#74b9ff'},
  coral:     {bg:'#110808', r1:'#fd79a8', r2:'#e84393', acc:'#fd79a8'},
  menta:     {bg:'#f8fffc', r1:'#00b894', r2:'#00cec9', acc:'#00b894', light:true},
  indigo:    {bg:'#070514', r1:'#6c5ce7', r2:'#a29bfe', acc:'#6c5ce7'},
  arena:     {bg:'#faf7f0', r1:'#b8860b', r2:'#a0784a', acc:'#8b6914', light:true},
  cromo:     {bg:'#0d0d0d', r1:'#dfe6e9', r2:'#b2bec3', acc:'#dfe6e9'},
  // Fallback para templates antiguos — redirigen a oscuro
  default:   {bg:'#0f0f14', r1:'#00d4ff', r2:'#7c3aed', acc:'#00d4ff'},
}

function IconWhatsApp({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.856L.054 23.25a.75.75 0 0 0 .916.921l5.487-1.455A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.354l-.355-.211-3.684.977.991-3.598-.232-.371A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>)}
function IconInstagram({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none"/></svg>)}
function IconTikTok({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/></svg>)}
function IconLinkedIn({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>)}
function IconFacebook({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>)}
function IconYouTube({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>)}
function IconEmail({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>)}
function IconGlobe({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>)}
function IconLink({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>)}
function IconMapPin({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>)}
function getCustomIcon(url:string):string{
  if(/wa\.me|whatsapp/i.test(url))return'whatsapp'
  if(/instagram/i.test(url))return'instagram'
  if(/tiktok/i.test(url))return'tiktok'
  if(/linkedin/i.test(url))return'linkedin'
  if(/facebook|fb\.com/i.test(url))return'facebook'
  if(/youtube|youtu\.be/i.test(url))return'youtube'
  if(/^mailto/i.test(url))return'email'
  return'link'
}
function BrandIcon({type,color}:{type:string;color:string}){
  if(type==='whatsapp')return<IconWhatsApp color={color}/>
  if(type==='instagram')return<IconInstagram color={color}/>
  if(type==='tiktok')return<IconTikTok color={color}/>
  if(type==='linkedin')return<IconLinkedIn color={color}/>
  if(type==='facebook')return<IconFacebook color={color}/>
  if(type==='youtube')return<IconYouTube color={color}/>
  if(type==='email')return<IconEmail color={color}/>
  if(type==='globe')return<IconGlobe color={color}/>
  if(type==='location')return<IconMapPin color={color}/>
  return<IconLink color={color}/>
}

export default async function ProfilePage({params}:{params:Promise<{slug:string}>}){
  const {slug} = await params
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data:profile} = await supabase.from('nfc_profiles').select('*').eq('slug',slug).eq('is_active',true).single() as {data:NFCProfile|null}
  if(!profile)return(
    <div style={{minHeight:'100vh',background:'#0f0f14',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'sans-serif',flexDirection:'column',gap:'12px'}}>
      <div style={{fontSize:'48px'}}>404</div>
      <div style={{color:'#666'}}>Perfil no encontrado</div>
    </div>
  )
  await supabase.from('nfc_profiles').update({views:(profile.views||0)+1}).eq('id',profile.id)

  // Resolve template — cualquier ID antiguo (ocean, gold, etc.) cae a oscuro
  const theme = T[profile.template] || T.oscuro
  const isLight = !!theme.light
  const textColor = isLight ? '#1a1a1a' : '#f0f0f0'
  const subColor  = isLight ? '#555555' : '#9ca3af'
  const mutedColor= isLight ? '#888888' : '#6b7280'
  const cardBg    = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
  const cardBorder= isLight ? `${theme.acc}28` : `${theme.acc}22`
  const monogram  = profile.display_name?.charAt(0)?.toUpperCase() || 'T'

  const allLinks=[
    profile.whatsapp?{url:profile.whatsapp.startsWith('http')?profile.whatsapp:`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`,label:'WhatsApp',type:'whatsapp'}:null,
    profile.instagram?{url:profile.instagram.startsWith('http')?profile.instagram:`https://instagram.com/${profile.instagram.replace('@','')}`,label:'Instagram',type:'instagram'}:null,
    profile.tiktok?{url:profile.tiktok.startsWith('http')?profile.tiktok:`https://tiktok.com/@${profile.tiktok.replace('@','')}`,label:'TikTok',type:'tiktok'}:null,
    profile.linkedin?{url:profile.linkedin.startsWith('http')?profile.linkedin:`https://linkedin.com/in/${profile.linkedin}`,label:'LinkedIn',type:'linkedin'}:null,
    profile.facebook?{url:profile.facebook.startsWith('http')?profile.facebook:`https://facebook.com/${profile.facebook}`,label:'Facebook',type:'facebook'}:null,
    profile.youtube?{url:profile.youtube.startsWith('http')?profile.youtube:`https://youtube.com/@${profile.youtube.replace('@','')}`,label:'YouTube',type:'youtube'}:null,
    profile.email?{url:`mailto:${profile.email}`,label:'Email',type:'email'}:null,
    profile.website?{url:profile.website.startsWith('http')?profile.website:`https://${profile.website}`,label:'Sitio Web',type:'globe'}:null,
    profile.location?{url:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`,label:profile.location,type:'location'}:null,
    ...(profile.custom_links||[]).map((l:CustomLink)=>({url:l.url,label:l.label,type:getCustomIcon(l.url)})),
  ].filter(Boolean) as {url:string;label:string;type:string}[]

  // Todos los links van como tarjetas completas
  const socialLinks: typeof allLinks = []
  const cardLinks = allLinks

  return(
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap"/>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes tRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ring-wrap {
          position: relative;
          width: 118px;
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .ring-spin {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(${theme.r1}, ${theme.r2}, ${theme.r1});
          animation: tRing 6s linear infinite;
        }
        .ring-inner {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: ${theme.bg};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .monogram {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 42px;
          font-weight: 700;
          color: ${theme.acc};
          line-height: 1;
          user-select: none;
        }
        .profile-name {
          font-family: 'DM Sans', -apple-system, sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: ${textColor};
          margin: 0;
          letter-spacing: -0.3px;
          animation: slideDown 0.45s ease both;
          animation-delay: 0.3s;
          opacity: 0;
        }
        .profile-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.acc};
          margin: 6px 0 0;
          animation: slideDown 0.45s ease both;
          animation-delay: 0.42s;
          opacity: 0;
        }
        .profile-company {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: ${subColor};
          margin: 4px 0 0;
          animation: slideDown 0.45s ease both;
          animation-delay: 0.52s;
          opacity: 0;
        }
        .social-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          animation: fadeUp 0.45s ease both;
          animation-delay: 0.55s;
          opacity: 0;
        }
        .social-icon-btn {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${cardBg};
          border: 1px solid ${cardBorder};
          text-decoration: none;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          backdrop-filter: blur(8px);
        }
        .social-icon-btn:hover {
          transform: scale(1.12) translateY(-2px);
          box-shadow: 0 6px 20px ${theme.acc}40;
        }
        .social-icon-btn:active {
          transform: scale(0.94) !important;
          transition-duration: 0.08s !important;
        }
        .card-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          text-decoration: none;
          background: ${cardBg};
          border: 1px solid ${cardBorder};
          border-radius: 14px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.18s ease,
                      background 0.18s ease;
          animation: fadeUp 0.45s ease both;
          opacity: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .card-link:hover {
          transform: scale(1.025) translateY(-1px);
          background: ${theme.acc}14;
          box-shadow: 0 6px 28px ${theme.acc}30;
          border-color: ${theme.acc}44;
        }
        .card-link:active {
          transform: scale(0.97) !important;
          transition-duration: 0.08s !important;
          box-shadow: none !important;
        }
        .taply-footer {
          animation: fadeUp 0.5s ease both;
          animation-delay: 0.8s;
          opacity: 0;
        }
        .divider-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, ${theme.r1}66, ${theme.r2}66);
          margin: 0 auto;
        }
      `}</style>
      <div style={{
        minHeight:'100vh',
        background: theme.bg,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Hero section */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 20px 40px',
          gap: '0',
        }}>
          {/* Ring avatar */}
          <div className="ring-wrap">
            <div className="ring-spin"/>
            <div className="ring-inner">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name}
                  style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
              ) : (
                <span className="monogram">{monogram}</span>
              )}
            </div>
          </div>

          <div style={{height:'20px'}}/>

          {/* Name + tagline */}
          <h1 className="profile-name">{profile.display_name}</h1>
          {profile.tagline && <p className="profile-tagline">{profile.tagline}</p>}
          {profile.company && <p className="profile-company">{profile.company}</p>}

        </div>

        {/* Thin divider */}
        <div className="divider-line"/>

        {/* Cards section */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px 16px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {cardLinks.map((link,i)=>(
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="card-link"
              style={{animationDelay:`${0.15+i*0.08}s`}}>
              <BrandIcon type={link.type} color={theme.acc}/>
              <span style={{color:textColor,fontSize:'15px',fontWeight:500,flex:1}}>{link.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.acc} strokeWidth="2" opacity="0.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}

          {/* Footer */}
          <div style={{height:'16px'}}/>
          <div className="taply-footer" style={{textAlign:'center',padding:'20px 16px'}}>
            <p style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '13px',
              fontStyle: 'italic',
              color: mutedColor,
              letterSpacing: '0.02em',
            }}>
              Powered by <span style={{color:theme.acc,fontStyle:'normal',fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:'1.5px',fontSize:'14px'}}>TAPLY</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
