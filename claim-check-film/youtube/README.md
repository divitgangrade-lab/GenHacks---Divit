# YouTube upload package

| Field | Value |
|---|---|
| Video file | `../claim-check.mp4` (4K, 129 MB) — or `../claim-check-1080p.mp4` (68 MB) if the connection is slow |
| Title | `Claim Check — the claim, the sentence, the article (GenHacks 2026)` |
| Thumbnail | `thumbnail_1280x720.jpg` — 1280×720, 88 KB (the limit is 2 MB) |
| Description | copy all of `description.txt` |
| Category | Science & Technology |
| Visibility | Public, or Unlisted until the Devpost page is submitted |
| Audience | Not made for kids |
| Tags | `claim check, EU green claims, directive 2024/825, greenwashing, consumer protection, bookmarklet, GenHacks 2026, hackathon` |
| Chapters | 13, in the description; read the note below before uploading |

## Chapters

The description lists all thirteen exhibits, as asked:

```
00:00 The claim
00:10 The title
00:17 The law and its date
00:31 Three ways to say nothing
00:43 The page, read in the browser
00:53 Anatomy of one finding
01:03 Six rules
01:10 The decoy
01:18 Install
01:24 What leaves the page
01:32 The dated run
01:41 What it will not do
01:48 A check, not a rewrite
```

**YouTube only turns a list into chapters when every chapter runs at least 10 seconds** — nine of these exhibits are shorter than that (the title is 7.1 s, install 6.4 s). Uploaded as-is, YouTube will show the thirteen times as a plain list rather than as chapter markers, which is still readable and still accurate.

If you want working chapter markers, paste this eight-chapter version instead. It merges neighbouring exhibits so that each chapter clears 10 seconds, and keeps the same wording for the seven that fit:

```
00:00 The claim, and the title
00:17 The law and its date
00:31 Three ways to say nothing
00:43 The page, read in the browser
00:53 One finding, and six rules
01:10 The decoy, and installation
01:24 What leaves the page, and the run
01:41 The limits, and the end card
```

Both lists are in `chapters.json` if you want to script the upload later.

## Thumbnail

Drawn by the film's own renderer, not cropped from a frame: `renderThumb()` in `../film.js` composes the title, the marked sentence, the citation and a slammed `BANNED` stamp on the same cream paper and red halftone field as the poster. It is rendered at 2560×1440 and scaled to 1280×720, so the type stays crisp, and it was checked at 320 px wide — the width YouTube actually shows next to a search result — where `CLAIM CHECK` and `BANNED` are the two things that still read.

Rebuild it with:

```sh
node ~/lemo-opuscar/core/render/still.mjs . 0 --q 'thumb=1' --size 2560x1440 --prefix thumb_ --out out/thumb
ffmpeg -y -i out/thumb/thumb_0.jpg -vf scale=1280:720:flags=lanczos -q:v 3 youtube/thumbnail_1280x720.jpg
```

## Pinned comment (optional)

> The page in the film is a demo page written for it, and the run shown is 13 pages from 21 November 2026 — a pilot, not a survey. The bookmark: divitgangrade-lab.github.io/GenHacks---Divit/
