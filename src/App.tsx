import { useRouter } from './app/router';
import { isTabRoute, type Route } from './app/routes';
import { AppShell } from './components/layout/AppShell';
import { BottomNav } from './components/layout/BottomNav';
import { CalendarScreen } from './screens/calendar/CalendarScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { StatsScreen } from './screens/stats/StatsScreen';
import { SystemFormScreen } from './screens/systems/SystemFormScreen';
import { SystemsScreen } from './screens/systems/SystemsScreen';
import { TradesScreen } from './screens/trades/TradesScreen';
import { isPersistenceAvailable } from './storage';
import styles from './App.module.css';

export default function App() {
  const { route } = useRouter();
  const withNav = isTabRoute(route);

  return (
    <AppShell withNav={withNav}>
      {isPersistenceAvailable ? null : (
        <p className={styles.notice} role="alert">
          Браузер не даёт сохранять данные: они пропадут после перезагрузки. Проверьте, не
          включён ли режим приватного просмотра.
        </p>
      )}
      {renderScreen(route)}
      {withNav ? <BottomNav /> : null}
    </AppShell>
  );
}

function renderScreen(route: Route) {
  switch (route.name) {
    case 'trades':
      return <TradesScreen />;
    case 'calendar':
      return <CalendarScreen />;
    case 'stats':
      return <StatsScreen />;
    case 'systems':
      return <SystemsScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'system-form':
      return <SystemFormScreen systemId={route.systemId} />;
    default:
      return null;
  }
}
