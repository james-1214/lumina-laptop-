import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { S } from '../animations/masterTimeline'
import * as C from '../config/laptopTransforms'
import { buildRig, applyPose, verify, REPORT_ITEMS } from '../three/rigBuilder'

const hue = i => new THREE.Color().setHSL((i*0.137) % 1, 0.85, 0.5)
function DebugRig({ iso, contrast, explode, onReport }) {
  const lap = useGLTF('/models/mac_book_pro.glb'), board = useGLTF('/models/motherboard__1_.glb'), ssd = useGLTF('/models/m-2-2280-ssd-nvme-m-key.glb')
  const rig = useMemo(() => buildRig({ lap, board, ssd }), [lap, board, ssd])
  const { camera } = useThree(); const orig = useRef(new Map()), last = useRef(0)
  useMemo(() => { S.lap.open = C.OPEN_DEG; S.screen = 1; window.__lumina = { rig, S, C } }, [rig])
  useEffect(() => { C.EXPLODE_ORDER.forEach(k => { S.ex[k] = explode ? 1 : 0 }) }, [explode])
  useEffect(() => { REPORT_ITEMS.forEach(([, n], i) => { const o = rig.byName[n]; o?.traverse(m => { if (!m.isMesh) return
    if (!orig.current.has(m)) orig.current.set(m, m.material); m.material = contrast ? new THREE.MeshStandardMaterial({ color:hue(i), roughness:0.5 }) : orig.current.get(m) }) }) }, [contrast, rig])
  useEffect(() => { const has = (a, b) => { for (let p = b; p; p = p.parent) if (p === a) return true; return false }
    const tgt = iso && rig.byName[iso]; rig.reg.forEach(e => { e.obj.visible = !tgt || has(tgt, e.obj) || has(e.obj, tgt) })
    rig.pivot.children.forEach(c => { c.visible = !tgt || has(tgt, c) || has(c, tgt) })
    rig.anchor.traverse(o => { if (o.isMesh && o.parent?.name === 'Display_Hinge_Pivot') o.visible = !tgt || has(tgt, o) }) }, [iso, rig])
  useFrame(({ clock }) => { applyPose(rig, S, clock.elapsedTime); const t = clock.elapsedTime; if (t - last.current > 1) { last.current = t
    rig.anchor.parent?.updateWorldMatrix(true, true)
    onReport(REPORT_ITEMS.map(([label, n]) => ({ label, ...verify(rig.byName[n], camera) }))) } })
  return <group scale={C.LAPTOP_SCALE} position={[0, 2.3, 0]}><primitive object={rig.anchor} /></group>
}
export default function DebugComponents() {
  const [rows, setRows] = useState([]), [iso, setIso] = useState(''), [contrast, setContrast] = useState(false), [explode, setExplode] = useState(true)
  useEffect(() => { window.__report = rows }, [rows])
  const okN = rows.filter(r => r.ok).length
  return (<div style={{ display:'grid', gridTemplateColumns:'340px 1fr', height:'100vh', fontFamily:'Inter,system-ui', background:'#f8fafc' }}>
    <aside style={{ overflow:'auto', padding:14, borderRight:'1px solid #e2e8f0', fontSize:12 }}>
      <h3 style={{ margin:'0 0 8px' }}>/debug-components</h3>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
        <button onClick={() => setExplode(!explode)}>{explode ? 'Assemble' : 'Explode'}</button>
        <button onClick={() => setContrast(!contrast)}>{contrast ? 'Real materials' : 'Contrast colours'}</button>
        <button onClick={() => setIso('')}>Show all</button></div>
      <p id="summary"><b>{okN}/{rows.length}</b> components VISIBLE</p>
      <ul style={{ listStyle:'none', padding:0, margin:0 }}>{rows.map(r => <li key={r.label} onClick={() => setIso(REPORT_ITEMS.find(x => x[0] === r.label)[1])}
        style={{ cursor:'pointer', padding:'3px 0', color:r.ok ? '#0f766e' : '#b91c1c', fontWeight:iso && REPORT_ITEMS.find(x => x[0] === r.label)[1] === iso ? 700 : 400 }}>
        {r.label}: {r.ok ? 'VISIBLE' : 'NOT VISIBLE — ' + r.reason} <span style={{ color:'#64748b' }}>{r.meshes ? `(${r.meshes} meshes, ${r.verts} verts, ${r.size?.join('×')})` : ''}</span></li>)}</ul>
    </aside>
    <Canvas camera={{ fov:34, position:[6.5,5.5,13], near:0.1, far:80 }} gl={{ antialias:true }}>
      <color attach="background" args={['#f1f5fb']} /><ambientLight intensity={0.6} /><directionalLight position={[4,8,6]} intensity={2} />
      <Environment resolution={128} frames={1}><Lightformer form="rect" intensity={2} position={[0,6,0]} rotation-x={Math.PI/2} scale={[14,14,1]} /></Environment>
      <DebugRig iso={iso} contrast={contrast} explode={explode} onReport={setRows} /><OrbitControls target={[0,3.1,0]} /><gridHelper args={[16,16,'#cbd5e1','#e2e8f0']} />
    </Canvas></div>)
}
