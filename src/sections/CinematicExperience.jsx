import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene, { reducedMotion } from '../three/Scene'
import { buildMasterTimeline } from '../animations/masterTimeline'
import { chapterAt, CHAPTERS } from '../config/sceneTimeline'
import Navbar from '../components/Navbar'
import ScrollProgress from '../components/ScrollProgress'
import ChapterLabel from '../components/ChapterLabel'
import SceneText from '../components/SceneText'
import ComponentStoryPanel from '../components/ComponentStoryPanel'
import ComponentConnector from '../components/ComponentConnector'
import RotationController from '../three/RotationController'
import { storyIndexAt } from '../config/ComponentMetadata'

export default function CinematicExperience() {
  const track = useRef(), bar = useRef(), stage = useRef(); const [ch, setCh] = useState(0), [story, setStory] = useState(-1), [auto, setAuto] = useState(false), [labels, setLabels] = useState(true); const cur = useRef(0), curStory = useRef(-1), canvasRef = useRef()
  const goTo = useCallback((p) => { const el = track.current; const top = el.offsetTop + p*(el.offsetHeight - window.innerHeight)
    window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' }) }, [])
  useEffect(() => { window.__luminaGoTo = goTo
    const tl = buildMasterTimeline(track.current, { reduced: reducedMotion(), onProgress: p => {
      bar.current.style.transform = `scaleX(${p})`
      stage.current.style.setProperty('--p', p)
      const i = chapterAt(p); if (i !== cur.current) { cur.current = i; setCh(i) }
      const si = storyIndexAt(p); if (si !== curStory.current) { curStory.current = si; setStory(si) } } })
    return () => { tl.scrollTrigger?.kill(); tl.kill(); ScrollTrigger.clearScrollMemory?.() } }, [goTo])
  return (<section ref={track} className="track" id="experience"><div ref={stage} className="stage">
    <div className="bg"/><div ref={canvasRef} className="canvas"><Scene/></div><ComponentConnector/>
    <Navbar goTo={goTo}/><ScrollProgress ref={bar}/><SceneText index={ch} goTo={goTo}/><ComponentStoryPanel index={story}/>
    <RotationController target={canvasRef} visible={['build','story','overview'].includes(CHAPTERS[ch].id)} auto={auto} onAuto={setAuto} labels={labels} onLabels={setLabels}/><ChapterLabel index={ch} goTo={goTo}/></div></section>)
}
