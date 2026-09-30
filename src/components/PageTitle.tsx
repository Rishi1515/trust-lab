import { useEffect, useRef, type ReactNode } from 'react';

let firstPageOfVisit = true;

/**
 * Each view's h1. After the first page of a visit, it takes focus when the view mounts, so
 * keyboard and screen reader users land on the new content (for example, feedback after
 * submitting a decision).
 */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (firstPageOfVisit) {
      firstPageOfVisit = false;
      return;
    }
    ref.current?.focus();
  }, []);
  return (
    <h1 id="page-title" tabIndex={-1} ref={ref} className={className}>
      {children}
    </h1>
  );
}
