import { AnimatePresence, motion } from 'framer-motion'
import { CHAPTERS } from '../config/sceneTimeline'
import { ArrowDown } from 'lucide-react'
export default function SceneText({ index, goTo }) {
  const c = CHAPTERS[index]
  if (c.id === 'story') return null
  return (<div className={`text ${c.id}`}><AnimatePresence mode="wait"><motion.div key={c.id} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} transition={{ duration:.55, ease:[.2,.7,.2,1] }}>
    {c.id==='box' ? <><h1 className="wordmark">{c.title}</h1><p className="lead">{c.lead}</p></> : <h2>{c.title}</h2>}
    {c.sub && <p className="sub">{c.sub}</p>}
    {c.cta && <button className="cta" onClick={() => document.getElementById('details').scrollIntoView({ behavior:'smooth' })}>Explore LUMINA</button>}
    {c.id==='box' && <p className="hint"><ArrowDown size={14}/> Scroll to unbox</p>}
  </motion.div></AnimatePresence></div>)
}
