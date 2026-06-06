/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Maps a character name to a local, high-quality editorial portrait asset.
 * If the name does not have a direct mapping, it falls back to a gender-based portrait
 * to prevent broken image symbols.
 */
export function getAvatarUrl(name: string, originalUrl?: string): string {
  const PORTRAIT_MAPPINGS: Record<string, string> = {
    "Elena Rossi": "/portraits/elena_rossi.png",
    "Marcus Vance": "/portraits/marcus_vance.png",
    "Sloane Cross": "/portraits/sloane_cross.png",
    "Dr. Evelyn Reed": "/portraits/evelyn_reed.png",
    "VC Brandon Pierce": "/portraits/brandon_pierce.png",
    "Alfred Check": "/portraits/alfred_check.png"
  };

  if (PORTRAIT_MAPPINGS[name]) {
    return PORTRAIT_MAPPINGS[name];
  }

  // If original URL is already a working local portrait path, return it
  if (originalUrl && originalUrl.startsWith('/portraits/')) {
    return originalUrl;
  }

  const nameLower = name.toLowerCase();

  // Female character fallback matching keywords
  if (
    nameLower.includes("elena") || 
    nameLower.includes("rossi") || 
    nameLower.includes("evelyn") || 
    nameLower.includes("reed") || 
    nameLower.includes("seraphina") || 
    nameLower.includes("sterling") || 
    nameLower.includes("aria") || 
    nameLower.includes("thorne") || 
    nameLower.includes("victoria")
  ) {
    if (nameLower.includes("evelyn") || nameLower.includes("reed")) {
      return "/portraits/evelyn_reed.png";
    }
    return "/portraits/elena_rossi.png";
  }

  // Male character fallback matching keywords
  if (
    nameLower.includes("marcus") || 
    nameLower.includes("vance") || 
    nameLower.includes("brandon") || 
    nameLower.includes("pierce") || 
    nameLower.includes("miles") || 
    nameLower.includes("julian") || 
    nameLower.includes("christian") || 
    nameLower.includes("mercer") || 
    nameLower.includes("harvey") ||
    nameLower.includes("dominic") ||
    nameLower.includes("alfred") ||
    nameLower.includes("check") ||
    nameLower.includes("winston")
  ) {
    if (nameLower.includes("brandon") || nameLower.includes("pierce")) {
      return "/portraits/brandon_pierce.png";
    }
    if (nameLower.includes("alfred") || nameLower.includes("check")) {
      return "/portraits/alfred_check.png";
    }
    return "/portraits/marcus_vance.png";
  }

  // Default neutral portrait fallback
  return "/portraits/sloane_cross.png";
}
