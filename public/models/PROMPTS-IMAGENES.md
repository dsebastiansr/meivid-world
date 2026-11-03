# Prompts para generar las imágenes (para image-to-3D de Meshy)

Pega cada prompt en un generador de imágenes (ChatGPT, Gemini, Midjourney…).
Guarda cada resultado con el nombre del modelo y súbelo a Meshy (Image to 3D).

## Reglas para que Meshy las convierta bien

- **Un solo objeto**, centrado, fondo **blanco liso**, sin suelo ni sombra proyectada.
- Vista **3/4 desde arriba y un poco de lado** (como se ve en el juego), con el objeto completo dentro del cuadro.
- **Luz pareja**, sin sombras fuertes ni brillos: la luz pintada en la imagen termina "pegada" en el modelo.
- Si una imagen sale con fondo, sombras o varios objetos, regénerala. Es lo que más estropea el 3D.
- Genera 3–4 variantes por objeto y quédate con la más limpia.
- **Importante:** usa siempre el mismo bloque de estilo para que todo combine.

## Bloque de estilo (se pega al final de TODOS los prompts)

```
stylized hand-painted game asset, soft cartoon look, chunky simple shapes, slightly rounded edges,
saturated natural colors, subtle painted texture, flat even lighting, no cast shadow,
isolated single object centered on a plain pure white background, three-quarter top-down view,
full object visible, no text, no ground
```

---

## 1. Árbol → `arbol.glb`

```
A tall pine tree with layered fluffy dark-green foliage in rounded tiers, thick reddish-brown trunk,
[BLOQUE DE ESTILO]
```

## 2. Roca → `roca.glb`

```
A rounded grey boulder with a few faceted flat sides, small patches of green moss on top,
[BLOQUE DE ESTILO]
```

## 3. Banca → `banca.glb`

```
A cozy wooden park bench with a slatted seat, curved backrest and dark iron legs,
warm brown wood, [BLOQUE DE ESTILO]
```

## 4. Buzón → `buzon.glb`

```
A cute blue mailbox with a rounded roof on a short wooden post, small red flag raised,
[BLOQUE DE ESTILO]
```

## 5. Foto colgada → `foto.glb`

```
A photo frame hanging between two short wooden posts, cream-white frame with a pink photo inside,
small string lights or a little heart decoration on top, [BLOQUE DE ESTILO]
```

## 6. Flor → `flor.glb`

```
A big pink flower with soft rounded petals and a yellow center on a thick green stem with two leaves,
[BLOQUE DE ESTILO]
```

## 7. Personaje → `personaje.glb`

El personaje es el más delicado, porque Meshy necesita ver el cuerpo completo para ponerle esqueleto.

```
A cute chibi character with a big head and small body, brown hair, simple colorful clothes and small boots,
full body, standing in a neutral A-pose with arms slightly away from the body and legs apart,
front view slightly from above, [BLOQUE DE ESTILO]
```

- Pide la imagen de **cuerpo completo** y con los **brazos separados del cuerpo**.
- Genera uno para ti y otro para ella; el juego usa uno solo, pero puedes cambiarlo en `src/data/models.ts`.
- En Meshy, después de crear el modelo usa **Rig / Animate** y descarga el GLB **con las animaciones idle y walk** incluidas.

---

## Después, en Meshy

1. **Image to 3D** → sube la imagen → elige estilo cartoon / low-poly si te deja.
2. Objetos: pide pocos polígonos (**2 000–10 000**) y textura de **1024**.
3. Descarga en **GLB** y guárdalo en `public/models/` con el nombre exacto de arriba.
4. Recarga el juego. Si algo se ve mal, mira la tabla de problemas en `LEEME.md`.
