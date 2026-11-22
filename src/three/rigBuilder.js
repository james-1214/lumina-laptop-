import * as THREE from 'three'
import * as C from '../config/laptopTransforms'
import { STORY } from '../config/ComponentMetadata'
import { buildPackaging, buildProcedural, buildFan, buildPorts, buildKeyboardFrame, fitGLB } from './assets'

const ss = (a,b,x) => { const t = Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t) }
/* ---------- display atlas: removes third-party logo/artwork, paints LUMINA screen ---------- */
function makeAtlas(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d'), k = c.width/1024
  const tex = new THREE.CanvasTexture(c); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
  let alu = null
  const paint = (t, on) => {
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(img,0,0,c.width,c.height)
    if (!alu) { const d = ctx.getImageData(100*k,720*k,1,1).data; alu = `rgb(${d[0]},${d[1]},${d[2]})` }
    ctx.setTransform(k,0,0,k,0,0)
    ctx.fillStyle = alu; ctx.fillRect(135,795,85,90)                       // erase logo
    const o = ctx.createRadialGradient(176,838,0,176,838,16); o.addColorStop(0,'rgba(113,139,203,.9)'); o.addColorStop(1,'rgba(169,169,220,0)')
    ctx.fillStyle = o; ctx.fillRect(150,812,52,52)                         // LUMINA mark
    ctx.save(); ctx.beginPath(); ctx.rect(394,683,301,279); ctx.clip()      // screen
    const g = ctx.createLinearGradient(394,683,695,962); g.addColorStop(0,'#4F6FB8'); g.addColorStop(.55,'#8478D0'); g.addColorStop(1,'#4FA3C4')
    ctx.fillStyle = g; ctx.fillRect(394,683,301,279)
    for (let i=0;i<3;i++) { const x = 545+Math.sin(t*.6+i*2.1)*90, y = 822+Math.cos(t*.5+i*1.7)*80
      const r = ctx.createRadialGradient(x,y,0,x,y,120); r.addColorStop(0,['rgba(247,249,253,.35)','rgba(141,190,210,.55)','rgba(92,118,184,.5)'][i]); r.addColorStop(1,'rgba(247,249,253,0)')
      ctx.fillStyle = r; ctx.fillRect(394,683,301,279) }
    ctx.fillStyle = `rgba(4,6,10,${1-on})`; ctx.fillRect(394,683,301,279); ctx.restore()
    tex.needsUpdate = true
  }
  paint(0,0); return { tex, paint }
}


/** Split a merged mesh into its connected pieces (each keycap becomes its own Mesh). */
export function splitMesh(mesh, prefix) {
  const g = mesh.geometry, idx = g.index.array, n = g.attributes.position.count, par = new Int32Array(n).map((_, i) => i)
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x] } return x }
  for (let i = 0; i < idx.length; i += 3) { const a = find(idx[i]); par[find(idx[i+1])] = a; par[find(idx[i+2])] = a }
  const groups = new Map(); for (let i = 0; i < idx.length; i += 3) { const r = find(idx[i]); (groups.get(r) || groups.set(r, []).get(r)).push(i) }
  const attrs = ['position','normal','uv'].filter(k => g.attributes[k]), out = []; let k = 0
  for (const tris of groups.values()) { const map = new Map(), ni = []; const arrs = attrs.map(() => [])
    for (const t of tris) for (let c = 0; c < 3; c++) { const v = idx[t+c]; let m = map.get(v); if (m === undefined) { m = map.size; map.set(v, m); attrs.forEach((a, ai) => { const A = g.attributes[a]; for (let q = 0; q < A.itemSize; q++) arrs[ai].push(A.array[v*A.itemSize+q]) }) } ni.push(m) }
    const ng = new THREE.BufferGeometry(); attrs.forEach((a, ai) => ng.setAttribute(a, new THREE.Float32BufferAttribute(arrs[ai], g.attributes[a].itemSize))); ng.setIndex(ni); ng.computeBoundingBox()
    const m = new THREE.Mesh(ng, mesh.material); m.name = `${prefix}_${++k}`; out.push(m) }
  return out
}

