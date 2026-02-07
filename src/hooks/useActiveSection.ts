import { useEffect, useMemo, useState } from "react";

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  const observers = useMemo(() => new Map<string, IntersectionObserver>(), []);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => {
      const id = el.id;
      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0.02 }
      );
      obs.observe(el);
      observers.set(id, obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
      observers.clear();
    };
  }, [ids, observers]);

  return active;
}
