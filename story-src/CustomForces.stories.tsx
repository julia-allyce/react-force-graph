/**
 * Custom D3 Forces
 * ----------------
 * The simulation has three built-in named forces you can read, tune, or
 * replace at runtime via the `d3Force` ref method:
 *
 *   'charge'  → forceManyBody()  — repulsion/attraction between every node pair
 *   'link'    → forceLink()      — spring tension along each edge
 *   'center'  → forceCenter()    — soft pull toward the canvas origin
 *
 * The pattern is always:
 *   1. Get the force:    ref.current.d3Force('charge')
 *   2. Tweak it:         .strength(-200)
 *   3. Reheat the sim:   ref.current.d3ReheatSimulation()
 *
 * Without step 3 the simulation has already cooled and won't respond.
 */
import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import type { Story } from '@ladle/react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceCenter } from 'd3-force-3d';
import { genRandomTree, genClusters } from './data';

export default {
  title: 'ForceGraph2D / Custom Forces',
};

// ─── Shared styles ───────────────────────────────────────────────────────────
const panel: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 10,
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  minWidth: 260,
  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
  fontSize: 13,
};

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const label: React.CSSProperties = {
  width: 130,
  flexShrink: 0,
};

const code: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  background: '#f1f5f9',
  borderRadius: 4,
  padding: '2px 6px',
};

// ─── 1. Charge strength ───────────────────────────────────────────────────────
/**
 * `forceManyBody` applies a force between every pair of nodes.
 * Negative strength = repulsion (nodes push apart).
 * Positive strength = attraction (nodes pull together).
 *
 * Default is -30. Try dragging toward 0 to watch the graph collapse,
 * or toward -300 to spread it out dramatically.
 */
export const ChargeStrength: Story = () => {
  const fgRef = useRef<any>();
  const data = useMemo(() => genRandomTree(40), []);
  const [strength, setStrength] = useState(-30);

  const apply = (value: number) => {
    setStrength(value);
    fgRef.current?.d3Force('charge')?.strength(value);
    fgRef.current?.d3ReheatSimulation();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={panel}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          <code style={code}>d3Force('charge').strength(n)</code>
        </div>
        <div style={row}>
          <span style={label}>Strength: <strong>{strength}</strong></span>
          <input
            type="range" min={-300} max={50} step={5}
            value={strength}
            onChange={e => apply(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
          Negative → repulsion (default –30)<br />
          Positive → attraction
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeAutoColorBy="group"
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 2. Link distance ─────────────────────────────────────────────────────────
/**
 * `forceLink` controls the resting length and stiffness of each edge.
 * `.distance(n)` sets the target distance in graph units.
 * `.iterations(n)` sets how many times the constraint is solved per tick —
 * higher values make links feel stiffer.
 */
export const LinkDistance: Story = () => {
  const fgRef = useRef<any>();
  const data = useMemo(() => genClusters(3, 6), []);
  const [distance, setDistance] = useState(30);
  const [iterations, setIterations] = useState(1);

  const apply = (d: number, it: number) => {
    fgRef.current?.d3Force('link')?.distance(d).iterations(it);
    fgRef.current?.d3ReheatSimulation();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={panel}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          <code style={code}>d3Force('link').distance(n).iterations(n)</code>
        </div>
        <div style={row}>
          <span style={label}>Distance: <strong>{distance}</strong></span>
          <input
            type="range" min={5} max={200} step={5}
            value={distance}
            onChange={e => { const v = Number(e.target.value); setDistance(v); apply(v, iterations); }}
            style={{ flex: 1 }}
          />
        </div>
        <div style={row}>
          <span style={label}>Iterations: <strong>{iterations}</strong></span>
          <input
            type="range" min={1} max={10} step={1}
            value={iterations}
            onChange={e => { const v = Number(e.target.value); setIterations(v); apply(distance, v); }}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
          Higher iterations = stiffer links<br />
          (default distance: 30, iterations: 1)
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeAutoColorBy="group"
        linkWidth={1.5}
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 3. Add a collision force ─────────────────────────────────────────────────
/**
 * By default nodes can overlap. Adding a `forceCollide` gives each node a
 * physical radius and prevents overlaps.
 *
 * This force is not built-in — we register it under a new name 'collide'.
 * Toggle the button to add or remove it and see the difference.
 */
export const CollisionForce: Story = () => {
  const fgRef = useRef<any>();
  const data = useMemo(() => genRandomTree(60), []);
  const [collisionOn, setCollisionOn] = useState(false);
  const [radius, setRadius] = useState(8);

  const toggleCollision = useCallback((on: boolean, r: number) => {
    if (on) {
      fgRef.current?.d3Force('collide', forceCollide(r));
    } else {
      fgRef.current?.d3Force('collide', null);
    }
    fgRef.current?.d3ReheatSimulation();
  }, []);

  const btn: React.CSSProperties = {
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: collisionOn ? '#6366f1' : '#fff',
    color: collisionOn ? '#fff' : '#334155',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={panel}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          <code style={code}>d3Force('collide', forceCollide(r))</code>
        </div>
        <div style={row}>
          <button style={btn} onClick={() => {
            const next = !collisionOn;
            setCollisionOn(next);
            toggleCollision(next, radius);
          }}>
            {collisionOn ? '✓ Collision on' : 'Collision off'}
          </button>
        </div>
        <div style={row}>
          <span style={label}>Radius: <strong>{radius}px</strong></span>
          <input
            type="range" min={4} max={30} step={1}
            value={radius}
            onChange={e => {
              const v = Number(e.target.value);
              setRadius(v);
              if (collisionOn) toggleCollision(true, v);
            }}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
          forceCollide is not built-in — we add it<br />
          under a new name. Pass <code style={code}>null</code> to remove it.
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeRelSize={4}
        nodeAutoColorBy="group"
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 4. Remove the centering force ────────────────────────────────────────────
/**
 * The 'center' force gently pulls all nodes toward {0,0}. Removing it
 * lets the graph drift freely — useful for large or disconnected graphs
 * where forcing a center position distorts the layout.
 *
 * Pass `null` as the second argument to d3Force to remove any force.
 */
export const RemoveCenterForce: Story = () => {
  const fgRef = useRef<any>();
  const data = useMemo(() => genClusters(4, 7), []);
  const [centered, setCentered] = useState(true);

  // Apply on mount once the ref is set
  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400);
  }, []);

  const toggle = () => {
    const next = !centered;
    setCentered(next);
    if (next) {
      fgRef.current?.d3Force('center', forceCenter());
    } else {
      fgRef.current?.d3Force('center', null);
    }
    fgRef.current?.d3ReheatSimulation();
  };

  const btn: React.CSSProperties = {
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: centered ? '#6366f1' : '#fff',
    color: centered ? '#fff' : '#334155',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={panel}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          <code style={code}>d3Force('center', null)</code>
        </div>
        <div style={row}>
          <button style={btn} onClick={toggle}>
            {centered ? '✓ Center force on' : 'Center force off'}
          </button>
        </div>
        <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
          Remove center force then drag nodes to see<br />
          the graph float freely without being pulled back.
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeAutoColorBy="group"
        linkWidth={1.5}
        onEngineStop={handleEngineStop}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};
