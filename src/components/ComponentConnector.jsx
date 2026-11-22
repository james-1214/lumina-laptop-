import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { S } from '../animations/masterTimeline'

/** Thin animated line from the active panel's inner edge to the projected 3D component. Updated on the GSAP ticker (no React renders). */
export default function ComponentConnector() {
  const line = useRef(), dot = useRef(), svg = useRef()
  useEffect(() => {
    const tick = () => { const c = S.conn, panel = document.querySelector('.story-panel'), L = line.current, D = dot.current
      const off = () => { L.style.opacity = 0; D.style.opacity = 0 }
      if (!c.on || !panel || c.w < 0.05 || window.innerWidth < 760) return off()
      const r = panel.getBoundingClientRect(), host = svg.current.getBoundingClientRect(), x1 = (c.side === 'l' ? r.right : r.left) - host.left, y1 = r.top + Math.min(r.height*0.3, 120) - host.top
      const x2 = c.x, y2 = c.y, len = Math.hypot(x2-x1, y2-y1), d = Math.min(1, c.w*1.6)
      L.setAttribute('x1', x1); L.setAttribute('y1', y1); L.setAttribute('x2', x2); L.setAttribute('y2', y2)
      L.style.strokeDasharray = len; L.style.strokeDashoffset = len*(1-d); L.style.opacity = Math.min(1, c.w*1.4)
      D.setAttribute('cx', x2); D.setAttribute('cy', y2); D.style.opacity = d > 0.95 ? 1 : 0 }
    gsap.ticker.add(tick); return () => gsap.ticker.remove(tick)
  }, [])
  return (<svg ref={svg} className="connector" aria-hidden="true"><defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stopColor="#5C76B8"/><stop offset="1" stopColor="#8A86CC"/></linearGradient></defs>
    <line ref={line} stroke="url(#cg)" strokeWidth="1.4" style={{ opacity:0 }}/><circle ref={dot} r="4.5" fill="#5FA3C0" stroke="#F7F9FD" strokeWidth="1.5" style={{ opacity:0 }}/></svg>)
}
