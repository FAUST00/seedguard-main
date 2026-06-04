'use client';

import { useState } from 'react';
import { Brain, Heart, Zap, Eye, Trophy, Star, TrendingUp, Shield, CheckCircle } from 'lucide-react';

const weekData = [
  { week: 1, label: 'WEEK 1', subtitle: 'Days 1–7 · Detox Phase', accent: '#e879f9', border: 'rgba(232,121,249,0.3)', glow: 'rgba(232,121,249,0.08)', number: '01', phase: 'DETOX PHASE',
    benefits: ['Energy spike around Days 4–7','Increased confidence & assertiveness','Better gym performance','Slight mood elevation','Heightened mental drive'],
    challenges: ['Intense urges & cravings','Irritability & mood swings','Sleep disruption','Anxiety & restlessness','Possible headaches'] },
  { week: 2, label: 'WEEK 2', subtitle: 'Days 8–14 · Flatline Begins', accent: '#22d3ee', border: 'rgba(34,211,238,0.3)', glow: 'rgba(34,211,238,0.08)', number: '02', phase: 'FLATLINE',
    benefits: ['Urge intensity starts decreasing','Internal calm begins building','Brain starts rewiring pathways','Clarity in moments of stillness'],
    challenges: ['Low energy & motivation','Emotional numbness (flatline)','Brain fog & apathy','Reduced libido — this is normal','Hardest week for most men'] },
  { week: 3, label: 'WEEK 3', subtitle: 'Days 15–21 · Energy Returns', accent: '#a78bfa', border: 'rgba(167,139,250,0.3)', glow: 'rgba(167,139,250,0.08)', number: '03', phase: 'REAWAKENING',
    benefits: ['Energy stronger than your baseline','Sharper focus & mental clarity','Improved sleep quality','Increased eye contact & charisma','Motivation resurfaces powerfully','Deeper voice (widely reported)'],
    challenges: ['Occasional urge spikes','Mood fluctuations','Social rewiring feels uncomfortable'] },
  { week: 4, label: 'WEEK 4', subtitle: 'Days 22–30 · Clarity Sharpens', accent: '#34d399', border: 'rgba(52,211,153,0.3)', glow: 'rgba(52,211,153,0.08)', number: '04', phase: 'CLARITY',
    benefits: ['Mental clarity noticeably sharper','Confidence grows daily','Emotional stability improving','Gym performance peak','Skin clearing up','Social presence elevated'],
    challenges: ['Second flatline possible','Discipline required — no coasting','Urges tied to stress triggers'] },
];

const monthData = [
  { period: '~2 Months', title: 'EMOTIONAL STABILITY', icon: Heart, accent: '#e879f9', border: 'rgba(232,121,249,0.25)', bg: 'rgba(232,121,249,0.05)', points: ['Reduced social anxiety','Deeper emotional regulation','Relationship improvements begin','Genuine self-respect & dignity','Consistent, clean daily energy'] },
  { period: '~3 Months', title: 'DOPAMINE REWIRING', icon: Brain, accent: '#22d3ee', border: 'rgba(34,211,238,0.25)', bg: 'rgba(34,211,238,0.05)', points: ['Life feels naturally enjoyable again','Motivation is now your default state','"Magnetism" & social presence','Better discipline across all areas','Spiritual awareness deepens'] },
  { period: '4–6 Months', title: 'PEAK PERFORMANCE', icon: Zap, accent: '#a78bfa', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.05)', points: ['Full mental clarity unlocked','Genuine joy & presence','Strong urge control — automatic','Productivity at an all-time high','Deeper voice & clearer skin','Relationships transform'] },
  { period: '6+ Months', title: 'LIFE TRANSFORMATION', icon: Trophy, accent: '#fbbf24', border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.05)', points: ['Unbreakable, earned confidence','Intuition & creativity amplified','Sustained mastery — no struggle','Inner peace & clear purpose','Life feels fundamentally different'] },
  { period: '2–6 Months', title: 'PHYSICAL UPGRADES', icon: TrendingUp, accent: '#34d399', border: 'rgba(52,211,153,0.25)', bg: 'rgba(52,211,153,0.05)', points: ['Testosterone levels optimised','Stronger, faster gym recovery','Better posture & body language','Clearer skin & sharper eyes','More restful, deeper sleep'] },
  { period: '3–6 Months', title: 'MENTAL CLARITY', icon: Eye, accent: '#fb923c', border: 'rgba(251,146,60,0.25)', bg: 'rgba(251,146,60,0.05)', points: ['Laser focus on demand','Creative breakthroughs','Sharper memory & recall','Better problem-solving instinct','Reduced brain fog permanently'] },
];

