// hooks/useLiveValues.js
import * as React from "react";

export default function useLiveValues(initial, updateFn, intervalMs = 15000) {
  const [state, setState] = React.useState(initial);

  React.useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => updateFn(prev));
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, updateFn]);

  return state;
}
