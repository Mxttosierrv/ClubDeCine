import AsyncStorage from "@react-native-async-storage/async-storage";
import { Library } from "@/models/Library";

// v3: las películas ahora se identifican por su id de TMDB. Se cambia la clave
// para ignorar las listas guardadas por versiones anteriores (otros ids y datos).
const STORAGE_KEY = "framelist.library.v3";

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
