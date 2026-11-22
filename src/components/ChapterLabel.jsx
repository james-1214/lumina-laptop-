import { CHAPTERS } from '../config/sceneTimeline'
export default function ChapterLabel({ index, goTo }) {
  return (<aside className="chapters" aria-label="Chapters"><span className="cur">{CHAPTERS[index].label}</span>
    <ul>{CHAPTERS.map((c,i) => <li key={c.id}><button className={i===index?'on':''} aria-label={c.label} onClick={() => goTo(c.range[0]+0.002)}/></li>)}</ul></aside>)
}
