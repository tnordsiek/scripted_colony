// AssetRegistry und Fallbacks nach docs/05-assets/asset-fallbacks.md und
// canonical-data-model.md#asset-registry. FallbackAssetRegistry ist vollstaendig;
// jeder MVP-AssetKey besitzt einen render-sicheren Fallback.
import type {
  AssetKey,
  AssetRegistry,
  AssetResolutionResult,
  FallbackAssetRegistry,
  GameEvent,
  RenderAsset,
} from "./types";

// Finale Bild-Assets sind im MVP optional; die Registry bleibt partiell/leer.
export const MVP_ASSET_REGISTRY: AssetRegistry = {};

// source transportiert fuer Canvas-Fallbacks die Basisfarbe.
export const MVP_FALLBACK_ASSET_REGISTRY: FallbackAssetRegistry = {
  "terrain.plains": {
    key: "terrain.plains",
    kind: "proceduralTile",
    source: "#c2a36b",
    label: "Plains",
    fallback: true,
  },
  "terrain.unknown": {
    key: "terrain.unknown",
    kind: "proceduralTile",
    source: "#2a2622",
    label: "Unbekannt",
    fallback: true,
  },
  "fog.unknown": {
    key: "fog.unknown",
    kind: "proceduralTile",
    source: "#181512",
    label: "Fog unbekannt",
    fallback: true,
  },
  "fog.discovered": {
    key: "fog.discovered",
    kind: "proceduralTile",
    source: "rgba(20, 16, 12, 0.55)",
    label: "Fog entdeckt",
    fallback: true,
  },
  "resource.ironOre": {
    key: "resource.ironOre",
    kind: "cssShape",
    source: "#b0622a",
    label: "Iron Ore",
    fallback: true,
  },
  "robot.starterRobot": {
    key: "robot.starterRobot",
    kind: "cssShape",
    source: "#3f7fd1",
    label: "Starter",
    fallback: true,
  },
  "robot.ironMiner": {
    key: "robot.ironMiner",
    kind: "cssShape",
    source: "#d1893f",
    label: "Iron Miner",
    fallback: true,
  },
  "building.solarCollector": {
    key: "building.solarCollector",
    kind: "cssShape",
    source: "#3fb8d1",
    label: "Solar Collector",
    fallback: true,
  },
  "building.robotFactory": {
    key: "building.robotFactory",
    kind: "cssShape",
    source: "#8a8f98",
    label: "Roboterfabrik",
    fallback: true,
  },
  "building.aiResearchCenter": {
    key: "building.aiResearchCenter",
    kind: "cssShape",
    source: "#9a5fd1",
    label: "KI-Forschungszentrum",
    fallback: true,
  },
  "building.steelworks": {
    key: "building.steelworks",
    kind: "cssShape",
    source: "#a33c2e",
    label: "Stahlwerk",
    fallback: true,
  },
  "building.energyStorage": {
    key: "building.energyStorage",
    kind: "cssShape",
    source: "#3cae5c",
    label: "Energiespeicher",
    fallback: true,
  },
  "building.construction": {
    key: "building.construction",
    kind: "cssShape",
    source: "rgba(255, 255, 255, 0.35)",
    label: "Baustelle",
    fallback: true,
  },
  "ui.selection": {
    key: "ui.selection",
    kind: "cssShape",
    source: "#f2e14c",
    label: "Auswahl",
    fallback: true,
  },
  "ui.reservation": {
    key: "ui.reservation",
    kind: "cssShape",
    source: "#4cf2a5",
    label: "Reservierung",
    fallback: true,
  },
  "ui.productionPaused": {
    key: "ui.productionPaused",
    kind: "textBadge",
    source: "#f2a54c",
    label: "Produktion pausiert",
    fallback: true,
  },
  "ui.spawnBlocked": {
    key: "ui.spawnBlocked",
    kind: "textBadge",
    source: "#f24c4c",
    label: "Spawn blockiert",
    fallback: true,
  },
};

export function createDebugAssetFallbackUsedEvent(
  key: AssetKey,
  fallbackAsset: RenderAsset,
): GameEvent {
  return {
    id: `event.asset.${key}.fallbackUsed`,
    tick: 0,
    visibility: "debug",
    severity: "info",
    priority: "low",
    category: "system",
    code: "debug.asset.fallbackUsed",
    message: `Fallback-Asset verwendet: ${key}.`,
    entityId: `asset.${key}`,
    details: { assetKey: key, kind: fallbackAsset.kind },
  };
}

export function createDebugAssetMissingFallbackEvent(key: AssetKey): GameEvent {
  return {
    id: `event.asset.${key}.missingFallback`,
    tick: 0,
    visibility: "debug",
    severity: "error",
    priority: "critical",
    category: "system",
    code: "debug.asset.missingFallback",
    message: `Fehlender Fallback fuer AssetKey: ${key}.`,
    entityId: `asset.${key}`,
    details: { assetKey: key },
  };
}

export function resolveAssetDetailed(
  key: AssetKey,
  loadedAssets: AssetRegistry = MVP_ASSET_REGISTRY,
  fallbackAssets: FallbackAssetRegistry = MVP_FALLBACK_ASSET_REGISTRY,
): AssetResolutionResult {
  const finalAsset = loadedAssets[key];
  if (finalAsset) {
    return { type: "final", key, asset: finalAsset };
  }

  const fallbackAsset = fallbackAssets[key];
  if (fallbackAsset) {
    return {
      type: "fallback",
      key,
      asset: fallbackAsset,
      diagnostic: createDebugAssetFallbackUsedEvent(key, fallbackAsset),
    };
  }

  return {
    type: "missingFallback",
    key,
    error: true,
    diagnostic: createDebugAssetMissingFallbackEvent(key),
  };
}

export function resolveAsset(
  key: AssetKey,
  loadedAssets: AssetRegistry = MVP_ASSET_REGISTRY,
  fallbackAssets: FallbackAssetRegistry = MVP_FALLBACK_ASSET_REGISTRY,
): RenderAsset {
  const result = resolveAssetDetailed(key, loadedAssets, fallbackAssets);

  if (result.type === "missingFallback") {
    throw new Error(`Missing fallback asset for ${key}`);
  }

  return result.asset;
}
