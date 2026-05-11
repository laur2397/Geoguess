# Hero Video — Instructions

Drop your real photorealistic video here as **`hero.mp4`**.

## Specifications

| Parameter        | Value                              |
|------------------|------------------------------------|
| Filename         | `hero.mp4`                         |
| Codec            | H.264 (AVC)                        |
| Resolution       | 1920×1080 minimum, 3840×2160 ideal |
| Aspect ratio     | 16:9                               |
| Duration         | 8–12 seconds                       |
| Framerate        | 24, 25 or 30 fps                   |
| Audio            | None (or muted track)              |
| Max file size    | ~25 MB recommended for fast load   |

## How it integrates

- The video plays **once automatically** when the page loads.
- It fades out (1.2 s) when:
  - The video naturally ends, OR
  - The user scrolls past 12% of the viewport height, OR
  - The user clicks the "Skip intro" button (top-right), OR
  - 14 seconds pass (hard timeout).
- After fade, the **scroll-driven Three.js cinematic** behind it takes over.
- If `hero.mp4` is missing or fails to load, the video element auto-hides
  and the 3D scene shows immediately. **Nothing breaks.**

## Where to generate the video

Use the polished prompt provided in chat — paste into one of:

- **Google Veo 3 / 3.5** — gemini.google.com (Gemini App) or aistudio.google.com
- **OpenAI Sora 2** — sora.com (with a ChatGPT Plus/Pro account)
- **Kling 2.0** — kling.kuaishou.com
- **Runway Gen-4** — runwayml.com

Or buy stock footage from:
- pond5.com (search "industrial logistics truck checkpoint 4k")
- stock.adobe.com
- storyblocks.com

## After generating

1. Download the MP4.
2. Drop it into this folder, renamed to **`hero.mp4`**.
3. Commit & push (or for `gh-pages` deploy, copy it to the gh-pages branch root).
4. Hard-refresh the live site — the video will autoplay.

## Optional: poster image

If you want a custom static frame to show while the MP4 is buffering,
replace `hero-poster.svg` with a JPG/PNG named `hero-poster.jpg` and update
the `poster` attribute in `index.html` accordingly.
