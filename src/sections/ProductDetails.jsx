const goto = (p) => window.__luminaGoTo?.(p)
export default function ProductDetails() {
  return (<><section id="details" className="details"><h2>Designed as a system.</h2>
    <div className="cols">
      <article><h3>Product</h3><p>A slim aluminium laptop revealed through a fully 3D, scroll-controlled unboxing.</p></article>
      <article><h3>Design</h3><p>Separate lid, display layers, keyboard, chassis and internals — every part is its own object.</p></article>
      <article><h3>Performance</h3><p>Specifications will be published at launch. LUMINA makes no benchmark claims.</p></article>
    </div></section>
    <footer className="foot"><div className="links">{[['Product',0.09],['Design',0.345],['Performance',0.84],['Specifications',0.84],['About',0]].map(([l,p]) => <button key={l} onClick={() => goto(p)}>{l}</button>)}</div>
      <small>© 2026 LUMINA. Concept experience; internal components are generic illustrative models.</small></footer></>)
}
