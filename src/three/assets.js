import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness:0.85, metalness:0, ...o })
export const M = {
  card: mat('#F7F9FD', { roughness:0.72 }), cardIn: mat('#E4EBF6'), foam: mat('#46506A', { roughness:1 }), foamDark: mat('#2a2e36', { roughness:1 }),
  silver: mat('#CDD5E2', { metalness:0.9, roughness:0.28 }), graphite: mat('#22262e', { roughness:0.5, metalness:0.3 }),
  alu: mat('#b9bfc9', { metalness:0.85, roughness:0.35 }), copper: mat('#c8743a', { metalness:1, roughness:0.28 }),
  pcbGreen: mat('#2f6b45', { roughness:0.6 }), chip: mat('#14171c', { roughness:0.45 }), gold: mat('#d4af37', { metalness:1, roughness:0.3 }),
  cell: mat('#2d3340', { roughness:0.55, metalness:0.2 }), backlight: mat('#E9EFF8', { emissive:'#C9D6F2', emissiveIntensity:0.5 }),
  pad: mat('#d6dbe3', { metalness:0.6, roughness:0.3 }), paper: mat('#F4F6FC', { roughness:0.95 }),
}
const rb = (name, w, h, d, m, x, y, z, r = 0.015) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w/2-1e-3, h/2-1e-3, d/2-1e-3)), m); o.name = name; o.position.set(x, y, z); return o }
const grp = (name, ...kids) => { const g = new THREE.Group(); g.name = name; kids.forEach(k => g.add(k)); return g }

function logoTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d')
  x.fillStyle = '#F7F9FD'; x.fillRect(0,0,1024,512)
  const g = x.createRadialGradient(512,170,0,512,170,46); g.addColorStop(0,'#718BCB'); g.addColorStop(1,'rgba(169,169,220,0)'); x.fillStyle = g; x.fillRect(440,100,144,144)
  x.font = '600 96px Inter, system-ui, sans-serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,1)'
  x.shadowColor = 'rgba(92,118,184,.45)'; x.shadowOffsetX = -2; x.shadowOffsetY = -2; x.shadowBlur = 2; x.fillText('L U M I N A', 512, 360)
  x.shadowColor = 'rgba(255,255,255,1)'; x.shadowOffsetX = 2; x.shadowOffsetY = 2; x.fillText('L U M I N A', 512, 360)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
}

