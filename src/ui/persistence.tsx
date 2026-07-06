// Optionale localStorage-Persistenz fuer Seed und UI-Einstellungen
// (docs/03-technical/reset-seed-and-persistence.md). Kein Spielstand,
// keine Pflicht-Persistenz; Fehler werden still ignoriert.

const STORAGE_KEY = "scripted-colony.ui-settings.v1";

export type UiSettings = {
  seed?: string;
  speed?: 1 | 2 | 4;
  diagnosticsExpanded?: boolean;
};

export function loadUiSettings(): UiSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as UiSettings;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveUiSettings(settings: UiSettings): void {
  try {
    const previous = loadUiSettings();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...previous, ...settings }),
    );
  } catch {
    // localStorage nicht verfuegbar: Persistenz ist optional.
  }
}
