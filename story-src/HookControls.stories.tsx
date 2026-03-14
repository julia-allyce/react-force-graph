/**
 * useForceGraph2D Hook
 * --------------------
 * Demonstrates how to drive the graph imperatively through the hook's
 * `controls` object instead of managing a raw ref yourself.
 *
 * The hook returns:
 *   { ref, controls: { zoomToFit, centerAt, zoom, pauseAnimation,
 *                       resumeAnimation, d3Force, d3ReheatSimulation, … } }
 *
 * All controls have stable identities — safe for useEffect / React.memo.
 */
import React, { useMemo, useState, useCallback } from 'react';
import type { Story } from '@ladle/react';
import ForceGraph2D from 'react-force-graph-2d';
import { useForceGraph2D } from '../src/packages/react-force-graph-2d/useForceGraph2D.js';
import { genRandomTree, genClusters } from './data';

export default {
  title: 'ForceGraph2D / Hook Controls',
};

// ─── Shared toolbar style ────────────────────────────────────────────────────
const toolbarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 10,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  boxShadow: '0 1px 3px rgba(0,0,0,.1)',
};

// ─── 1. Zoom & Pan ───────────────────────────────────────────────────────────
/**
 * Shows zoomToFit, centerAt, and zoom controls.
 * Click any node to centre the camera on it.
 */
export const ZoomAndPan: Story = () => {
  const { ref, controls } = useForceGraph2D();
  const data = useMemo(() => genClusters(4, 8), []);

  const handleNodeClick = useCallback((node: any) => {
    controls.centerAt(node.x, node.y, 600);
    controls.zoom(4, 600);
  }, [controls]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={() => controls.zoomToFit(400)}>
          Fit all
        </button>
        <button style={btnStyle} onClick={() => controls.zoom(1, 400)}>
          Reset zoom
        </button>
        <button style={btnStyle} onClick={() => controls.centerAt(0, 0, 400)}>
          Center origin
        </button>
      </div>
      <ForceGraph2D
        ref={ref}
        graphData={data}
        nodeAutoColorBy="group"
        nodeLabel="name"
        onNodeClick={handleNodeClick}
        onEngineStop={() => controls.zoomToFit(400)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 2. Pause & Resume ───────────────────────────────────────────────────────
/**
 * Demonstrates pauseAnimation / resumeAnimation.
 * Pausing stops all canvas redraws — useful for saving CPU when the graph
 * is off-screen or the user is interacting with other UI.
 */
export const PauseResume: Story = () => {
  const { ref, controls } = useForceGraph2D();
  const data = useMemo(() => genClusters(3, 8), []);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    if (paused) {
      controls.resumeAnimation();
    } else {
      controls.pauseAnimation();
    }
    setPaused(p => !p);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={toggle}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>
      <ForceGraph2D
        ref={ref}
        graphData={data}
        nodeAutoColorBy="group"
        linkDirectionalParticles={2}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 3. Simulation strength ───────────────────────────────────────────────────
/**
 * Uses d3Force + d3ReheatSimulation to live-edit the charge (repulsion)
 * strength, then reheat the simulation so the change takes effect.
 *
 * Note: d3Force is a getter when called with one arg and a setter when
 * called with two — the hook preserves this convention.
 */
export const SimulationStrength: Story = () => {
  const { ref, controls } = useForceGraph2D();
  const data = useMemo(() => genRandomTree(40), []);
  const [strength, setStrength] = useState(-30);

  const applyStrength = (value: number) => {
    setStrength(value);
    controls.d3Force('charge')?.strength(value);
    controls.d3ReheatSimulation();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ ...toolbarStyle, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>
          Charge strength: <strong>{strength}</strong>
        </label>
        <input
          type="range"
          min={-300}
          max={0}
          step={10}
          value={strength}
          onChange={e => applyStrength(Number(e.target.value))}
        />
        <button style={btnStyle} onClick={() => controls.zoomToFit(300)}>
          Fit
        </button>
      </div>
      <ForceGraph2D
        ref={ref}
        graphData={data}
        nodeAutoColorBy="group"
        onEngineStop={() => controls.zoomToFit(400)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

// ─── 4. Click to focus ────────────────────────────────────────────────────────
/**
 * Clicking a node smoothly flies the camera to centre on it.
 * Clicking the background resets to fit-all.
 * This is a common pattern for drill-down graph UIs.
 */
export const ClickToFocus: Story = () => {
  const { ref, controls } = useForceGraph2D();
  const data = useMemo(() => genClusters(5, 6), []);

  return (
    <div style={{ position: 'relative' }}>
      <div style={toolbarStyle}>
        <span style={{ fontSize: 13, padding: '6px 0' }}>
          Click a node to focus • click background to fit all
        </span>
      </div>
      <ForceGraph2D
        ref={ref}
        graphData={data}
        nodeAutoColorBy="group"
        nodeLabel="name"
        onEngineStop={() => controls.zoomToFit(400)}
        onNodeClick={(node: any) => {
          controls.centerAt(node.x, node.y, 500);
          controls.zoom(5, 500);
        }}
        onBackgroundClick={() => controls.zoomToFit(500)}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};
