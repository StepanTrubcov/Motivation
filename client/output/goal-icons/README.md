# Goal pictograms

Generated with the built-in imagegen tool, then resized and encoded as transparent 128×128 WebP using Sharp. No database changes.

Production assets: `public/Image/goals-v1/`.
Original generated images and the exact per-image prompts: this directory, `*-source.png` and `*-prompt.txt`.

Shared final style: a single minimal flat ivory-white pictogram; moderately thick rounded strokes; transparent background; centered square composition with generous padding; no text, tile, shading, glow, shadows, texture, or 3D. Human figures are abstract circle-and-line stick figures with no gender cues, face, hair, clothing, or anatomical silhouettes.

Final subjects: running stick figure; walking stick figure; exercising stick figure; airflow lines; laptop; clock; cleaning brush; open book; light bulb; praying hands; microphone; star; crossed-out candy; bullseye target.

Assignment is defined in `src/lib/goalIcons.js` and shared by the main goal cards and yesterday's goals. The icon is decorative; the goal title remains the accessible text.
