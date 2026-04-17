# Photo System

This project separates `raw photo intake`, `approved web photos`, and `photo metadata`.

## The short version

- Do not point the live site at random absolute Desktop file paths.
- Use your Desktop as a working/staging area.
- Copy approved photos into the repo only after they are renamed, reviewed, and attached to metadata.
- The site reads from `data/photos/park-photo-manifest.js`.

## Recommended workflow

1. Drop new photos into `photo-workspace/inbox/`
2. Rename/select/edit them in `photo-workspace/processed/`
3. Move approved web-ready files into a repo-served folder under `images/parks/...`
4. Add the metadata entry in `data/photos/park-photo-manifest.js`

## Why not link directly to Desktop?

Absolute Desktop paths like `/Users/...` or `/home/...` are not a good long-term site strategy:

- they are local-machine specific
- they break for deployments
- they are hard to review in git
- they do not support moderation or licensing cleanly

So the better mental model is:

- Desktop = your intake/staging workspace
- Repo images = approved site assets
- Manifest = truth about source, credits, license, and display role

## Storage layout

Approved site images should eventually live like this:

```text
images/
  parks/
    co/
      aurora/
        utah-park/
          hero-01.jpg
          gallery-01.jpg
      centennial/
        cherry-park/
          hero-01.jpg
```

Raw/staging files can live like this:

```text
photo-workspace/
  inbox/
  processed/
  approved/
```

## Manifest fields

Each photo entry should include:

- `id`
- `role` such as `hero` or `gallery`
- `src`
- `thumb`
- `alt`
- `caption`
- `creditName`
- `creditUrl`
- `license`
- `sourceType`
- `status`
- `sortOrder`

## Source type suggestions

- `personal`
- `public_domain`
- `creative_commons`
- `partner`
- `contributor`
- `user_upload`

## Status suggestions

- `pending`
- `approved`
- `needs_review`
- `rejected`

## Future contributor/user uploads

When contributor uploads arrive later, keep the same manifest fields and add moderation instead of inventing a second system.

That means every uploaded photo should still end up as:

- an approved web asset
- plus a metadata record with source, credit, license, and status
