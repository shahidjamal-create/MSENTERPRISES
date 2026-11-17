import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';

// Runs an async loader on mount (and whenever deps change) and tracks
// loading / error state. Stale responses from older calls are ignored.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const loaderRef = useRef(loader);
  const callId = useRef(0);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await loaderRef.current();
      if (id === callId.current) setState({ data, loading: false, error: '' });
      return data;
    } catch (err) {
      if (id === callId.current) setState((s) => ({ ...s, loading: false, error: errorMessage(err) }));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, reload: run };
}
