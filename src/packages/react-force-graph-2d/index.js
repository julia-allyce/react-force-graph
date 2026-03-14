import fromKapsule from 'react-kapsule';
import ForceGraph2DKapsule from 'force-graph';
import { ForceGraph2DPropTypes } from '../../forcegraph-proptypes';

export { useForceGraph2D } from './useForceGraph2D.js';

const ForceGraph2D = fromKapsule(
  ForceGraph2DKapsule,
  {
    methodNames: [ // bind methods
      'emitParticle',
      'd3Force',
      'd3ReheatSimulation',
      'stopAnimation',
      'pauseAnimation',
      'resumeAnimation',
      'centerAt',
      'zoom',
      'zoomToFit',
      'getGraphBbox',
      'screen2GraphCoords',
      'graph2ScreenCoords'
    ]
  }
);

ForceGraph2D.displayName = 'ForceGraph2D';
ForceGraph2D.propTypes = ForceGraph2DPropTypes;

export default ForceGraph2D;
