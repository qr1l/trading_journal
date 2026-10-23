import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { RouterContext, type RouterValue } from './routerContext';
import { isTabRoute, type Route } from './routes';

const INITIAL_ROUTE: Route = { name: 'trades' };

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([INITIAL_ROUTE]);

  const navigate = useCallback((next: Route) => {
    setStack((current) => (isTabRoute(next) ? [next] : [...current, next]));
  }, []);

  const back = useCallback(() => {
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, []);

  const route = useMemo(() => stack[stack.length - 1] ?? INITIAL_ROUTE, [stack]);

  const value = useMemo<RouterValue>(
    () => ({ route, navigate, back, canGoBack: stack.length > 1 }),
    [route, navigate, back, stack.length],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
