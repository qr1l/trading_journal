import { createContext } from 'react';
import type { Route } from './routes';

export interface RouterValue {
  route: Route;
  navigate: (route: Route) => void;
  back: () => void;
  canGoBack: boolean;
}

export const RouterContext = createContext<RouterValue | null>(null);
