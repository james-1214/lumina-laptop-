# LUMINA component manifest (verified at /debug-components: 27/27 VISIBLE, 0 console errors)
REAL, from supplied mac_book_pro.glb: Display_Housing, LCD_Panel, Display_Glass (bezel), Webcam, Palm_Rest/Top_Case (deck),
  262 individual keycaps (the 3 merged key meshes are split into connected pieces at load), side port-detail strip.
REAL, supplied + scaled: Motherboard (motherboard__1_.glb), SSD_Module (m-2-2280 ssd). cpu-cooler.glb is no longer used.
NEW procedural geometry (APPROXIMATE, generic): bladed Cooling_Fan_Left/Right (housing, hub, 11 blades), Heat_Pipes (copper tubes), Processor, Graphics_Module,
  RAM_Modules (2 sticks, chips, contacts), Battery_Pack (4 cells), Speaker_L/R, Trackpad, Keyboard_Frame, Backlight_Layer, Left/Right_Hinge,
  USB/HDMI/Audio_Port_Assembly (housings+contacts), Internal_Frame, Bottom_Cover, and all packaging.
NOT DONE / CAVEATS: Display_Glass is the supplied black bezel mesh (no separate translucent glass sheet). Trackpad is a raised plate, not recessed.
  Port assemblies are generic parts inside the chassis; the supplied deck has no matching cut-outs. Heat-pipe/fan placement is plausible, not manufacturing-accurate.
Debug: /debug-components (report, isolate any part, contrast colours, assemble/explode). /?debug shows boxes+HUD in the main scene. /?nosmooth removes scrub lag.

## Story + 360 upgrade (this release)
Scroll map (track 2800vh, one GSAP timeline): 0-.19 box/unboxing/reveal/display | .19-.27 build-out (21 channels, staggered) | .27-.80 eleven one-at-a-time component stories
| .80-.90 free 360 degree overview (scroll yaw -2*PI exactly) | .90-.96 reassembly | .96-1 hero.
Files: config/ComponentMetadata.js (copy, parts, focus offsets, targets), three/ExplodedAssembly.jsx (single parent group), three/ComponentHighlight.jsx,
three/RotationController.jsx (drag/touch/auto/reset; additive offset to scroll yaw), components/ComponentStoryPanel.jsx, components/ComponentConnector.jsx.
Specs shown only where real: SSD = M.2 2280, M-key (NVMe). Everything else says "illustrative / to be announced". No invented hardware numbers.
Tested headless (software GL): 11 stories -> exactly 1 panel, sides alternate L/R, active highlight index correct, connector active; yaw -5.74 -> -8.92 -> -12.06 across .80/.85/.90;
mouse drag changes yaw/pitch; reassembly returns all 289 parts to offset 0.0000; scrolling up reverses; 0 page errors.
NOT tested: real touch hardware (code uses pointer events + touch-action:pan-y), fps, mobile layout visually, WebGL context loss.

## Soft futuristic theme
Tokens in src/styles/variables.css (bg #E9EFF8, bg2 #F4F6FC, section #DCE8F7, card #F7F9FD, text #24344F, muted #64748B, blue #718BCB, cyan #8DBED2, violet #A9A9DC, border #CFD9E8).
Layered stage gradients + cyan radial behind the laptop; blue key / violet rim / cyan accent lights; palette-matched outline, connector, packaging and screen wallpaper.
Animation logic, models, story sequence and 360 interaction are unchanged. Visually checked: hero box, story panel, final hero (headless). Not re-checked after retheme: unboxing mid-frames, overview, mobile.

## v2 (colour, typography, smoothness, introductions)
Scroll map: .19-.31 staggered exploded build-out + hold (full exploded view shown) | .34-.82 eleven part introductions | .82-.91 free 360 | .91-.965 reassembly | .965-1 hero.
Introduction = active part comes forward, scales (per-part zoom), sways, camera dollies toward it (distance ~11 -> 5.4 for the processor), others fade back to ~42% opacity.
Smoothness work: removed all backdrop-filter blur over the canvas, screen texture repaint 15Hz -> 6Hz (only on change), DPR cap 1.5, contact shadow 256px, dt-based camera damping, scrub 0.8.
Colour: layered gradients + vignette, ghost box removed after the unboxing. Panels: editorial layout (ghost numeral, rule, accent bullets).
Verified (headless): 0 page errors, reassembly offset 0.0000, camera dolly numbers. NOT verified: real fps, touch hardware.
