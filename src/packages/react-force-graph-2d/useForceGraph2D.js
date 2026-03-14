import { useRef, useCallback } from 'react';

/**
 * useForceGraph2D
 *
 * Returns a `ref` to attach to <ForceGraph2D> and a stable `controls` object
 * with memoised wrappers for every imperative method on the graph instance.
 *
 * All methods are safe to put in useEffect / useCallback dependency arrays —
 * their identities never change between renders.
 *
 * @example
 * const { ref, controls } = useForceGraph2D();
 *
 * // Zoom to fit once the simulation has settled:
 * <ForceGraph2D ref={ref} onEngineStop={() => controls.zoomToFit(400)} />
 *
 * // Center on a node when the user clicks it:
 * const handleClick = (node) => controls.centerAt(node.x, node.y, 500);
 */
export function useForceGraph2D() {
  const ref = useRef(null);

  // ── Camera ─────────────────────────────────────────────────────────────────
  /** Zoom to fit all nodes, with optional animation duration and padding. */
  const zoomToFit = useCallback(
    (durationMs, padding, nodeFilter) =>
      ref.current?.zoomToFit(durationMs, padding, nodeFilter),
    []
  );

  /**
   * Get or set the canvas centre point.
   * Called with no args → returns current { x, y }.
   * Called with x, y   → pans to that position over durationMs.
   */
  const centerAt = useCallback((x, y, durationMs) => {
    if (x === undefined) return ref.current?.centerAt();
    return ref.current?.centerAt(x, y, durationMs);
  }, []);

  /**
   * Get or set the zoom level.
   * Called with no args → returns current scale.
   * Called with scale   → zooms to that scale over durationMs.
   */
  const zoom = useCallback((scale, durationMs) => {
    if (scale === undefined) return ref.current?.zoom();
    return ref.current?.zoom(scale, durationMs);
  }, []);

  // ── Animation ──────────────────────────────────────────────────────────────
  /** Stop the render loop entirely (no more canvas updates). */
  const stopAnimation = useCallback(() => ref.current?.stopAnimation(), []);

  /** Pause the render loop (can be resumed). */
  const pauseAnimation = useCallback(() => ref.current?.pauseAnimation(), []);

  /** Resume a paused render loop. */
  const resumeAnimation = useCallback(() => ref.current?.resumeAnimation(), []);

  // ── Simulation ─────────────────────────────────────────────────────────────
  /**
   * Get or set a named D3 force on the simulation.
   * Called with name only  → returns the current force instance.
   * Called with name + fn  → sets the force and returns the graph instance.
   *
   * Built-in force names: 'link', 'charge', 'center', 'dagRadial'.
   */
  const d3Force = useCallback((forceName, forceFn) => {
    if (forceFn === undefined) return ref.current?.d3Force(forceName);
    return ref.current?.d3Force(forceName, forceFn);
  }, []);

  /** Reset simulation alpha to 1 and restart — call after changing forces. */
  const d3ReheatSimulation = useCallback(
    () => ref.current?.d3ReheatSimulation(),
    []
  );

  // ── Particles ──────────────────────────────────────────────────────────────
  /** Emit a one-off particle burst on the given link object. */
  const emitParticle = useCallback(
    (link) => ref.current?.emitParticle(link),
    []
  );

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  /** Returns the bounding box { x: [min,max], y: [min,max] } of all (or filtered) nodes. */
  const getGraphBbox = useCallback(
    (nodeFilter) => ref.current?.getGraphBbox(nodeFilter),
    []
  );

  /** Convert canvas pixel coordinates to graph-space coordinates. */
  const screen2GraphCoords = useCallback(
    (x, y) => ref.current?.screen2GraphCoords(x, y),
    []
  );

  /** Convert graph-space coordinates to canvas pixel coordinates. */
  const graph2ScreenCoords = useCallback(
    (x, y) => ref.current?.graph2ScreenCoords(x, y),
    []
  );

  return {
    ref,
    controls: {
      // camera
      zoomToFit,
      centerAt,
      zoom,
      // animation
      stopAnimation,
      pauseAnimation,
      resumeAnimation,
      // simulation
      d3Force,
      d3ReheatSimulation,
      // particles
      emitParticle,
      // coordinates
      getGraphBbox,
      screen2GraphCoords,
      graph2ScreenCoords,
    },
  };
}
