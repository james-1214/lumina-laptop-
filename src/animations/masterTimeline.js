import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EXPLODE_ORDER, OPEN_DEG } from '../config/laptopTransforms'
import { STORY, STORY_RANGE, OVERVIEW_RANGE } from '../config/ComponentMetadata'
gsap.registerPlugin(ScrollTrigger)

// GSAP tweens ONLY these numbers. The render loop is the single writer of 3D transforms.
export const S = {
  p:0, box:{ lid:0, tray:0, sleeve:0, fade:0 }, lap:{ rise:0, yaw:0, open:0, float:0 }, screen:0, glow:0, sweep:0,
  ex:Object.fromEntries(EXPLODE_ORDER.map(k => [k,0])), hi:STORY.map(() => 0),
  cam:{ x:3.0, y:4.6, z:7.8, tx:0, ty:0.3, tz:0 }, conn:{ x:0, y:0, w:0, side:'l', on:false }, focus:{ x:0, y:3.3, z:0, w:0, zoom:1 }, ui:{ labels:true },
}
export const END_YAW = -5.78 // assembly yaw when the exploded section begins (hero three-quarter angle)
const K = 0.3016, L = x => x*K // pre-explode stages keep their original proportions, compressed into 0..0.19
export const CAM_KEYS = [
  [0, [3.0,4.6,7.8], [0,0.3,0]], [L(0.12), [2.5,4.2,6.9], [0,0.4,0]], [L(0.25), [1.6,4.6,9.0], [0,1.5,-0.2]], [L(0.35), [0.9,3.7,6.0], [0,0.9,0]],
  [L(0.43), [-0.5,3.6,6.8], [0,1.2,0]], [L(0.53), [-2.0,4.0,9.2], [0,2.1,0]], [L(0.63), [2.4,4.0,6.6], [0,3.1,0]],
  [0.31, [3.4,4.9,12.2], [0,3.3,0]], [0.34, [3.0,4.7,11.4], [0,3.3,0]], [0.82, [2.4,4.6,11.4], [0,3.3,0]], [0.86, [0,5.0,11.8], [0,3.3,0]], [0.91, [0,5.0,11.8], [0,3.3,0]],
  [0.965, [-2.4,3.8,8.4], [0,2.65,0]], [1.0, [2.8,3.8,8.0], [0,2.65,0]],
]
export function buildMasterTimeline(trigger, { reduced, onProgress }) {
  const last = new WeakMap()
  const tw = (tl, obj, props, t0, t1, ease = 'power2.inOut') => {
    const mem = last.get(obj) || {}; last.set(obj, mem); const from = {}
    for (const k in props) from[k] = mem[k] ?? obj[k]
    Object.assign(mem, props); tl.fromTo(obj, from, { ...props, duration:t1-t0, ease, immediateRender:false }, t0)
  }
  const tl = gsap.timeline({ scrollTrigger:{ trigger, start:'top top', end:'bottom bottom', scrub: (reduced || location.search.includes('nosmooth')) ? true : 0.8,
    onUpdate:s => { S.p = s.progress; onProgress(s.progress) } } })
  for (let i = 1; i < CAM_KEYS.length; i++) { const t0 = CAM_KEYS[i-1][0], [t1,p,t] = CAM_KEYS[i]
    tw(tl, S.cam, { x:p[0], y:p[1], z:p[2], tx:t[0], ty:t[1], tz:t[2] }, t0, t1) }
  // 0 .. 0.19  box, unboxing, laptop reveal, display
  tw(tl, S, { sweep:1 }, 0, L(0.12), 'none'); tw(tl, S, { glow:1 }, L(0.12), L(0.25)); tw(tl, S.box, { lid:1 }, L(0.12), L(0.25)); tw(tl, S.box, { tray:1 }, L(0.25), L(0.35))
  tw(tl, S.box, { sleeve:1 }, L(0.35), L(0.43), 'power2.out'); tw(tl, S.lap, { rise:1, float:1 }, L(0.43), L(0.53), 'power3.inOut'); tw(tl, S.lap, { yaw:-3.4 }, L(0.43), L(0.53))
  tw(tl, S.box, { tray:0 }, L(0.54), L(0.62)); tw(tl, S.lap, { yaw:END_YAW }, L(0.53), L(0.63)); tw(tl, S.lap, { open:OPEN_DEG }, L(0.53), L(0.63)); tw(tl, S, { screen:1 }, L(0.57), L(0.64), 'power1.inOut')
  tw(tl, S.box, { fade:1 }, L(0.57), L(0.65))
  // 0.19 .. 0.27  exploded build-out, parts appear in sequence
  const n = EXPLODE_ORDER.length, step = (0.31 - 0.19 - 0.04) / (n - 1)
  EXPLODE_ORDER.forEach((k, i) => tw(tl, S.ex, { [k]:1 }, 0.19 + i*step, 0.19 + i*step + 0.04, 'power3.out'))
  // 0.27 .. 0.80  one component at a time: highlight weight per component
  const len = (STORY_RANGE[1] - STORY_RANGE[0]) / STORY.length
  STORY.forEach((s, i) => { const a = STORY_RANGE[0] + i*len, b = a + len
    tw(tl, S.hi, { [i]:1 }, a - 0.05*len, a + 0.2*len, 'power2.out'); tw(tl, S.hi, { [i]:0 }, b - 0.25*len, b + 0.05*len, 'power2.in') })
  // 0.80 .. 0.90  full 360 degree rotation of the exploded assembly, driven by scroll
  tw(tl, S.lap, { yaw:END_YAW - Math.PI*2 }, OVERVIEW_RANGE[0], OVERVIEW_RANGE[1], 'none')
  // 0.90 .. 0.96  reassembly (reverse order), then hero
  ;[...EXPLODE_ORDER].reverse().forEach((k, i) => tw(tl, S.ex, { [k]:0 }, 0.91 + i*0.0015, 0.91 + i*0.0015 + 0.025, 'power2.inOut'))
  tw(tl, S.lap, { yaw:END_YAW - Math.PI*2 - 0.12 }, 0.965, 1.0)
  tl.to({}, { duration:0 }, 1); return tl
}
