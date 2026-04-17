# Event System

This project separates `raw event intake`, `reviewed event drafts`, and `approved site event metadata`.

## The short version

- Do not hand-edit event rows directly in `events.html`.
- Use the workspace folders for intake and cleanup.
- The live site reads from `data/events/events-manifest.js`.
- Aurora events can stay empty until you are ready to repopulate them.

## Recommended workflow

1. Drop new event notes, screenshots, exports, or links into `event-workspace/inbox/`
2. Clean and normalize them in `event-workspace/processed/`
3. Move approved event notes or city-ready drafts into `event-workspace/approved/`
4. Add the final event metadata entry in `data/events/events-manifest.js`

## Storage layout

```text
event-workspace/
  inbox/
  processed/
  approved/
```

```text
data/
  events/
    events-manifest.js
```

## Manifest fields

Each event entry should include:

- `id`
- `city`
- `bucket`
- `dateLabel`
- `title`
- `costLabel`
- `costType`
- `timeLabel`
- `locationLabel`
- `audienceLabel`
- `href`
- `sourceType`
- `status`

## Suggested source types

- `manual`
- `city_source`
- `community_submission`
- `partner`

## Suggested statuses

- `pending`
- `approved`
- `needs_review`
- `archived`

## City expansion

Keep one shared manifest format across cities.

That means Aurora, Centennial, Parker, and future cities should all use the same event fields so the page can sort and filter by city without custom page logic each time.
