export type Route =
  | { name: 'trades' }
  | { name: 'calendar' }
  | { name: 'stats' }
  | { name: 'systems' }
  | { name: 'settings' }
  | { name: 'system-form'; systemId?: string };

const TAB_ROUTES: ReadonlyArray<Route['name']> = [
  'trades',
  'calendar',
  'stats',
  'systems',
  'settings',
];

export function isTabRoute(route: Route): boolean {
  return TAB_ROUTES.includes(route.name);
}