export const REPORT_ITEMS = [
  ['Display_Housing','Display_Housing'],['Display_Glass','Display_Glass'],['LCD_Panel','LCD_Panel'],['Backlight_Layer','Backlight_Layer'],['Webcam','Webcam'],
  ['Left_Hinge','Left_Hinge'],['Right_Hinge','Right_Hinge'],['Keyboard_Frame','Keyboard_Frame'],['Keycaps (individual)','Keycaps'],['Trackpad','Trackpad'],
  ['Palm_Rest (top case)','Top_Case'],['Bottom_Cover','Bottom_Cover'],['Motherboard','Motherboard'],['Processor','Processor'],['Graphics_Module','Graphics_Module'],
  ['RAM_Modules','RAM_Modules'],['SSD_Module','SSD_Module'],['Battery_Pack','Battery_Pack'],['Cooling_Fan_Left','Cooling_Fan_Left'],['Cooling_Fan_Right','Cooling_Fan_Right'],
  ['Heat_Pipes','Heat_Pipes'],['Speaker_L','Speaker_L'],['Speaker_R','Speaker_R'],['USB_Port_Assembly','USB_Port_Assembly'],['HDMI_Port_Assembly','HDMI_Port_Assembly'],
  ['Audio_Port_Assembly','Audio_Port_Assembly'],['Internal_Frame','Internal_Frame'],
]

