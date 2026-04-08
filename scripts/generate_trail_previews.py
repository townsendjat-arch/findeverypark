#!/usr/bin/env python3

import json
import math
from pathlib import Path


TRAILS_PATH = Path("data/trails.geojson")

PARKS = [
    {
        "name": "Utah Park",
        "slug": "utah-park",
        "city": "Aurora",
        "coord": (-104.842879, 39.683831),
        "out": Path("images/parks/co/aurora/utah-park/trail-preview.svg"),
        "title": "Utah Park",
        "subtitle": "Trail access preview",
    },
    {
        "name": "DeLaney Farm",
        "slug": "delaney-farm",
        "city": "Aurora",
        "coord": (-104.805816, 39.713248),
        "out": Path("images/parks/co/aurora/delaney-farm/trail-preview.svg"),
        "title": "DeLaney Farm",
        "subtitle": "Nearby trail access preview",
    },
]


def lonlat_to_xy(lon, lat, bbox, width, height, pad):
    min_lon, min_lat, max_lon, max_lat = bbox
    usable_w = width - pad * 2
    usable_h = height - pad * 2
    if max_lon == min_lon:
        x = width / 2
    else:
        x = pad + ((lon - min_lon) / (max_lon - min_lon)) * usable_w
    if max_lat == min_lat:
        y = height / 2
    else:
        y = pad + (1 - ((lat - min_lat) / (max_lat - min_lat))) * usable_h
    return x, y


def point_segment_distance(point, a, b):
    px, py = point
    ax, ay = a
    bx, by = b
    dx = bx - ax
    dy = by - ay
    if dx == 0 and dy == 0:
      return math.hypot(px - ax, py - ay)
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0, min(1, t))
    cx = ax + t * dx
    cy = ay + t * dy
    return math.hypot(px - cx, py - cy)


def feature_min_distance(coord, line):
    min_dist = float("inf")
    for idx in range(len(line) - 1):
        dist = point_segment_distance(coord, line[idx], line[idx + 1])
        min_dist = min(min_dist, dist)
    return min_dist


def load_trails():
    data = json.loads(TRAILS_PATH.read_text())
    return data.get("features", [])


def nearby_segments(features, coord, radius_deg=0.006):
    selected = []
    for feature in features:
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "LineString":
            continue
        coords = geometry.get("coordinates") or []
        if len(coords) < 2:
            continue
        dist = feature_min_distance(coord, coords)
        if dist <= radius_deg:
            props = feature.get("properties") or {}
            selected.append(
                {
                    "coords": coords,
                    "dist": dist,
                    "name": props.get("NAME") or "",
                    "surface": props.get("SURFACE") or "",
                }
            )
    selected.sort(key=lambda item: item["dist"])
    return selected[:24]


def bbox_for_preview(coord, segments, pad_deg=0.0024):
    lons = [coord[0]]
    lats = [coord[1]]
    for seg in segments:
        for lon, lat in seg["coords"]:
            lons.append(lon)
            lats.append(lat)
    return (
        min(lons) - pad_deg,
        min(lats) - pad_deg,
        max(lons) + pad_deg,
        max(lats) + pad_deg,
    )


def make_path(coords, bbox, width, height, pad):
    points = [lonlat_to_xy(lon, lat, bbox, width, height, pad) for lon, lat in coords]
    return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in points)


