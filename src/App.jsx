import Loader from './components/Loader'
import CinematicExperience from './sections/CinematicExperience'
import ProductDetails from './sections/ProductDetails'
import DebugComponents from './sections/DebugComponents'
export default function App() {
  if (location.pathname.replace(/\/$/, '') === '/debug-components') return <DebugComponents />
  return (<><Loader/><CinematicExperience/><ProductDetails/></>)
}