/** Packaging (scene units, Y-up, floor at y=0). Everything is real thick geometry. */
export const BOX = { W:4.4, D:2.6, H:0.8, WALL:0.1, FLOOR:0.06, TRAY_TOP:0.14, POCKET_X:-0.45 }
export function buildPackaging() {
  const { W, D, H, WALL, FLOOR } = BOX
  const base = grp('Box_Base',
    rb('Box_Base_Floor', W, FLOOR, D, M.card, 0, FLOOR/2, 0),
    rb('Box_Wall_Front', W, H-FLOOR, WALL, M.card, 0, (H+FLOOR)/2, D/2-WALL/2),
    rb('Box_Wall_Back', W, H-FLOOR, WALL, M.card, 0, (H+FLOOR)/2, -D/2+WALL/2),
    rb('Box_Wall_Left', WALL, H-FLOOR, D-2*WALL, M.card, -W/2+WALL/2, (H+FLOOR)/2, 0),
    rb('Box_Wall_Right', WALL, H-FLOOR, D-2*WALL, M.card, W/2-WALL/2, (H+FLOOR)/2, 0),
    rb('Box_Silver_Trim', W+0.004, 0.012, D+0.004, M.silver, 0, 0.2, 0, 0.005))
  const iw = W-2*WALL, id = D-2*WALL, y0 = FLOOR, t = BOX.TRAY_TOP, ft = 0.40
  const tray = grp('Inner_Tray',
    rb('Tray_Floor', iw, t-y0, id, M.foam, 0, (y0+t)/2, 0, 0.01),
    rb('Tray_Border_Back', iw, ft-t, 0.2, M.foam, 0, (t+ft)/2, -id/2+0.1, 0.01),
    rb('Tray_Border_Front', iw, ft-t, 0.2, M.foam, 0, (t+ft)/2, id/2-0.1, 0.01),
    rb('Tray_Border_Left', 0.15, ft-t, id, M.foam, -iw/2+0.075, (t+ft)/2, 0, 0.01),
    rb('Tray_Divider', 0.2, ft-t, id-0.4, M.foam, 1.1, (t+ft)/2, 0, 0.01),
    rb('Tray_Border_Right', 0.15, ft-t, id, M.foam, iw/2-0.075, (t+ft)/2, 0, 0.01))
  const corners = grp('Foam_Corner_Protectors')
  ;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz],i) => corners.add(rb(`Foam_Corner_${i+1}`, 0.5, 0.3, 0.2, M.foam, sx*(iw/2-0.25), 0.5, sz*(id/2-0.1), 0.02)))
  tray.add(corners)
  const acc = grp('Accessory_Compartment', rb('Charger_Brick', 0.5, 0.18, 0.5, M.paper, 1.55, t+0.09, -0.4, 0.03),
    (() => { const c = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 12, 32), mat('#e9edf5')); c.name = 'Cable_Coil'; c.rotation.x = Math.PI/2; c.position.set(1.55, t+0.06, 0.45); return c })())
  tray.add(acc)
  const sleeve = grp('Protective_Sleeve', rb('Sleeve_Sheet', 3.1, 0.012, 2.05, M.paper, 0, 0, 0, 0.004), rb('Sleeve_Tab', 0.5, 0.012, 0.25, M.silver, 0, 0, 1.15, 0.004))
  sleeve.position.set(BOX.POCKET_X, 0.45, 0)
  // lid: pivot at the REAR top edge. Local +z runs from the rear hinge toward the front.
  const LW = W+0.15, LD = D+0.15, lid = new THREE.Group(); lid.name = 'Box_Lid_Pivot'; lid.position.set(0, H+0.06, -LD/2+0.075 - 0.0)
  const lidMesh = grp('Box_Lid', rb('Lid_Top', LW, 0.06, LD, M.card, 0, -0.03, LD/2), rb('Lid_Skirt_Front', LW, 0.32, 0.05, M.card, 0, -0.22, LD-0.025),
    rb('Lid_Skirt_Back', LW, 0.32, 0.05, M.card, 0, -0.22, 0.025), rb('Lid_Skirt_Left', 0.05, 0.32, LD, M.card, -LW/2+0.025, -0.22, LD/2), rb('Lid_Skirt_Right', 0.05, 0.32, LD, M.card, LW/2-0.025, -0.22, LD/2),
    rb('Lid_Silver_Line', LW-0.4, 0.004, 0.012, M.silver, 0, 0.002, LD-0.3, 0.001))
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ map: logoTexture(), roughness:0.9, transparent:false }))
  logo.name = 'LUMINA_Logo'; logo.rotation.x = -Math.PI/2; logo.position.set(0, 0.0015, LD/2); lidMesh.add(logo)
  // inner face of the lid reads as a clean white surface
  lidMesh.add(rb('Lid_Inner_Liner', LW-0.1, 0.01, LD-0.1, M.cardIn, 0, -0.065, LD/2, 0.003))
  lid.add(lidMesh)
  const root = grp('Packaging', base, tray, sleeve, lid)
  const mats = new Set(); root.traverse(o => { if (o.isMesh) mats.add(o.material) })
  return { root, base, tray, sleeve, lid, mats, LD }
}

/** Fit a loaded GLB into a footprint (w x d), cap thickness h, bottom-centred on the group origin. */
export function fitGLB(scene, name, { w, d, h, rx = 0, ry = 0 }) {
  const src = scene.clone(true); src.traverse(o => { if (o.isMesh && o.material) o.material = o.material.clone() })
  const wrap = new THREE.Group(); wrap.rotation.set(rx, ry, 0); wrap.add(src)
  const scaler = new THREE.Group(); scaler.add(wrap)           // scale AFTER rotation so h caps world-space thickness
  const outer = new THREE.Group(); outer.name = name; outer.add(scaler); outer.updateMatrixWorld(true)
  let bx = new THREE.Box3().setFromObject(outer), sz = bx.getSize(new THREE.Vector3())
  const k = Math.min(w / sz.x, d / sz.z), ys = Math.min(k, h / sz.y)
  scaler.scale.set(k, ys, k); outer.updateMatrixWorld(true)
  bx = new THREE.Box3().setFromObject(outer); const c = bx.getCenter(new THREE.Vector3())
  scaler.position.set(-c.x, -bx.min.y, -c.z)
  return outer
}

