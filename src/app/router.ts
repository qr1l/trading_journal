import { useContext } from 'react';
import { RouterContext, type RouterValue } from './routerContext';

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error('useRouter должен вызываться внутри RouterProvider');
  }
  return value;
}
