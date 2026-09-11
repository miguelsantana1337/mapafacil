# Design QA — editor mobile vazio

- Source visual truth: `/tmp/codex-remote-attachments/01a09270-256e-79d2-801e-dfc8813af740/5194ADFC-B6BF-420F-BD11-9B6C38385735/1-Foto-1.jpg`
- Implementation screenshot: `/tmp/mapafacil-design-qa/implementation-mobile.png`
- Side-by-side comparison: `/tmp/mapafacil-design-qa/comparison.png`
- Viewport: 430 × 932 CSS px, device scale factor 1
- Source pixels: 1217 × 1280; editor reference crop normalized from 297 × 640 to 430 × 932
- Implementation pixels: 430 × 932
- State: newly-created blank map with one editable central topic

## Full-view comparison evidence

The comparison preserves the reference's white canvas, restrained blue palette, compact top bar, rounded central topic, bottom action navigation and bottom-sheet interaction language. The large empty canvas is intentional product behavior requested by the user, replacing the populated example shown in the reference.

## Focused region comparison evidence

A separate crop was not needed: at 860 × 932 the header, central topic and complete bottom interaction region are legible at 1:1 implementation density. The implementation uses the same hierarchy while reserving the canvas for user-created content.

## Required fidelity surfaces

- Fonts and typography: compact sans-serif hierarchy, bold map title and legible mobile labels match the reference direction.
- Spacing and layout rhythm: header, open canvas, central topic and persistent bottom actions follow the same vertical structure.
- Colors and visual tokens: white canvas, deep ink and saturated Mapa Fácil blue are aligned with the source.
- Image quality and assets: this editor state contains no photographic or illustrative assets; no placeholder imagery is used.
- Copy and content: Portuguese labels are concise and the empty-state prompt directly explains the first action.

## Interaction verification

- Created a new map and confirmed it contains exactly one central topic.
- Edited the central topic from `Digite sua ideia central` to `Lançamento do produto`.
- Opened the mobile Add sheet and created a top-level topic.
- Edited the new topic to `Público-alvo`.
- Tapped the existing central topic again and confirmed that editing reopens.
- Confirmed the mobile actions for structure, style and more remain reachable.

## Comparison history

- Initial implementation: no actionable P0, P1 or P2 visual mismatch. The empty canvas is the requested functional deviation from the populated reference.

## Follow-up polish

- P3: replace the remaining legacy text-symbol icons with a dedicated icon set in a future brand-system pass.

final result: passed
