import { useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
export default function Loader() {
  const { progress, active } = useProgress()
  return (<AnimatePresence>{(active || progress < 100) && <motion.div className="loader" exit={{ opacity:0 }} transition={{ duration:.6 }}>
    <div className="orb big"/><p>LUMINA</p><div className="bar"><i style={{ width:`${progress}%` }}/></div></motion.div>}</AnimatePresence>)
}