export default function BenefitsPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  return (
    <div style={{minHeight:'100vh',background:'#080010',color:'#f3e8ff'}}>
      <div style={{textAlign:'center',padding:'64px 24px 48px',borderBottom:'1px solid rgba(167,139,250,0.15)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(232,121,249,0.1)',border:'1px solid rgba(232,121,249,0.3)',borderRadius:'999px',padding:'4px 16px',marginBottom:'20px'}}>
          <Shield size={14} style={{color:'#e879f9'}} />
          <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.15em',color:'#e879f9'}}>VERIFIED BY COMMUNITY</span>
        </div>
        <h1 style={{fontSize:'clamp(2rem,6vw,4rem)',fontWeight:900,fontStyle:'italic',letterSpacing:'-0.02em',margin:'0 0 16px',background:'linear-gradient(135deg,#22d3ee 0%,#a78bfa 50%,#e879f9 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>THE RETENTION JOURNEY</h1>
        <p style={{fontSize:'1.1rem',color:'rgba(243,232,255,0.65)',maxWidth:'560px',margin:'0 auto',lineHeight:1.6}}>Discover the real, transformative benefits of semen retention. Every day you hold the line, your brain and body are changing.</p>
      </div>
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 20px 80px'}}>
        <div style={{paddingTop:'56px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'8px'}}>
            <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(232,121,249,0.4))'}} />
            <h2 style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.2em',color:'#e879f9',whiteSpace:'nowrap'}}>WEEK BY WEEK</h2>
            <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(232,121,249,0.4))'}} />
          </div>
          <p style={{textAlign:'center',color:'rgba(243,232,255,0.5)',fontSize:'0.9rem',marginBottom:'36px'}}>The first 30 days — what to expect, honestly.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'20px'}}>
            {weekData.map((w) => (
              <div key={w.week} style={{background:w.glow,border:`1px solid ${w.border}`,borderRadius:'16px',padding:'24px',cursor:'pointer',transition:'box-shadow 0.2s',boxShadow:expandedWeek===w.week?`0 0 32px ${w.border}`:'none'}} onClick={()=>setExpandedWeek(expandedWeek===w.week?null:w.week)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'14px'}}>
                  <div>
                    <span style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.15em',color:w.accent}}>{w.label}</span>
                    <h3 style={{fontSize:'1.15rem',fontWeight:800,color:w.accent,margin:'2px 0 4px'}}>{w.phase}</h3>
                    <span style={{fontSize:'0.75rem',color:'rgba(243,232,255,0.45)'}}>{w.subtitle}</span>
                  </div>
                  <span style={{fontSize:'2.5rem',fontWeight:900,color:w.border,lineHeight:1}}>{w.number}</span>
                </div>
                <div style={{marginBottom:'12px'}}>
                  <span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'rgba(52,211,153,0.9)',display:'block',marginBottom:'6px'}}>↑ BENEFITS</span>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{w.benefits.map((b)=>(<span key={b} style={{fontSize:'0.72rem',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.25)',borderRadius:'6px',padding:'3px 8px',color:'#6ee7b7'}}>{b}</span>))}</div>
                </div>
                {expandedWeek===w.week&&(<div><span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'rgba(251,146,60,0.9)',display:'block',marginBottom:'6px'}}>⚡ CHALLENGES</span><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{w.challenges.map((c)=>(<span key={c} style={{fontSize:'0.72rem',background:'rgba(251,146,60,0.08)',border:'1px solid rgba(251,146,60,0.25)',borderRadius:'6px',padding:'3px 8px',color:'#fdba74'}}>{c}</span>))}</div></div>)}
                <div style={{marginTop:'14px',fontSize:'0.7rem',color:'rgba(243,232,255,0.35)',textAlign:'right'}}>{expandedWeek===w.week?'Click to collapse ↑':'Tap to see challenges ↓'}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{paddingTop:'72px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'8px'}}>
            <div style={{flex:1,height:'1px',background:'linear-gradient(to right,transparent,rgba(34,211,238,0.4))'}} />
            <h2 style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.2em',color:'#22d3ee',whiteSpace:'nowrap'}}>MONTH BY MONTH</h2>
            <div style={{flex:1,height:'1px',background:'linear-gradient(to left,transparent,rgba(34,211,238,0.4))'}} />
          </div>
          <p style={{textAlign:'center',color:'rgba(243,232,255,0.5)',fontSize:'0.9rem',marginBottom:'36px'}}>Long-term rewards for the men who stay the course.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'20px'}}>
            {monthData.map((m)=>{const Icon=m.icon;return(
              <div key={m.title} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:'16px',padding:'28px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`${m.accent}18`,border:`1px solid ${m.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={20} style={{color:m.accent}} /></div>
                  <div><span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.12em',color:m.accent,display:'block'}}>{m.period}</span><h3 style={{fontSize:'1rem',fontWeight:800,color:'#f3e8ff',margin:0}}>{m.title}</h3></div>
                </div>
                <ul style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'8px'}}>{m.points.map((p)=>(<li key={p} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'0.85rem',color:'rgba(243,232,255,0.8)',lineHeight:1.4}}><CheckCircle size={14} style={{color:m.accent,flexShrink:0,marginTop:'2px'}} />{p}</li>))}</ul>
                <div style={{marginTop:'16px',display:'flex',alignItems:'center',gap:'6px'}}><Star size={11} style={{color:m.accent}} /><span style={{fontSize:'0.65rem',color:'rgba(243,232,255,0.35)',fontWeight:600,letterSpacing:'0.08em'}}>VERIFIED BY COMMUNITY</span></div>
              </div>
            );})}
          </div>
        </div>
        <div style={{marginTop:'72px',background:'linear-gradient(135deg,rgba(232,121,249,0.06),rgba(34,211,238,0.06))',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'20px',padding:'40px',textAlign:'center'}}>
          <h2 style={{fontSize:'1.5rem',fontWeight:800,letterSpacing:'0.05em',color:'#e879f9',marginBottom:'12px'}}>YOUR PATH TO FREEDOM</h2>
          <p style={{color:'rgba(243,232,255,0.6)',maxWidth:'480px',margin:'0 auto 28px',lineHeight:1.6,fontSize:'0.95rem'}}>Every man who has made it past 90 days describes a fundamental shift. Will you be one of them?</p>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'12px'}}>
            {['Day 7 — Feel the shift','Day 14 — Survive flatline','Day 30 — Clarity hits','Day 90 — Rewired','Day 180 — Transformed'].map((m)=>(<div key={m} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'999px',padding:'6px 16px',fontSize:'0.8rem',color:'#c4b5fd',fontWeight:600}}>{m}</div>))}
          </div>
        </div>
        <p style={{textAlign:'center',color:'rgba(243,232,255,0.25)',fontSize:'0.75rem',marginTop:'40px',lineHeight:1.6}}>Individual results vary. Benefits are based on community reports and testimonials. Not medical advice.</p>
      </div>
    </div>
  );
}
