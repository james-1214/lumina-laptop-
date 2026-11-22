import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { S } from '../animations/masterTimeline'
import { STORY } from '../config/ComponentMetadata'

const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))
const corner = new THREE.Vector3(), inv = new THREE.Matrix4(), m4 = new THREE.Matrix4(), ndc = new THREE.Vector3()
/** Outline box (in assembly space, so it rotates with the model) + projected anchor for the connector. Reads S.hi only. */
export default function ComponentHighlight({ rig }) {
  const line = useRef(), cur = useMemo(() => new THREE.Box3(), []), tgt = useMemo(() => new THREE.Box3(), []), { camera, size } = useThree(), has = useRef(false)
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color:'#5FA3C0', transparent:true, opacity:0, depthTest:false, toneMapped:false }), [])
  useFrame(() => {
    let a = 0, w = 0; S.hi.forEach((h, i) => { if (h > w) { w = h; a = i } })
    if (w < 0.01) { line.current.visible = false; S.conn.w = 0; S.conn.on = false; S.focus.w = 0; return }
    const st = STORY[a]; rig.anchor.parent.updateWorldMatrix(true, true); inv.copy(rig.anchor.matrixWorld).invert(); tgt.makeEmpty()
    for (const n of st.targets) rig.byName[n]?.traverse(o => { if (!o.isMesh) return; const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox; m4.multiplyMatrices(inv, o.matrixWorld)
      for (let i = 0; i < 8; i++) { corner.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(m4); tgt.expandByPoint(corner) } })
    if (tgt.isEmpty()) return
    if (!has.current) { cur.copy(tgt); has.current = true } else { cur.min.lerp(tgt.min, 0.25); cur.max.lerp(tgt.max, 0.25) }
    const c = cur.getCenter(corner.clone()), s = cur.getSize(new THREE.Vector3()).addScalar(0.12)
    line.current.visible = true; line.current.position.copy(c); line.current.scale.copy(s); mat.opacity = Math.min(1, w)*0.95; mat.color.set(a % 2 ? '#8A86CC' : '#5FA3C0')
    const wp = rig.anchor.localToWorld(c.clone()); S.focus.x = wp.x; S.focus.y = wp.y; S.focus.z = wp.z; S.focus.w = w; S.focus.zoom = st.zoom || 1
    ndc.copy(wp).project(camera); S.conn.x = (ndc.x*0.5 + 0.5)*size.width; S.conn.y = (-ndc.y*0.5 + 0.5)*size.height; S.conn.w = w; S.conn.side = st.side; S.conn.on = true
  })
  return <lineSegments ref={line} geometry={edges} material={mat} visible={false} renderOrder={10} frustumCulled={false} />
}
