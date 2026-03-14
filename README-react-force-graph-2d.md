# react-force-graph-2d

A React component for rendering interactive 2D force-directed graphs on an HTML Canvas, built on top of [force-graph](https://github.com/vasturiano/force-graph) and [d3-force](https://github.com/d3/d3-force).

> This is a focused fork of [vasturiano/react-force-graph](https://github.com/vasturiano/react-force-graph), trimmed to the 2D variant with an added `useForceGraph2D` hook for cleaner imperative control.

---

## Live examples

> Run `npm run storybook` to open the interactive examples locally on `http://localhost:61000`.

| Example | What it shows |
|---|---|
| [Basic graph][ex-default] | Minimal setup — nodes, links, labels, colors |
| [Auto-colored][ex-auto] | `nodeAutoColorBy` to group nodes by a field |
| [Directional arrows][ex-arrows] | `linkDirectionalArrowLength` / `linkDirectionalArrowRelPos` |
| [Zoom & pan (hook)][ex-zoom] | `useForceGraph2D` — `zoomToFit`, `centerAt`, `zoom` |
| [Pause & resume (hook)][ex-pause] | `pauseAnimation` / `resumeAnimation` |
| [Simulation strength (hook)][ex-sim] | Live-editing D3 charge force via `d3Force` + `d3ReheatSimulation` |
| [Click to focus (hook)][ex-focus] | Smooth camera fly-to on node click |

[ex-default]: https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--basic--default
[ex-auto]:    https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--basic--auto-colored
[ex-arrows]:  https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--basic--directional-arrows
[ex-zoom]:    https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--hook-controls--zoom-and-pan
[ex-pause]:   https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--hook-controls--pause-resume
[ex-sim]:     https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--hook-controls--simulation-strength
[ex-focus]:   https://julia-allyce.github.io/react-force-graph/stories/index.html?story=forcegraph2d--hook-controls--click-to-focus

---

## Installation

```bash
npm install react-force-graph-2d
```

---

## Quick start

```jsx
import ForceGraph2D from 'react-force-graph-2d';

const data = {
  nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
  links: [{ source: 1, target: 2 }, { source: 2, target: 3 }],
};

export default function App() {
  return <ForceGraph2D graphData={data} />;
}
```

---

## `useForceGraph2D` hook

Instead of managing a raw ref yourself, use the hook to get a stable `controls` object with typed wrappers for every imperative method.

```jsx
import ForceGraph2D, { useForceGraph2D } from 'react-force-graph-2d';

export default function App() {
  const { ref, controls } = useForceGraph2D();

  return (
    <ForceGraph2D
      ref={ref}
      graphData={data}
      // Zoom to fit once the simulation has settled:
      onEngineStop={() => controls.zoomToFit(400)}
      // Fly to a node on click:
      onNodeClick={node => {
        controls.centerAt(node.x, node.y, 500);
        controls.zoom(4, 500);
      }}
    />
  );
}
```

All `controls` methods have **stable identities** — they never change between renders, so they are safe to use in `useEffect` and `useCallback` dependency arrays.

### Available controls

| Method | Signature | Description |
|---|---|---|
| `zoomToFit` | `(duration?, padding?, nodeFilter?) => void` | Fit all (or filtered) nodes into view |
| `centerAt` | `(x, y, duration?) => void` | Pan camera to graph coordinates |
| `zoom` | `(scale, duration?) => void` | Set zoom level |
| `zoom` | `() => number` | Get current zoom level |
| `pauseAnimation` | `() => void` | Pause the canvas render loop |
| `resumeAnimation` | `() => void` | Resume the canvas render loop |
| `stopAnimation` | `() => void` | Stop the render loop permanently |
| `d3Force` | `(name) => force` | Get a named D3 force |
| `d3Force` | `(name, force) => void` | Set a named D3 force |
| `d3ReheatSimulation` | `() => void` | Reset alpha to 1 and restart simulation |
| `emitParticle` | `(link) => void` | Emit a one-off particle burst on a link |
| `getGraphBbox` | `(nodeFilter?) => BBox` | Bounding box of all (or filtered) nodes |
| `screen2GraphCoords` | `(x, y) => {x, y}` | Canvas px → graph coordinates |
| `graph2ScreenCoords` | `(x, y) => {x, y}` | Graph coordinates → canvas px |

---

## Node size

Node size is controlled by two props that work together:

```
radius (px) = nodeRelSize × √nodeVal
```

| Prop | Default | Role |
|---|---|---|
| `nodeRelSize` | `4` | Global scale — one "unit" of radius in pixels |
| `nodeVal` | `1` | Per-node weight — proportional to the node's **area**, not radius |

Because the formula uses `√nodeVal`, doubling `nodeVal` increases the radius by ~41% (not 2×) — which makes the visual area proportional to the value, a natural mapping for data.

```jsx
// All nodes at a fixed 10px radius:
<ForceGraph2D nodeRelSize={10} />

// Data-driven sizing — area proportional to connection count:
<ForceGraph2D nodeVal={node => node.links.length} />

// Scale everything up while preserving relative sizes:
<ForceGraph2D nodeRelSize={8} nodeVal={node => node.weight} />
```

---

## D3 force simulation

### Simulation props

These props are reactive — changing them updates the running simulation.

| Prop | Type | Default | Description |
|---|---|---|---|
| `d3AlphaDecay` | `number` | `0.0228` | Cooling rate — lower values run the simulation longer |
| `d3AlphaMin` | `number` | `0` | Alpha threshold at which the engine stops |
| `d3VelocityDecay` | `number` | `0.4` | Friction on node velocity — higher settles faster |
| `warmupTicks` | `number` | `0` | Silent pre-layout ticks before first render |
| `cooldownTicks` | `number` | `Infinity` | Max ticks before the engine auto-stops |
| `cooldownTime` | `number` | `15000` | Max ms before the engine auto-stops |
| `forceEngine` | `'d3' \| 'ngraph'` | `'d3'` | Physics backend |

### Modifying forces at runtime

The simulation registers three named D3 forces by default: `'link'` (forceLink), `'charge'` (forceManyBody), and `'center'` (forceCenter). You can get, replace, tune, or remove any of them via `controls.d3Force`. Call `controls.d3ReheatSimulation()` after any change so the simulation picks it up.

```jsx
// Tune an existing force:
controls.d3Force('charge').strength(-200);
controls.d3Force('link').distance(80).iterations(2);

// Replace a force entirely:
import { forceManyBody } from 'd3-force-3d';
controls.d3Force('charge', forceManyBody().strength(-150).theta(0.9));

// Add a custom collision force:
import { forceCollide } from 'd3-force-3d';
controls.d3Force('collide', forceCollide(node => node.radius ?? 8));

// Remove the centering force:
controls.d3Force('center', null);

// Apply changes:
controls.d3ReheatSimulation();
```

> `d3-force-3d` is already in your dependencies (it's what `force-graph` itself uses), so you can import any of its forces without adding a new package.

---

## Common recipes

### Fit to canvas after layout

```jsx
<ForceGraph2D
  ref={ref}
  graphData={data}
  cooldownTicks={100}
  onEngineStop={() => controls.zoomToFit(400)}
/>
```

### Highlight neighbours on hover

```jsx
const [highlightNodes, setHighlightNodes] = useState(new Set());

<ForceGraph2D
  graphData={data}
  autoPauseRedraw={false}
  nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
  nodeCanvasObject={(node, ctx) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 8 * 1.4, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();
  }}
  onNodeHover={node => {
    setHighlightNodes(new Set(node ? [node, ...node.neighbors] : []));
  }}
/>
```

### Fix nodes in place after dragging

```jsx
<ForceGraph2D
  graphData={data}
  onNodeDragEnd={node => {
    node.fx = node.x;
    node.fy = node.y;
  }}
/>
```

### Run as a continuous animation loop

Set `d3AlphaDecay={0}` and `cooldownTime={Infinity}` to keep the simulation running forever — useful for animated or collision-based graphs.

```jsx
<ForceGraph2D
  graphData={data}
  d3AlphaDecay={0}
  d3VelocityDecay={0}
  cooldownTime={Infinity}
/>
```

---

## Full prop reference

See the [force-graph API reference](https://github.com/vasturiano/force-graph#api-reference) for the complete list of supported props. All props on the underlying `force-graph` component pass through directly.

---

## Development

```bash
npm install
npm run storybook   # interactive examples at http://localhost:61000
npm run build       # build all packages
```
