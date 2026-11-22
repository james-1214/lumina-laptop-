import { NAV } from '../config/sceneTimeline'
export default function Navbar({ goTo }) {
  return (<nav className="nav"><button className="logo" onClick={() => goTo(0)} aria-label="LUMINA home"><span className="orb"/>LUMINA</button>
    <div className="links">{NAV.map(n => <button key={n.label} onClick={() => goTo(n.p)}>{n.label}</button>)}</div></nav>)
}