def render_preview(park, features):
    width = 1200
    height = 800
    pad = 56
    coord = park["coord"]
    segments = nearby_segments(features, coord)
    if not segments:
        raise RuntimeError(f"No nearby trail segments found for {park['name']}")
    bbox = bbox_for_preview(coord, segments)

    highlight = segments[:10]
    secondary = segments[10:]

    park["out"].parent.mkdir(parents=True, exist_ok=True)

    map_x = 610
    map_y = 86
    map_w = 500
    map_h = 628
    px, py = lonlat_to_xy(coord[0], coord[1], bbox, map_w, map_h, pad)
    px += map_x
    py += map_y

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    svg.append("<defs>")
    svg.append('<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">')
    svg.append('<stop offset="0%" stop-color="#f4efe7"/>')
    svg.append('<stop offset="100%" stop-color="#e8f0e9"/>')
    svg.append("</linearGradient>")
    svg.append('<linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">')
    svg.append('<stop offset="0%" stop-color="#ffffff"/>')
    svg.append('<stop offset="100%" stop-color="#f7f4ef"/>')
    svg.append("</linearGradient>")
    svg.append('<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">')
    svg.append('<feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#12301f" flood-opacity="0.12"/>')
    svg.append("</filter>")
    svg.append("</defs>")
    svg.append(f'<rect width="{width}" height="{height}" fill="url(#bg)"/>')
    svg.append('<rect x="28" y="28" width="1144" height="744" rx="34" fill="url(#panel)" stroke="#e6ddd1" filter="url(#shadow)"/>')
    svg.append('<rect x="70" y="86" width="470" height="628" rx="28" fill="#f4efe7"/>')
    svg.append('<rect x="610" y="86" width="500" height="628" rx="28" fill="#eef3ec" stroke="#dfe7df"/>')

    for idx in range(10):
        y = map_y + 34 + idx * 58
        svg.append(f'<line x1="{map_x + 18}" y1="{y}" x2="{map_x + map_w - 18}" y2="{y}" stroke="#e3ece4" stroke-width="1"/>')
    for idx in range(7):
        x = map_x + 32 + idx * 64
        svg.append(f'<line x1="{x}" y1="{map_y + 18}" x2="{x}" y2="{map_y + map_h - 18}" stroke="#e3ece4" stroke-width="1"/>')

    for seg in secondary:
        path = make_path(seg["coords"], bbox, map_w, map_h, pad)
        path = path.replace("M ", f"M ").replace(" L ", " L ")
        path = path.replace("M", f"M").replace("L", "L")
        parts = []
        for token in path.split():
            parts.append(token)
        transformed = []
        i = 0
        while i < len(parts):
            token = parts[i]
            if token in {"M", "L"}:
                x = float(parts[i + 1]) + map_x
                y = float(parts[i + 2]) + map_y
                transformed.extend([token, f"{x:.1f}", f"{y:.1f}"])
                i += 3
            else:
                i += 1
        path = " ".join(transformed)
        svg.append(f'<path d="{path}" fill="none" stroke="#b8c6bb" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>')

    for seg in highlight:
        path = make_path(seg["coords"], bbox, map_w, map_h, pad)
        parts = path.split()
        transformed = []
        i = 0
        while i < len(parts):
            token = parts[i]
            if token in {"M", "L"}:
                x = float(parts[i + 1]) + map_x
                y = float(parts[i + 2]) + map_y
                transformed.extend([token, f"{x:.1f}", f"{y:.1f}"])
                i += 3
            else:
                i += 1
        path = " ".join(transformed)
        svg.append(f'<path d="{path}" fill="none" stroke="#2f6d49" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.96"/>')
        svg.append(f'<path d="{path}" fill="none" stroke="#f5fbf5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/>')

    svg.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="18" fill="#f4ca3d" stroke="#ffffff" stroke-width="8"/>')
    svg.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="34" fill="none" stroke="#f4ca3d" stroke-width="4" opacity="0.45"/>')
    svg.append('<rect x="92" y="110" width="126" height="34" rx="17" fill="#dceadf"/>')
    svg.append('<text x="122" y="132" font-family="DM Sans, Arial, sans-serif" font-size="14" font-weight="700" fill="#2f6d49">TRAIL ACCESS</text>')
    svg.append(f'<text x="92" y="208" font-family="Syne, Arial, sans-serif" font-size="58" font-weight="700" fill="#173423">{park["title"]}</text>')
    svg.append('<text x="92" y="258" font-family="DM Sans, Arial, sans-serif" font-size="24" fill="#5c6a61">Nearby trail context, without leaving the park page.</text>')
    svg.append('<text x="92" y="330" font-family="DM Sans, Arial, sans-serif" font-size="19" fill="#5f6d64">Use this as a utility slide in the gallery: real photos first, then a clean map card showing where trail access sits relative to the park.</text>')

    svg.append('<circle cx="112" cy="434" r="8" fill="#f4ca3d"/>')
    svg.append('<text x="132" y="440" font-family="DM Sans, Arial, sans-serif" font-size="18" font-weight="700" fill="#173423">Park location</text>')
    svg.append('<rect x="104" y="472" width="36" height="10" rx="5" fill="#2f6d49"/>')
    svg.append('<text x="156" y="482" font-family="DM Sans, Arial, sans-serif" font-size="18" font-weight="700" fill="#173423">Nearby trail geometry</text>')
    svg.append('<text x="92" y="560" font-family="DM Sans, Arial, sans-serif" font-size="17" fill="#728076">Sample generated from local trail data already in the project.</text>')
    svg.append('<text x="92" y="590" font-family="DM Sans, Arial, sans-serif" font-size="17" fill="#728076">Best used as an extra gallery card, not a replacement for photography.</text>')

    svg.append('<rect x="642" y="118" width="154" height="34" rx="17" fill="#ffffff" opacity="0.92"/>')
    svg.append('<text x="666" y="140" font-family="DM Sans, Arial, sans-serif" font-size="14" font-weight="700" fill="#2f6d49">MAP SNAPSHOT</text>')
    svg.append('<rect x="782" y="650" width="286" height="42" rx="21" fill="#ffffff" opacity="0.94"/>')
    svg.append('<text x="812" y="676" font-family="DM Sans, Arial, sans-serif" font-size="18" font-weight="700" fill="#173423">Yellow dot = park</text>')
    svg.append("</svg>")

    park["out"].write_text("".join(svg))


def main():
    features = load_trails()
    for park in PARKS:
        render_preview(park, features)
        print(f"wrote {park['out']}")


if __name__ == "__main__":
    main()
