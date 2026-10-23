import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

/** Временный экран раздела, который появится в следующих задачах. */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <>
      <ScreenHeader title={title} />
      <EmptyState title="Раздел в разработке" description={description} />
    </>
  );
}