/** Procedural generic parts (APPROXIMATE). Y-up laptop model units. y ~ -2.45 (bottom) .. -2.22 (under keys). */
export function buildProcedural() {
  const Y = -2.44, out = {}
  out.bottomCover = grp('Bottom_Cover', rb('Bottom_Cover_Plate', 6.9, 0.05, 4.2, M.alu, 0, -2.5, 2.15, 0.02))
  const frame = grp('Internal_Frame', rb('Frame_Plate', 6.5, 0.025, 3.95, M.alu, 0, Y, 2.15, 0.01))
  ;[-3.1, 3.1].forEach((x,i) => frame.add(rb(`Frame_Rib_${i}`, 0.1, 0.1, 3.9, M.alu, x, Y+0.06, 2.15, 0.01)))
  frame.add(rb('Frame_Rib_Mid', 6.4, 0.08, 0.08, M.alu, 0, Y+0.05, 2.9, 0.01)); out.frame = frame
  const bat = grp('Battery_Pack'); [-1.9,-0.65,0.6,1.85].forEach((x,i) => bat.add(rb(`Battery_Cell_${i+1}`, 1.18, 0.14, 0.95, M.cell, x, Y+0.09, 3.55, 0.02)))
  bat.add(rb('Battery_Connector', 0.4, 0.05, 0.2, M.gold, 2.6, Y+0.05, 3.1, 0.01)); out.battery = bat
  const spk = (side) => { const s = side === 'L' ? -1 : 1; return grp(`Speaker_${side}`, rb(`Speaker_${side}_Enclosure`, 0.7, 0.14, 1.05, M.graphite, s*3.0, Y+0.09, 3.55, 0.03),
    rb(`Speaker_${side}_Grille`, 0.5, 0.015, 0.8, M.alu, s*3.0, Y+0.17, 3.55, 0.005)) }
  out.speakerL = spk('L'); out.speakerR = spk('R')
  const ram = (i, z) => grp(`RAM_Module_${i}`, rb(`RAM_PCB_${i}`, 1.4, 0.03, 0.4, M.pcbGreen, 1.5, Y+0.1, z, 0.005),
    ...[0,1,2,3].map(c => rb(`RAM_Chip_${i}_${c}`, 0.22, 0.04, 0.22, M.chip, 1.05+c*0.28, Y+0.13, z, 0.01)), rb(`RAM_Contacts_${i}`, 1.1, 0.012, 0.04, M.gold, 1.5, Y+0.1, z+0.2, 0.002))
  out.ram = grp('RAM_Modules', ram(1, 2.35), ram(2, 2.85))
  const cpu = grp('Processor', rb('CPU_Substrate', 0.62, 0.035, 0.62, M.pcbGreen, -0.2, Y+0.12, 1.45, 0.01), rb('CPU_Heatspreader', 0.46, 0.04, 0.46, M.silver, -0.2, Y+0.16, 1.45, 0.01))
  const gpu = grp('Graphics_Module', rb('GPU_Substrate', 0.7, 0.035, 0.7, M.pcbGreen, 0.8, Y+0.12, 1.45, 0.01), rb('GPU_Die', 0.4, 0.04, 0.4, M.chip, 0.8, Y+0.16, 1.45, 0.01))
  out.chips = grp('Processor_And_Graphics', cpu, gpu)
  const pipe = (name, pts) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 24, 0.045, 10), M.copper); m.name = name; return m }
  out.pipes = grp('Heat_Pipes', pipe('Heat_Pipe_Left', [[-0.2,Y+0.13,1.45],[-1.0,Y+0.13,1.1],[-1.8,Y+0.13,1.0]]), pipe('Heat_Pipe_Right', [[0.8,Y+0.13,1.45],[1.5,Y+0.13,1.1],[2.2,Y+0.13,1.0]]),
    pipe('Heat_Pipe_Left_2', [[-0.2,Y+0.13,1.6],[-1.0,Y+0.13,1.3],[-1.8,Y+0.13,1.2]]), pipe('Heat_Pipe_Right_2', [[0.8,Y+0.13,1.6],[1.5,Y+0.13,1.3],[2.2,Y+0.13,1.2]]))
  out.trackpad = grp('Trackpad', rb('Trackpad_Surface', 2.6, 0.03, 1.55, M.pad, 0, -2.175, 3.45, 0.04))
  out.hingeL = grp('Left_Hinge'); out.hingeR = grp('Right_Hinge')
  ;[[out.hingeL,-1],[out.hingeR,1]].forEach(([g,s]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.55,20), M.alu); c.rotation.z = Math.PI/2; c.position.set(s*3.0,0,0); c.name = g.name+'_Barrel'; g.add(c) })
  out.backlight = grp('Backlight_Layer', rb('Backlight_Panel', 6.3, 0.03, 3.9, M.backlight, 0, 0.03, 2.0, 0.01))
  return out
}

