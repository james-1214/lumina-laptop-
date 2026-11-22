import { useMemo, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer, ContactShadows, Html, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { S } from '../animations/masterTimeline'
import * as C from '../config/laptopTransforms'
import { BOX } from './assets'
import { buildRig, applyPose } from './rigBuilder'
import ExplodedAssembly from './ExplodedAssembly'
import { ROT, updateRotation } from './RotationController'
import { STORY, storyStart } from '../config/ComponentMetadata'

const rawOff = (v, zs=1) => new THREE.Vector3(v[0], -v[2], v[1]*zs) // rest-world -> raw model axes
const ss = (a,b,x) => { const t = Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t) }
export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Rig() {
  const lap = useGLTF('/models/mac_book_pro.glb'), board = useGLTF('/models/motherboard__1_.glb'), ssd = useGLTF('/models/m-2-2280-ssd-nvme-m-key.glb')
  const rig = useMemo(() => buildRig({ lap, board, ssd }), [lap, board, ssd])
  const root = useRef(), light = useRef(), labelRefs = useRef([]), fadeOn = useRef(false), lastPaint = useRef(-1), lastScr = useRef(-1)
  const calm = useMemo(reducedMotion, [])
  const tmpB = useMemo(() => new THREE.Box3(), [])
  useMemo(() => { if (typeof window !== 'undefined') window.__lumina = { rig, S, C } }, [rig])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, f = calm ? 0 : 1, b = S.box, P = rig.pack, l = S.lap
    P.lid.rotation.x = -1.95*b.lid; P.lid.position.y = BOX.H + 0.06 + 0.3*Math.sin(Math.PI*Math.min(1, b.lid))
    P.tray.position.y = 0.9*b.tray
    P.sleeve.position.set(BOX.POCKET_X + 3.4*b.sleeve, 0.45 + 0.9*b.tray + 0.15*b.sleeve, 0)
    const fo = b.fade > 0.001; if (fo !== fadeOn.current) { fadeOn.current = fo; P.mats.forEach(m => { m.transparent = fo; m.needsUpdate = true }) }
    P.mats.forEach(m => { m.opacity = 1 - 0.95*b.fade }); P.root.visible = b.fade < 0.995
    const rr = l.rise, e = rr*rr*(3-2*rr), bob = Math.sin(t*0.9)*0.05*f
    root.current.position.set(BOX.POCKET_X*(1-e), BOX.TRAY_TOP + 0.03 + 0.9*b.tray*(1-rr) + rr*(C.HOVER_Y-BOX.TRAY_TOP) + bob*l.float, 0)
    let sy = 0; STORY.forEach(st => { sy += st.yaw*S.hi[st.index] }); updateRotation(Math.min(0.05, dt))
    root.current.rotation.order = 'YXZ'; const wob = S.p < 0.19 || S.p > 0.91 ? 1 : 0
    root.current.rotation.set(ROT.pitch + Math.sin(t*0.7)*0.02*l.float*f*wob, l.yaw + sy + ROT.yaw, Math.cos(t*0.6)*0.015*l.float*f*wob)
    applyPose(rig, S, t)
    if (rig.atlas) { if (S.screen > 0.001) { if (Math.floor(t*6) !== lastPaint.current || (S.screen < 1 && Math.abs(S.screen - lastScr.current) > 0.03)) { lastPaint.current = Math.floor(t*6); lastScr.current = S.screen; rig.atlas.paint(calm ? 0 : t, S.screen) } } else if (lastScr.current !== 0) { lastScr.current = 0; rig.atlas.paint(0, 0) } }
    const pm = rig.byName.LCD_Panel?.material; if (pm) pm.emissiveIntensity = 0.8*S.screen
    light.current.intensity = 5*S.glow*(1 - rr*0.7)
    root.current.updateWorldMatrix(true, true)
    C.LABELS.forEach((lb, i) => { const el = labelRefs.current[i]; if (!el?.g) return
      tmpB.setFromObject(rig.byName[lb.obj]); tmpB.getCenter(el.g.position); if (el.d) el.d.style.opacity = S.ui.labels ? ss(0.8, 1, S.ex[lb.key]) * ss(0.80, 0.83, S.p) * (1 - ss(0.91, 0.925, S.p)) : 0 })
  })
  return (<>
    <primitive object={rig.pack.root} /><pointLight ref={light} position={[0,0.7,0]} color="#d7e4f7" distance={5} />
    <ExplodedAssembly ref={root} rig={rig} />
    {C.LABELS.map((lb,i) => <group key={lb.text} ref={el => { labelRefs.current[i] = { ...(labelRefs.current[i]||{}), g:el } }}>
      <Html zIndexRange={[5,0]} style={{ pointerEvents:'none' }}>
        <div ref={el => { labelRefs.current[i] = { ...(labelRefs.current[i]||{}), d:el } }} onClick={() => lb.story !== undefined && window.__luminaGoTo?.(storyStart(lb.story))} className={`tag tag-${lb.side}`} style={{ opacity:0, marginTop:lb.dy||0 }}><i/><span>{lb.text}</span></div>
      </Html></group>)}
  </>)
}

