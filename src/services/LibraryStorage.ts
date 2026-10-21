import AsyncStorage from "@react-native-async-storage/async-storage";
import { Library } from "@/models/Library";

const STORAGE_KEY = "framelist.library.v1";

/** Persiste la biblioteca del usuario en el almacenamiento local del dispositivo. */
export class LibraryStorage {
  async load(): Promise<Library> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? Library.fromSnapshot(JSON.parse(raw)) : Library.empty();
    } catch {
      return Library.empty();
    }
  }

  async save(library: Library): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library.toSnapshot()));
    } catch {
      // Guardar es "mejor esfuerzo": un fallo no debe interrumpir la app.
    }
  }
}
