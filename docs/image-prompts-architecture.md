# Original marketplace architecture and category imagery

Generated on 2026-10-30 with the built-in `image_gen.imagegen` tool, in separate calls for each asset. These are original images; the supplied desktop and mobile screenshots informed visual direction only and were not embedded, cropped, or reused. No CLI/API fallback was used.

All generated assets were visually inspected for recognizable subject, warm ivory/bronze/charcoal consistency, readable tight composition, and absence of logos, writing, or watermarks. WebP files were created by proportional Lanczos downscaling and quality 88 (default) or 84 (small variants), without changing the scene. Source PNGs remain at the generator’s original paths listed below, outside `public`, to avoid unnecessary payload duplication.

## Deliverables

| Asset          | Public path                        | Responsive widths |
| -------------- | ---------------------------------- | ----------------- |
| Residence hero | `/images/hero/residence.webp`      | 1920, 960, 640    |
| Cement         | `/images/categories/cement.webp`   | 640, 320          |
| Rebar          | `/images/categories/rebar.webp`    | 640, 320          |
| Stone          | `/images/categories/stone.webp`    | 640, 320          |
| Bathroom       | `/images/categories/bathroom.webp` | 640, 320          |
| Lighting       | `/images/categories/lighting.webp` | 640, 320          |
| Doors          | `/images/categories/doors.webp`    | 640, 320          |
| Tools          | `/images/categories/tools.webp`    | 640, 320          |

Variants add a width suffix before `.webp`, for example `residence-640.webp` and `cement-320.webp`. The hero is approximately 2.5:1 (1920×768, 960×384, 640×256); categories are 4:3 (640×480, 320×240).

## Prompts and source files

### hero

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-666bc5bd-63ca-4f5c-8f87-71cd98f5e47e.png`

```text
Use case: photorealistic-natural. Asset type: premium Iranian construction materials marketplace full-width website hero background, landscape approximately 2.5:1. Create an ORIGINAL high-end architectural photograph of a beautiful contemporary residence at dusk, crisp monolithic charcoal concrete and natural stone volumes, warm honey light glowing from floor-to-ceiling windows and refined living areas, a few elegant olive trees, warm timber soffit, shallow wide stone steps. Composition is essential: wide 2.5:1 horizontal frame, the LEFT 40 percent is an expansive dark solid charcoal stone exterior wall and subtle shadowed garden with calm dark low-detail negative space for future headline; the residence's glass living room, warm lamps and interesting architecture occupy the RIGHT 60 percent. Cinematic but credible architectural photography, calm evening sky, physically realistic materials and light, subtle bronze accents, luxury restrained editorial visual language. No people, no text, no logos, no watermark, no collage, no website interface. Output one photograph only.
```

### cement

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-8c5402ca-714f-45f8-b9b8-e49ea5c96bbf.png`

```text
Use case: product-mockup. Asset type: category tile for a premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic editorial product photograph, landscape 4:3 composition. A small sculptural stack of three plain unbranded ivory kraft cement bags with realistic folded seams and slightly dusty paper, a modest mound of light gray cement powder next to them on a charcoal stone work surface. Tight uncluttered composition, subject filling most of image yet all main bags visible. Soft side light, warm ivory and pale gray, stone and subdued bronze color feeling, premium honest material textures. Calm neutral stone studio background, enough material details for a small UI tile. No labels or writing at all, no logos, no text, no watermark, no people, no frame, no collage. One photograph.
```

### rebar

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-081ac492-d454-4304-9760-cafd349df3d4.png`

```text
Use case: product-mockup. Asset type: category tile for premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic editorial product photograph, landscape 4:3 composition. A close cropped substantial tidy bundle of dark steel reinforcing bars stacked diagonally from the upper left to the lower right, ribbed cylindrical steel with their circular cut ends clearly seen at the front, rich realistic metallic ridges and slight factory texture. Black and charcoal steel on warm neutral gray concrete surface, soft daylight from upper left, restrained warm ivory and subtle bronze reflected light. Tight uncluttered composition readable at small UI tile size, premium honest industrial material. No writing, no logos, no text, no watermark, no people, no collage. One photograph.
```

### stone

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-0653080a-4392-4ba2-bc11-ff05f9ed0255.png`