/* ---------- additional procedural components (APPROXIMATE generic geometry) ---------- */
M.fan = mat('#2b303a', { metalness:0.65, roughness:0.4 }); M.blade = mat('#3a4150', { metalness:0.7, roughness:0.35 }); M.port = mat('#aeb4bf', { metalness:0.9, roughness:0.3 }); M.black = mat('#0c0e12', { roughness:0.6 })
export function buildFan(name) {
  const g = grp(name); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.03, 40), M.fan); base.name = name+'_Plate'; g.add(base)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.055, 12, 48), M.fan); ring.name = name+'_Housing'; ring.rotation.x = Math.PI/2; ring.position.y = 0.06; g.add(ring)
  const rotor = new THREE.Group(); rotor.name = name+'_Rotor'; rotor.position.y = 0.06; g.add(rotor)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 28), M.alu); hub.name = name+'_Hub'; rotor.add(hub)
  for (let i = 0; i < 11; i++) { const a = i/11*Math.PI*2, bl = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.016), M.blade); bl.name = `${name}_Blade_${i+1}`
    bl.position.set(Math.cos(a)*0.42, 0, Math.sin(a)*0.42); bl.rotation.set(0.0, -a, 0.28); rotor.add(bl) }
  g.userData.rotor = rotor; return g
}
export function buildPorts() {
  const Y = -2.34, port = (name, w, h, d, x, z, kind) => { const g = grp(name, rb(name+'_Housing', w, h, d, M.port, x, Y, z, 0.02))
    const s = Math.sign(x) || 1, ix = x - s*(w/2 - 0.012)
    if (kind === 'usb') { g.add(rb(name+'_Slot', 0.05, 0.05, 0.2, M.black, ix, Y, z, 0.01), rb(name+'_Tongue', 0.04, 0.012, 0.16, M.gold, ix + s*0.03, Y, z, 0.002)) }
    if (kind === 'hdmi') { g.add(rb(name+'_Slot', 0.05, 0.05, 0.4, M.black, ix, Y, z, 0.01), rb(name+'_Pins', 0.04, 0.012, 0.34, M.gold, ix + s*0.03, Y, z, 0.002)) }
    if (kind === 'audio') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), M.black); c.rotation.z = Math.PI/2; c.position.set(ix, Y, z); c.name = name+'_Jack'; g.add(c) }
    return g }
  return { usb: port('USB_Port_Assembly', 0.5, 0.14, 0.34, -3.15, 2.05, 'usb'), hdmi: port('HDMI_Port_Assembly', 0.55, 0.13, 0.5, 3.15, 2.2, 'hdmi'), audio: port('Audio_Port_Assembly', 0.4, 0.14, 0.2, -3.15, 2.8, 'audio') }
}
export function buildKeyboardFrame() {
  const y = -2.265, g = grp('Keyboard_Frame', rb('Keyboard_Frame_Plate', 6.3, 0.02, 2.4, M.alu, 0, y, 1.35, 0.01))
  ;[[6.3,0.05,0.07,0,1.0-0.0+0.55],[6.3,0.05,0.07,0,0.2]].forEach(([w,h,d,x,z],i) => g.add(rb(`Keyboard_Frame_Bar_${i}`, w, h, d, M.graphite, x, y+0.03, z, 0.01)))
  ;[-3.15, 3.15].forEach((x,i) => g.add(rb(`Keyboard_Frame_Side_${i}`, 0.07, 0.05, 2.4, M.graphite, x, y+0.03, 1.35, 0.01))); return g
}
