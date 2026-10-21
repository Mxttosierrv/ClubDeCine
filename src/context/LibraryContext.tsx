import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Library, type MoveDirection } from "@/models/Library";
import type { Movie } from "@/models/Movie";
import { libraryStorage } from "@/services/container";

interface LibraryContextValue {
  library: Library;
  addMovie: (movie: Movie) => void;
  removeFromWatchlist: (id: string) => void;
  markWatched: (id: string) => void;
  removeWatched: (id: string) => void;
  moveMovie: (id: string, direction: MoveDirection) => void;
  createList: (name: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

/**
 * Mantiene la `Library` en estado de React, la carga al iniciar y la guarda
 * en el dispositivo cada vez que cambia. No renderiza nada hasta cargar.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(Library.empty());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    libraryStorage.load().then((stored) => {
      if (!active) return;
      setLibrary(stored);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void libraryStorage.save(library);
  }, [library, ready]);

  const addMovie = useCallback((movie: Movie) => setLibrary((l) => l.add(movie)), []);
  const removeFromWatchlist = useCallback((id: string) => setLibrary((l) => l.remove(id)), []);
  const markWatched = useCallback((id: string) => setLibrary((l) => l.markWatched(id)), []);
  const removeWatched = useCallback((id: string) => setLibrary((l) => l.removeWatched(id)), []);
  const moveMovie = useCallback(
    (id: string, direction: MoveDirection) => setLibrary((l) => l.move(id, direction)),
    [],
  );
  const createList = useCallback((name: string) => setLibrary((l) => l.createList(name)), []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      library,
      addMovie,
      removeFromWatchlist,
      markWatched,
      removeWatched,
      moveMovie,
      createList,
    }),
    [library, addMovie, removeFromWatchlist, markWatched, removeWatched, moveMovie, createList],
  );

  if (!ready) return null;
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary debe usarse dentro de <LibraryProvider>.");
  return context;
}
