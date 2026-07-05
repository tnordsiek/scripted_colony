# GitHub Pages Deployment

Das Spiel und der MVP sollen statisch auf GitHub Pages gehostet werden.

## Grundentscheidung

GitHub Pages ist die Zielplattform für die erste öffentliche/teilbare Version.

Konsequenzen:

- Kein Backend im MVP.
- Keine serverseitige Datenbank.
- Keine Server-Routen.
- Build-Ausgabe muss statisch sein.
- Alle Assets müssen im Repository oder in statisch erreichbaren Pfaden liegen.
- Die Anwendung muss als statische Single Page App funktionieren.

## Vite-Konfiguration

Da GitHub Pages bei Projektseiten üblicherweise unter einem Repository-Pfad läuft, muss Vite einen passenden `base`-Pfad unterstützen.

Empfohlene Strategie:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/REPOSITORY_NAME/" : "/",
}));
```

`REPOSITORY_NAME` muss später durch den tatsächlichen GitHub-Repository-Namen ersetzt werden.

Alternative für eine User-/Org-Page unter Root-Domain:

```ts
base: "/"
```

## Routing

Für den MVP sollte kein serverseitiges Routing verwendet werden.

Empfehlung:

- keine URL-basierten Unterseiten im MVP
- oder Hash-Routing, falls spätere Views nötig sind

Beispiel:

```text
https://user.github.io/repository-name/#/game
```

Damit werden GitHub-Pages-404-Probleme bei Reloads vermieden.

## Asset-Pfade

Assets müssen GitHub-Pages-kompatibel referenziert werden.

Regeln:

- Assets im `public/assets/`-Ordner ablegen.
- Keine absoluten lokalen Dateipfade.
- Keine Abhängigkeit von externen Laufzeitservern.
- Im Code Pfade relativ zur Vite-Base behandeln.

Beispiel:

```ts
const assetPath = `${import.meta.env.BASE_URL}assets/tiles/plain.png`;
```

## Persistenz

Da GitHub Pages statisch ist, gibt es im MVP keine serverseitige Persistenz.

Erlaubt:

- In-Memory-State
- optional `localStorage` für lokale Savegames/Einstellungen
- Export/Import als JSON später möglich

Nicht MVP:

- Accounts
- Online-Saves
- Multiplayer
- Server-API
- Datenbank

## GitHub Actions Deployment

Der MVP baut in CI verbindlich mit Node.js 22.x. GitHub Actions verwendet dafuer `actions/setup-node@v4` mit `node-version: 22`, aktiviert npm-Cache und installiert ausschliesslich mit `npm ci`.

Empfohlene Deployment-Struktur:

```text
.github/workflows/deploy.yml
```

Beispielworkflow:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Test
        run: npm test -- --run

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

## Package Scripts und Node-Engine

Empfohlene `package.json`-Mindestfelder:

```json
{
  "engines": {
    "node": ">=22 <23"
  },
  "scripts": {
    "dev": "vite",
    "test": "vitest",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Akzeptanzkriterien Deployment

- `npm run build` erzeugt eine statische `dist/`-Ausgabe.
- `dist/` enthält alle notwendigen Dateien.
- Spiel startet lokal per `npm run preview`.
- GitHub Actions baut das Projekt mit Node.js 22.x ohne Fehler.
- Tests laufen vor Deployment per `npm test -- --run`.
- GitHub Pages zeigt den MVP ohne Backend.
- Assets werden korrekt geladen.
- Reload auf der Hauptseite funktioniert.
- Keine API-/Server-Abhängigkeit im MVP.

## MVP-Regel

GitHub Pages ist nicht nur ein späteres Deployment-Ziel, sondern eine technische Randbedingung für den MVP. Architektur, Asset-Pfade, Routing und Persistenz müssen von Anfang an statisches Hosting berücksichtigen.

## Asset-Spezifikation

Assets sind implementierungsscharf dokumentiert.

Festgelegt:

- MVP-required Assets
- MVP-optional Assets
- Future-Assets
- Dateipfade
- Assetgrößen
- Render-Layer
- Namenskonvention
- Canvas-Fallbacks
- Asset Registry
- BASE_URL-kompatibles Asset-Loading

Hauptdokument:

```text
docs/06-reference/assets.md
```

Regel:

```text
Das Spiel muss ohne echte Bilddateien über Canvas-Fallbacks lauffähig sein.
```