export function buildRig(G) {
  const reg = [], byName = {}, rotors = []
  const sk = G.lap.scene.clone(true); let atlas = null
  sk.traverse(o => { if (o.isMesh && o.material) { o.material = o.material.clone(); if (o.material.map?.image) { atlas ||= makeAtlas(o.material.map.image); o.material.map = atlas.tex }
    o.material.metalness = 0.55; o.material.roughness = 0.38; o.material.needsUpdate = true } })
  const meshes = []; sk.traverse(o => { if (o.isMesh) meshes.push(o) })
  if (meshes.length !== 9) console.error('mac_book_pro.glb: expected 9 meshes, found', meshes.length)
  const find = n => meshes[parseInt(n.split('_')[1], 10) - 2]
  sk.updateMatrixWorld(true)
  const anchor = new THREE.Group(); anchor.name = 'Laptop_Anchor'; anchor.position.set(...C.LAPTOP_ANCHOR); anchor.add(sk)
  // internal parts get a reveal wrapper centred on the part, so they can grow in from their own centre
  const add = (obj, key, sx = 1) => { obj.updateWorldMatrix(false, true); const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3())
    const wrap = new THREE.Group(); wrap.name = obj.name + '_Reveal'; wrap.position.copy(c); obj.position.sub(c); wrap.add(obj); anchor.add(wrap)
    reg.push({ obj:wrap, orig:wrap.position.clone(), key, space:'anchor', sx, reveal:true }) }
  const deckParent = find('Object_4').parent
  const pivot = new THREE.Group(); pivot.name = 'Display_Hinge_Pivot'; pivot.position.set(...C.HINGE_RAW); deckParent.add(pivot); pivot.updateMatrixWorld(true)
  for (const [n, p] of Object.entries(C.LAPTOP_PARTS)) { const o = find(n); if (!o) { console.error('Missing laptop mesh', n); continue }
    if (n === 'Object_8' || n === 'Object_9' || n === 'Object_10') continue   // keys are split into individual keycaps below
    o.name = p.alias; if (p.alias === 'LCD_Panel' && atlas) { const m = o.material; m.metalness = 0.05; m.roughness = 0.3; m.emissiveMap = atlas.tex; m.emissive.set('#ffffff'); m.emissiveIntensity = 0; m.needsUpdate = true }
    if (p.lid) pivot.attach(o); reg.push({ obj:o, orig:o.position.clone(), key:p.key, space:'raw', sx:1 }) }
  // individual keycaps: split connected pieces of the three key meshes
  const keycaps = new THREE.Group(); keycaps.name = 'Keycaps'; deckParent.add(keycaps)
  const pieces = ['Object_8','Object_9','Object_10'].flatMap((n, i) => { const m = find(n); const p = splitMesh(m, 'Keycap_' + 'ABC'[i]); m.parent.remove(m); return p })
  const bb = new THREE.Box3(); pieces.forEach(p => bb.expandByObject(p)); const rx = bb.max.x - bb.min.x
  pieces.forEach((m, i) => { keycaps.add(m); const c = m.geometry.boundingBox.getCenter(new THREE.Vector3()); const h = (Math.sin(i*12.9898)*43758.5453) % 1
    reg.push({ obj:m, orig:m.position.clone(), key:'keycaps', space:'raw', sx:1, delay:Math.min(1, Math.max(0, (c.x - bb.min.x)/rx))*0.8 + 0.2*Math.abs(h), mult:0.85 + 0.3*Math.abs(h) }) })
  const pr = buildProcedural()
  const lidAdd = (g, key, sx = 1) => { pivot.add(g); reg.push({ obj:g, orig:g.position.clone(), key, space:'raw', sx }) }
  lidAdd(pr.backlight, 'backlight'); lidAdd(pr.hingeL, 'hinge', -1); lidAdd(pr.hingeR, 'hinge', 1)
  const Y = -2.42
  const board = fitGLB(G.board.scene, 'Motherboard', { w:3.9, d:2.7, h:0.14 }); board.position.set(0.35, Y, 1.5); add(board, 'board')
  const ssd = fitGLB(G.ssd.scene, 'SSD_Module', { w:1.7, d:0.7, h:0.06 }); ssd.position.set(-1.5, Y+0.16, 2.6); add(ssd, 'ssd')
  const fl = buildFan('Cooling_Fan_Left'); fl.position.set(-2.5, Y+0.04, 1.0); add(fl, 'fans', -1)
  const fr = buildFan('Cooling_Fan_Right'); fr.position.set(2.5, Y+0.04, 1.0); add(fr, 'fans', 1); rotors.push(fl.userData.rotor, fr.userData.rotor)
  const ports = buildPorts(); add(ports.usb, 'ports', -1); add(ports.audio, 'ports', -1); add(ports.hdmi, 'ports', 1)
  add(buildKeyboardFrame(), 'kbframe')
  const [cpuG, gpuG] = pr.chips.children.slice(); pr.chips.remove(cpuG, gpuG); add(cpuG, 'cpu'); add(gpuG, 'gpu'); add(pr.ram, 'ram'); add(pr.pipes, 'pipes'); add(pr.battery, 'battery'); add(pr.speakerL, 'speakers', -1); add(pr.speakerR, 'speakers', 1)
  add(pr.frame, 'frame'); add(pr.bottomCover, 'cover'); add(pr.trackpad, 'keys')
  anchor.traverse(o => { if (o.name) byName[o.name] = o })
  const missing = REPORT_ITEMS.filter(([, n]) => !byName[n]).map(r => r[1]); if (missing.length) console.error('LUMINA missing required components:', missing)
  // every explodable key owns its materials so a component can be glowed / dimmed without touching others
  const keyMats = new Map()
  for (const e of reg) { let km = keyMats.get(e.key); if (!km) keyMats.set(e.key, km = new Map())
    e.obj.traverse(m => { if (!m.isMesh || !m.material) return; let nm = km.get(m.material)
      if (!nm) { nm = m.material.clone(); nm.userData.base = nm.color ? nm.color.clone() : null; nm.userData.em = nm.emissive ? nm.emissive.clone() : null; km.set(m.material, nm) }
      m.material = nm }) }
  const focus = {}; STORY.forEach(st => Object.entries(st.focus).forEach(([k, v]) => (focus[k] ||= []).push({ i:st.index, v, zoom:st.zoom || 1 })))
  const pack = buildPackaging(); pack.root.traverse(o => { if (o.name) byName[o.name] = o })
  return { reg, pivot, anchor, pack, atlas, byName, missing, rotors, keycapCount: pieces.length, keyMats, focus, dimOn:false }
}

