// Shared data generators for stories.

export interface RawNode {
  id: string | number;
  [key: string]: any;
}
export interface RawLink {
  source: string | number;
  target: string | number;
  [key: string]: any;
}
export interface RawGraphData {
  nodes: RawNode[];
  links: RawLink[];
}

/** A random tree where every node connects to one earlier node. */
export function genRandomTree(n = 30): RawGraphData {
  return {
    nodes: Array.from({ length: n }, (_, i) => ({ id: i, name: `Node ${i}` })),
    links: Array.from({ length: n - 1 }, (_, i) => ({
      source: i + 1,
      target: Math.floor(Math.random() * (i + 1)),
    })),
  };
}

/** Nodes grouped into clusters with dense intra-cluster and sparse inter-cluster links. */
export function genClusters(clusterCount = 4, nodesPerCluster = 8): RawGraphData {
  const nodes: RawNode[] = [];
  const links: RawLink[] = [];
  let id = 0;

  for (let c = 0; c < clusterCount; c++) {
    const clusterStart = id;
    for (let n = 0; n < nodesPerCluster; n++) {
      nodes.push({ id: id++, group: c, name: `C${c}N${n}` });
    }
    // Dense intra-cluster links
    for (let i = clusterStart + 1; i < id; i++) {
      links.push({
        source: i,
        target: clusterStart + Math.floor(Math.random() * (i - clusterStart)),
      });
    }
  }

  // One bridge link between each adjacent cluster
  for (let c = 0; c < clusterCount - 1; c++) {
    links.push({
      source: c * nodesPerCluster,
      target: (c + 1) * nodesPerCluster,
    });
  }

  return { nodes, links };
}

/** Small static dependency graph — good for styling demos. */
export const dependencyGraph: RawGraphData = {
  nodes: [
    { id: 'react',        label: 'react',         type: 'core',    importance: 10 },
    { id: 'react-dom',    label: 'react-dom',     type: 'core',    importance: 8  },
    { id: 'scheduler',    label: 'scheduler',     type: 'utility', importance: 4  },
    { id: 'prop-types',   label: 'prop-types',    type: 'utility', importance: 3  },
    { id: 'react-is',     label: 'react-is',      type: 'utility', importance: 3  },
    { id: 'router',       label: 'react-router',  type: 'plugin',  importance: 5  },
    { id: 'query',        label: 'react-query',   type: 'plugin',  importance: 5  },
    { id: 'history',      label: 'history',       type: 'utility', importance: 2  },
  ],
  links: [
    { source: 'react-dom', target: 'react',       optional: false },
    { source: 'react-dom', target: 'scheduler',   optional: false },
    { source: 'react',     target: 'prop-types',  optional: true  },
    { source: 'react-dom', target: 'prop-types',  optional: true  },
    { source: 'react-dom', target: 'react-is',    optional: false },
    { source: 'router',    target: 'react',       optional: false },
    { source: 'router',    target: 'react-dom',   optional: false },
    { source: 'router',    target: 'history',     optional: false },
    { source: 'query',     target: 'react',       optional: false },
    { source: 'query',     target: 'react-dom',   optional: false },
  ],
};

export const TYPE_COLORS: Record<string, string> = {
  core:    '#6366f1',
  utility: '#f59e0b',
  plugin:  '#10b981',
};
