import { useEffect } from 'react'
import { RotateCcw, Orbit, Tags } from 'lucide-react'
import { S } from '../animations/masterTimeline'

// One rotation controller. Total assembly yaw = scroll yaw (GSAP) + story yaw + this drag offset (additive, never overwritten).
export const ROT = { yaw:0, yawT:0, pitch:0, pitchT:0, auto:false, down:false }
const EXPLODED = [0.19, 0.91]
export function updateRotation(dt) {
  const on = S.p > EXPLODED[0] && S.p < EXPLODED[1]
  if (!on) { ROT.yawT *= Math.exp(-dt*2); ROT.pitchT *= Math.exp(-dt*2); ROT.auto = false }          // eases back when leaving the section
  else if (ROT.auto && !ROT.down) ROT.yawT += dt*0.5
  const k = 1 - Math.exp(-dt*8); ROT.yaw += (ROT.yawT - ROT.yaw)*k; ROT.pitch += (ROT.pitchT - ROT.pitch)*k
}
export const resetRotation = () => { ROT.yawT = 0; ROT.pitchT = 0; ROT.auto = false }

export default function RotationController({ target, visible, auto, onAuto, labels, onLabels }) {
  useEffect(() => {
    const el = target.current; if (!el) return; let lx = 0, ly = 0, id = null
    const down = e => { if (S.p <= EXPLODED[0] || S.p >= EXPLODED[1]) return; id = e.pointerId; ROT.down = true; lx = e.clientX; ly = e.clientY; try { el.setPointerCapture?.(id) } catch {} }
    const move = e => { if (!ROT.down || e.pointerId !== id) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY
      ROT.yawT += dx*0.008; if (e.pointerType === 'mouse') ROT.pitchT = Math.max(-0.7, Math.min(0.7, ROT.pitchT + dy*0.005)) }   // touch: horizontal only, vertical stays page scroll
    const up = e => { if (e.pointerId !== id) return; ROT.down = false; try { el.releasePointerCapture?.(id) } catch {} id = null }
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up)
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up) }
  }, [target])
  if (!visible) return null
  return (<div className="rot-controls" role="toolbar" aria-label="Assembly view controls">
    <span className="hintline">Drag to rotate</span>
    <button onClick={() => { resetRotation(); onAuto(false) }}><RotateCcw size={14}/> Reset view</button>
    <button className={auto ? 'on' : ''} aria-pressed={auto} onClick={() => { ROT.auto = !auto; onAuto(!auto) }}><Orbit size={14}/> Auto-rotate</button>
    <button className={labels ? 'on' : ''} aria-pressed={labels} onClick={() => { S.ui.labels = !labels; onLabels(!labels) }}><Tags size={14}/> Labels</button></div>)
}
