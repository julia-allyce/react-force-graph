/**
 * Basic Graph
 * -----------
 * The minimal ForceGraph2D setup. Use the Controls panel (bottom of the screen)
 * to adjust props and see them reflected live.
 *
 * Things to try:
 *  - Increase nodeRadius to make nodes bigger
 *  - Change nodeColor to any CSS color string
 *  - Increase linkWidth to make edges thicker
 *  - Toggle nodeAutoColorBy to group nodes by cluster
 */
import React, { useMemo } from 'react';
import type { Story } from '@ladle/react';
import ForceGraph2D from 'react-force-graph-2d';
import { genClusters } from './data';

// ── Story metadata ──────────────────────────────────────────────────────────
export default {
  title: 'ForceGraph2D / Basic',
};

// ── Args type — these become the Controls panel sliders/inputs ──────────────
interface Args {
  nodeRadius: number;
  nodeColor: string;
  linkWidth: number;
  linkColor: string;
  backgroundColor: string;
  enableNodeDrag: boolean;
}

// ── Default story ───────────────────────────────────────────────────────────
export const Default: Story<Args> = ({ nodeRadius, nodeColor, linkWidth, linkColor, backgroundColor, enableNodeDrag })=> {
    // useMemo keeps the same data object across re-renders triggered by Controls.
    // Without this, changing a control would regenerate the graph and restart
    // the simulation from scratch every time.
    const data = useMemo(() => genClusters(4, 8), []);

    return (
      <ForceGraph2D
        graphData={data}
        nodeColor={nodeColor}
        linkWidth={linkWidth}
        linkColor={linkColor}
        backgroundColor={backgroundColor}
        enableNodeDrag={enableNodeDrag}
        nodeLabel="name"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    );
  };

// ── Auto-colored variant ────────────────────────────────────────────────────
// nodeAutoColorBy assigns colors automatically by grouping nodes on a field.
// Only applies to nodes that don't have an explicit `color` property.
export const AutoColored: Story = ()=> {
    const data = useMemo(() => genClusters(5, 7), []);
    return (
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="group"
        linkWidth={1}
        linkColor={() => '#e2e8f0'}
        nodeLabel="name"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    );
  };

// ── With directional arrows ─────────────────────────────────────────────────
export const DirectionalArrows: Story =()=> {
    const data = useMemo(() => genClusters(3, 6), []);
    return (
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="group"
        linkWidth={1.5}
        // linkDirectionalArrowLength: size of the arrow head in px.
        // 0 = hidden (default).
        linkDirectionalArrowLength={6}
        // linkDirectionalArrowRelPos: where along the link the arrow sits.
        // 1 = at the target node, 0.5 = midpoint.
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#94a3b8'}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    );
  };
