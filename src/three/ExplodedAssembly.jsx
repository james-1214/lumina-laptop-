import { forwardRef } from 'react'
import * as C from '../config/laptopTransforms'
import ComponentHighlight from './ComponentHighlight'

/** The single persistent parent group of the exploded laptop. Rotating THIS group rotates every component together (never per-part). */
const ExplodedAssembly = forwardRef(function ExplodedAssembly({ rig }, ref) {
  return (<group ref={ref} name="ExplodedAssembly" scale={C.LAPTOP_SCALE}>
    <primitive object={rig.anchor} />
    <group position={C.LAPTOP_ANCHOR}><ComponentHighlight rig={rig} /></group>
  </group>)
})
export default ExplodedAssembly
