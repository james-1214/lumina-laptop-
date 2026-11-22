// Native units of mac_book_pro.glb (glTF Y-up, lid authored ~90 degrees open, hinge at back edge z~0).
export const LAPTOP_SCALE = 0.405
export const LAPTOP_ANCHOR = [0, 2.457, -2.15]   // footprint centred on origin, base bottom at y=0
export const HINGE_RAW = [0, -0.05, -2.3]        // hinge axis in the raw frame
export const HINGE_LIFT = 0.33
export const OPEN_DEG = 110
export const HOVER_Y = 2.55

// verified from bounds/UVs: Object_4 deck, 5 side strip, 8/9/10 keys, 2 lid shell, 3 panel, 7 bezel, 6 webcam
export const LAPTOP_PARTS = {
  Object_4:{ key:'keys', lid:false, alias:'Top_Case' }, Object_5:{ key:'keys', alias:'Top_Case_Strip' },
  Object_8:{ key:'keys', alias:'Keys_A' }, Object_9:{ key:'keys', alias:'Keys_B' }, Object_10:{ key:'keys', alias:'Keys_C' },
  Object_2:{ key:'shell', lid:true, alias:'Display_Housing' }, Object_3:{ key:'panel', lid:true, alias:'LCD_Panel' },
  Object_7:{ key:'glass', lid:true, alias:'Display_Glass' }, Object_6:{ key:'glass', lid:true, alias:'Webcam' },
}
// Offsets in rest-pose world axes (x right, y up, z toward viewer), model units. Each channel animates independently.
export const EXPLODE = {
  glass:[0,1.5,0], panel:[0,0.6,-1.3], backlight:[0,0.2,-2.5], shell:[0,0,-3.7], hinge:[1.7,0.2,-1.2],
  keycaps:[0,3.9,1.0], keys:[0,3.4,0.9], kbframe:[0,2.7,0.6], pipes:[0,2.2,0], fans:[2.0,1.7,0], cpu:[-0.8,1.3,0], gpu:[0.8,1.3,0], ram:[1.2,1.0,0.6], ssd:[-1.5,1.0,0.5],
  board:[0,0.3,0], ports:[1.8,0.3,0.5], speakers:[1.4,-0.35,0.3], battery:[0,-1.3,0.9], frame:[0,-0.6,0], cover:[0,-2.8,0],
}
export const EXPLODE_ORDER = Object.keys(EXPLODE)
export const LABELS = [
  { text:'Display assembly', obj:'Display_Glass', key:'glass', side:'r', dy:-46, story:8 }, { text:'Keyboard', obj:'Top_Case', key:'keys', side:'l', dy:-30, story:9 },
  { text:'Cooling system', obj:'Cooling_Fan_Left', key:'fans', side:'l', story:3 }, { text:'Processor', obj:'Processor', key:'cpu', side:'r', dy:10, story:1 },
  { text:'Motherboard', obj:'Motherboard', key:'board', side:'l', dy:24, story:0 }, { text:'Speakers', obj:'Speaker_R', key:'speakers', side:'r', dy:30, story:7 },
  { text:'Battery', obj:'Battery_Pack', key:'battery', side:'l', story:4 }, { text:'Chassis', obj:'Bottom_Cover', key:'cover', side:'r', story:10 },
]
export const MANIFEST = [
  ['Top_Case / Keys / Webcam / Display_Housing / LCD_Panel / Display_Glass','mac_book_pro.glb','REAL (supplied, mesh split by verified bounds)'],
  ['Motherboard','motherboard__1_.glb','REAL (supplied, scaled to chassis)'],['SSD_Module','m-2-2280-ssd-nvme-m-key.glb','REAL (supplied, scaled)'],
  ['Cooling_Fan_Left / Right','cpu-cooler.glb','REAL model, approximate fit (CPU cooler used as laptop blower)'],
  ['Packaging (base, walls, lid, tray, sleeve, foam corners, accessory, logo)','procedural','NEW, approximate'],
  ['Battery, RAM, Processor, Graphics, Heat pipes, Speakers, Trackpad, Hinges, Backlight, Internal frame, Bottom cover','procedural','NEW, approximate generic geometry'],
]
