# CREDITS

Every third-party element in `claim-check.mp4`, with its source and licence.

## Typefaces

| Face | Use | Source | Licence |
|---|---|---|---|
| Playfair Display | headlines, numerals, quotes | Google Fonts, `ofl/playfairdisplay` | SIL Open Font License 1.1 |
| Inter | statements, labels, caption bar | Google Fonts, `ofl/inter` | SIL Open Font License 1.1 |
| JetBrains Mono | HUD, case number, citations, URLs | Google Fonts, `ofl/jetbrainsmono` | SIL Open Font License 1.1 |

The three files are self-hosted in `fonts/` and loaded from disk; the film makes no network request at render time.

## Voice

Kokoro-82M (`kokoro-v1.0.onnx`, `voices-v1.0.bin`), voice `bm_fable` at speed 0.80, run locally by the library's `core/tts/tts.py`. The take is then processed in `mix.py` (presence, consonant bite, saturation, parallel compression, phrase-level contrast); no word is altered.
Model and voices: hexgrad, Apache License 2.0; ONNX export by Taylor Chu (thewh1teagle/kokoro-onnx). The narration is synthetic speech generated for this film; no human recording is used.

## Music and sound effects

Synthesized for this film in `mix.py` with numpy — kick, snare, hats, bass, pad, marimba-like pluck, stamp boom, paper, whoosh, typewriter ticks, channel ticks. No sample library, no recorded music, no stock audio.

## Pictures

Every frame is drawn in code (`film.js`, canvas 2D) on the Halftone Dossier style from the Lemo-Opuscar library. The three photographic elements are screenshots of our own running product, taken from the live site on 21 November 2026:

- the demo page (`img/demo.png`),
- the bookmarklet panel (`img/panel.png`), captured from the panel's own shadow root at device scale 3.

No third-party photograph, footage, map, logo or illustration appears in the film, and no image generator was used.

## Pipeline

Lemo-Opuscar (guides, renderer, TTS and audio helpers) — github.com/lemomo-ai/lemo-opuscar; the library's own licence and third-party terms are stated in its `LICENSE` and `LICENSES/`. The film carries no LemoLab branding. Dependencies used to build it: Node.js, Playwright's headless Chromium, FFmpeg, numpy, soundfile.

## The product

Claim Check — the checker, its rule set, its corpus report and its demo page — is this repository's own work. The directive text quoted in the film is from Directive (EU) 2024/825 (EUR-Lex), used as a legal citation.
