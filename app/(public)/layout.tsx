import type { ReactNode } from 'react';
import { SiteShell } from '@/src/components/layout/site-shell';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
