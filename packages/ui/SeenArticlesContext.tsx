"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ApiArticle } from "@umg/api";

interface SeenArticlesContextValue {
  claim: (ids: number[], priority: number) => void;
  filter: (articles: ApiArticle[], priority: number) => ApiArticle[];
  version: number;
}

const SeenArticlesContext = createContext<SeenArticlesContextValue | null>(null);

export function SeenArticlesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const claimsRef = useRef(new Map<number, number>()); // articleId → priority
  const [version, setVersion] = useState(0);

  const claim = useCallback((ids: number[], priority: number) => {
    let changed = false;
    for (const id of ids) {
      const existing = claimsRef.current.get(id);
      if (existing === undefined || priority < existing) {
        claimsRef.current.set(id, priority);
        changed = true;
      }
    }
    if (changed) setVersion((v) => v + 1);
  }, []);

  const filter = useCallback(
    (articles: ApiArticle[], priority: number): ApiArticle[] => {
      return articles.filter((a) => {
        const claimed = claimsRef.current.get(a.id);
        return claimed === undefined || claimed >= priority;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ claim, filter, version }),
    [claim, filter, version]
  );

  return (
    <SeenArticlesContext.Provider value={value}>
      {children}
    </SeenArticlesContext.Provider>
  );
}

export function useSeenArticles() {
  return useContext(SeenArticlesContext);
}