const _v = new THREE.Vector3(), _g = new THREE.Color('#8DBED2'), _vi = new THREE.Color('#A9A9DC'), _t = new THREE.Color(), _c2 = new THREE.Color()
/** Single writer of laptop part transforms from the shared animation state S (explode + story focus + highlight). */
export function applyPose(rig, S, t) {
  const c = 1 - S.lap.open/90
  rig.pivot.rotation.x = Math.PI/2*c; rig.pivot.position.set(C.HINGE_RAW[0], C.HINGE_RAW[1], C.HINGE_RAW[2] + C.HINGE_LIFT*Math.max(c,0))
  for (const p of rig.reg) { const d = C.EXPLODE[p.key], e = S.ex[p.key]
    const a = p.delay === undefined ? e : Math.min(1, Math.max(0, (e - 0.5*p.delay)/(1 - 0.5*p.delay)))
    let x = d[0]*a*(p.mult||1), y = d[1]*a*(p.mult||1), z = d[2]*a*(p.mult||1), sw = 0, zm = 1
    const fl = rig.focus[p.key]; if (fl) for (const f of fl) { const w = S.hi[f.i]; if (w > 0.0005) { x += f.v[0]*w; y += f.v[1]*w; z += f.v[2]*w; sw = Math.max(sw, w); zm = Math.max(zm, 1 + (f.zoom - 1)*w) } }
    if (p.space === 'raw') _v.set(x, -z, y); else _v.set(x, y, z)
    _v.x *= p.sx; p.obj.position.copy(p.orig).add(_v)
    if (p.reveal) { const w = ss(0, 0.25, e)*zm       // introduced part grows and sways gently in front of the others
      p.obj.scale.setScalar(Math.max(0.001, w)); p.obj.rotation.y = sw*Math.sin(t*0.8 + p.orig.x)*0.5 } }
  const spin = t*(S.ex.fans*1.0 + 3*S.hi[3]); rig.rotors.forEach((r, i) => { r.rotation.y = spin*(i ? -1 : 1) })
  applyHighlight(rig, S)
}
export function applyHighlight(rig, S) {
  let any = 0; for (const h of S.hi) any = Math.max(any, h)
  const trans = any > 0.02; if (trans !== rig.dimOn) { rig.dimOn = trans; rig.keyMats.forEach(km => km.forEach(m => { m.transparent = trans; m.needsUpdate = true })) }
  rig.keyMats.forEach((km, key) => { let w = 0, vi = 0; STORY.forEach(st => { if (st.parts.includes(key)) { w += S.hi[st.index]; if (st.index % 2) vi += S.hi[st.index] } }); w = Math.min(1, w)
    const dim = any*(1 - w); _t.copy(_g).lerp(_vi, w ? Math.min(1, vi/w) : 0)
    km.forEach(m => { if (m.userData.base) m.color.copy(m.userData.base).multiplyScalar(1 - 0.18*dim)
      m.opacity = 1 - 0.58*dim                                         // everything else steps back, the introduced part stays solid
      if (m.userData.em) m.emissive.copy(m.userData.em).add(_c2.copy(_t).multiplyScalar(0.38*w)) }) })
}

/** Real visibility verification: geometry, material, ancestor visibility, world bounds, frustum. */
export function verify(obj, camera) {
  if (!obj) return { ok:false, reason:'node missing' }
  obj.updateWorldMatrix(true, true); let meshes = 0, verts = 0; const bad = []
  obj.traverse(o => { if (!o.isMesh) return; meshes++; verts += o.geometry?.attributes?.position?.count || 0
    const ms = [].concat(o.material || []); if (!ms.length || ms.some(m => !m || m.visible === false || m.opacity < 0.05 || (m.transparent && m.opacity <= 0))) bad.push(o.name) })
  let vis = true; for (let p = obj; p; p = p.parent) if (p.visible === false) vis = false
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3())
  const finite = [size.x, size.y, size.z].every(Number.isFinite) && Math.max(size.x, size.y, size.z) > 1e-3
  camera.updateMatrixWorld(); const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))
  const inFrustum = finite && fr.intersectsBox(box)
  const reason = !meshes ? 'no Mesh geometry' : !verts ? 'zero vertices' : bad.length ? 'invalid/transparent material: ' + bad[0] : !vis ? 'hidden (visible=false)' : !finite ? 'zero-size bounds' : !inFrustum ? 'outside camera frustum' : ''
  return { ok:!reason, reason, meshes, verts, size:[size.x, size.y, size.z].map(n => +(n/1).toFixed(2)), inFrustum }
}