function CameraRig() {
  const { camera, size } = useThree(); const p = useMemo(() => new THREE.Vector3(), []), tg = useMemo(() => new THREE.Vector3(), []), cur = useRef(null)
  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05); const k = size.width/size.height < 0.8 ? 1.75 : size.width/size.height < 1.3 ? 1.3 : 1, c = S.cam
    tg.set(c.tx, c.ty, c.tz); p.set(c.x, c.y, c.z).sub(tg).multiplyScalar(k).add(tg)
    const fw = S.focus.w; if (fw > 0.001) { const tf = 0.32*fw, pf = Math.min(0.6, 0.12 + 0.3*(S.focus.zoom - 1))*fw
      const fx = S.focus.x, fy = S.focus.y, fz = S.focus.z
      p.x += (fx - p.x)*pf; p.y += (fy - p.y)*pf; p.z += (fz - p.z)*pf           // dolly toward the introduced part
      tg.x += (fx - tg.x)*tf; tg.y += (fy - tg.y)*tf; tg.z += (fz - tg.z)*tf }
    if (!cur.current) cur.current = { p: p.clone(), t: tg.clone() }
    const k2 = 1 - Math.exp(-dt*5.5); cur.current.p.lerp(p, k2); cur.current.t.lerp(tg, k2)
    camera.position.copy(cur.current.p); camera.lookAt(cur.current.t); window.__cam = camera
  })
  return null
}

function Particles({ n }) {
  const ref = useRef(); const geo = useMemo(() => { const a = new Float32Array(n*3); for (let i=0;i<n;i++){ a[i*3]=(Math.random()-.5)*14; a[i*3+1]=Math.random()*7; a[i*3+2]=(Math.random()-.5)*8 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a,3)); return g }, [n])
  useFrame(({clock}) => { ref.current.rotation.y = clock.elapsedTime*0.02; ref.current.position.y = Math.sin(clock.elapsedTime*0.2)*0.1 })
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.035} color="#8aa0d0" transparent opacity={0.55} depthWrite={false} sizeAttenuation /></points>
}

function Lights() {
  const key = useRef(), sweep = useRef()
  useFrame(() => { key.current.intensity = 1.8 + 0.7*S.glow; sweep.current.position.x = -5 + 10*Math.min(1,(S.sweep+1)/2*2); sweep.current.intensity = 2.2*(1-ss(0.12,0.2,S.p)) })
  return (<>
    <ambientLight intensity={0.3} />
    <directionalLight ref={key} position={[4,8,6]} intensity={2} />
    <directionalLight position={[-6,3,4]} intensity={0.9} color="#d6e2f8" />
    <directionalLight position={[-3,5,-6]} intensity={1.5} color="#b8b4ec" />
    <pointLight ref={sweep} position={[-5,2.5,3]} color="#cfe6ee" distance={9} />
  </>)
}

export default function Scene() {
  const [dpr, setDpr] = useState(Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1))
  const mobile = typeof window !== 'undefined' && window.innerWidth < 760, calm = reducedMotion()
  return (
    <Canvas dpr={[1, Math.min(dpr, 1.5)]} camera={{ fov:34, position:[1.4,1.8,7.6], near:0.1, far:60 }} gl={{ alpha:true, antialias:true, powerPreference:'high-performance' }}>
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Lights />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.5} position={[0,6,0]} rotation-x={Math.PI/2} scale={[14,14,1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6,2,3]} rotation-y={Math.PI/2.5} scale={[8,5,1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={1.2} position={[6,3,-2]} rotation-y={-Math.PI/2.5} scale={[8,5,1]} color="#e6dcff" />
      </Environment>
      <Suspense fallback={null}><Rig /></Suspense>
      <ContactShadows position={[0,0.001,0]} opacity={0.5} scale={16} blur={2.4} far={5} resolution={256} color="#4d6190" />
      {!calm && <Particles n={mobile ? 40 : 110} />}
      <CameraRig />
    </Canvas>
  )
}
;['/models/mac_book_pro.glb','/models/motherboard__1_.glb','/models/m-2-2280-ssd-nvme-m-key.glb'].forEach(u => useGLTF.preload(u))
