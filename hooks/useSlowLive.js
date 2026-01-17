// hooks/useSlowLive.js
import * as React from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Slow random drift that feels "real" (small changes, long interval)
export default function useSlowLive(initial, updater, intervalMs = 30 * 60 * 1000) {
  const [state, setState] = React.useState(initial);

  React.useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => updater(prev));
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, updater]);

  return [state, setState, clamp];
}
