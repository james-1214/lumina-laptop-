import { AnimatePresence, motion } from 'framer-motion'
import { STORY } from '../config/ComponentMetadata'

/** Only ever renders ONE panel (the active story index); alternates left/right by index. */
export default function ComponentStoryPanel({ index }) {
  const s = STORY[index]
  return (<div className="story-layer" aria-live="polite"><AnimatePresence mode="wait">{s && (
    <motion.article key={s.id} className={`story-panel ${s.side === 'l' ? 'left' : 'right'}`} data-index={s.index} data-side={s.side}
      initial={{ opacity:0, x: s.side === 'l' ? -48 : 48, y:16 }} animate={{ opacity:1, x:0, y:0 }} exit={{ opacity:0, x: s.side === 'l' ? -28 : 28, y:-12, transition:{ duration:0.28, ease:'easeIn' } }} transition={{ duration:0.6, ease:[0.16,0.84,0.24,1] }}>
      <span className="ghost" aria-hidden="true">{s.num}</span><span className="num">{s.num} <i/> {String(STORY.length).padStart(2,'0')}</span>
      <h3>{s.title}</h3><p className="subtitle">{s.subtitle}</p><div className="rule"/><p className="desc">{s.desc}</p>
      <h4>Key functions</h4><ul>{s.functions.map(f => <li key={f}>{f}</li>)}</ul>
      <h4>Purpose</h4><p className="purpose">{s.purpose}</p>
      <h4>Technical information</h4><dl>{s.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </motion.article>)}</AnimatePresence></div>)
}
