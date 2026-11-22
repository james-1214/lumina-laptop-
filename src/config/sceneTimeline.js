export const CHAPTERS = [
  { id:'box', range:[0,0.0362], label:'01 · The Box', title:'LUMINA', lead:'Something extraordinary is inside.', sub:'An experience engineered beyond expectations.' },
  { id:'open', range:[0.0362,0.0754], label:'02 · Unboxing', title:'First impressions matter.' },
  { id:'reveal', range:[0.0754,0.16], label:'03 · The Reveal', title:'Meet the next dimension.' },
  { id:'display', range:[0.16,0.19], label:'04 · Display', title:'Precision in every detail.' },
  { id:'build', range:[0.19,0.34], label:'05 · Anatomy', title:'Beauty beneath the surface.', sub:'Every component. One intelligent design.' },
  { id:'story', range:[0.34,0.82], label:'06 · Component by component', title:'' },
  { id:'overview', range:[0.82,0.91], label:'07 · Full assembly', title:'Every layer. Every angle.', sub:'Drag to rotate 360°.' },
  { id:'assemble', range:[0.91,0.965], label:'08 · Assembly', title:'Engineered as one.' },
  { id:'final', range:[0.965,1.0001], label:'09 · LUMINA', title:'Everything. Perfectly Engineered.', sub:'Discover the art of intelligent design.', cta:true },
]
export const NAV = [{ label:'Explore', p:0.09 }, { label:'Design', p:0.345 }, { label:'Technology', p:0.84 }]
export const chapterAt = (p) => Math.max(0, CHAPTERS.findIndex(c => p >= c.range[0] && p < c.range[1]))
