import type { ComponentType, SVGProps } from 'react';
import { useRouter } from '../../app/router';
import type { Route } from '../../app/routes';
import {
  CalendarIcon,
  SettingsIcon,
  StatsIcon,
  SystemsIcon,
  TradesIcon,
} from '../icons';
import styles from './BottomNav.module.css';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ITEMS: ReadonlyArray<{ route: Route; label: string; Icon: IconComponent }> = [
  { route: { name: 'trades' }, label: 'Сделки', Icon: TradesIcon },
  { route: { name: 'calendar' }, label: 'Календарь', Icon: CalendarIcon },
  { route: { name: 'stats' }, label: 'Статистика', Icon: StatsIcon },
  { route: { name: 'systems' }, label: 'Системы', Icon: SystemsIcon },
  { route: { name: 'settings' }, label: 'Настройки', Icon: SettingsIcon },
];

export function BottomNav() {
  const { route, navigate } = useRouter();

  return (
    <nav className={styles.nav} aria-label="Основные разделы">
      {ITEMS.map(({ route: itemRoute, label, Icon }) => {
        const active = route.name === itemRoute.name;

        return (
          <button
            key={itemRoute.name}
            type="button"
            className={[styles.item, active ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => navigate(itemRoute)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