```text
Use case: product-mockup. Asset type: category tile for a premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic editorial photograph, landscape 4:3 composition. A beautiful tactile close-up arrangement of large cream travertine and warm ivory natural stone or ceramic tile samples, overlapping rectangular slabs with distinctive delicate pores and quiet veins, geometric architectural composition in elegant beige tones, a few subtle cast shadows. Fill image with stone tile detail, premium construction materials showroom style, soft raking natural light, high material realism and beautiful restrained warm neutral palette. No writing, no text, no logos, no watermark, no people, no frame, no collage. One photograph.
```

### bathroom

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-7c30e721-bc09-4d87-a8cc-b923046e0dba.png`

```text
Use case: photorealistic-natural. Asset type: category tile for premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic premium architectural interior detail photograph, horizontal landscape 4:3. A sculptural white ceramic countertop basin with curved organic rim and a refined brushed brass/gold tall single-lever faucet, elegant cream stone vanity and warm beige travertine wall behind. Tight crop with basin and faucet both visible, basin centered lower frame and faucet upper right, quiet luxury editorial bathroom style. Realistic ceramic glaze, fine brushed metal and tactile matte stone, soft natural window light, ivory and warm stone palette with bronze accent, no people. No labels, no writing, no text, no logos, no watermark, no frame, no collage. One photograph.
```

### lighting

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-a449113f-ea97-46c8-9737-3cee214d494a.png`

```text
Use case: photorealistic-natural. Asset type: category tile for premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic premium architectural interior detail photograph, horizontal landscape 4:3. Three elegant matte black pendant lamps with different gently tapered sculptural shades hang at slightly different heights, their warm interior lights softly illuminate a quiet beige living room wall, subtle dried olive foliage at far right. Lamps dominate the foreground, warm ivory plaster background with very minimal architectural depth, refined charcoal black and warm stone palette. Tactile powdercoated metal, realistic warm bulbs and soft indirect light, high-end editorial photography, tight crop that reads as lighting category at small tile size. No people, no writing, no text, no logos, no watermark, no frame, no collage. One photograph.
```

### doors

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-3b22d7ca-c55c-4df7-9cc0-8722a868a1a1.png`

```text
Use case: photorealistic-natural. Asset type: category tile for premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic high-end architectural detail photograph, horizontal landscape 4:3. A beautifully crafted tall warm walnut timber entrance door, subtle vertical grain, a slim elegant bronze handle, set into dark charcoal natural stone walls with one warm concealed light edge. Tight crop of refined door and adjacent wall, luxurious contemporary residence foyer, emphasis on real walnut grain and brass hardware with a hint of dark bronze window mullion at the side. Quiet warm intimate light, architectural precision, realistic editorial photograph, elegant warm brown and charcoal stone palette, uncluttered. No people, no writing, no text, no logos, no watermark, no frame, no collage. One photograph.
```

### tools

Source: `/home/amir/.codex/generated_images/01a18c1e-96e7-7450-916f-11dd4dc433ef/exec-b65c0e76-96ad-4cb5-a018-5cc81f019c7c.png`

```text
Use case: product-mockup. Asset type: category tile for premium Iranian construction materials marketplace. Create one ORIGINAL photorealistic editorial product photograph, horizontal landscape 4:3. One professional black cordless drill with a subtle bronze accent and durable rubberized grip, short drill bit pointing left, large battery base resting on a warm ivory stone workshop countertop, two small steel socket accessories nearby. Drill is entirely unbranded with no writing or symbols, fills the image and is clearly recognizable, balanced tight product composition. Neutral beige and charcoal stone studio background, soft realistic side light, tactile rugged materials and high-end construction catalog look. No text, no logos, no watermark, no people, no frame, no collage. One photograph.
```
