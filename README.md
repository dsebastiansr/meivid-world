# Nuestra islita 🏝️💕

Una islita 3D para guardar recuerdos. Hecha con Vite + React + TypeScript,
React Three Fiber, drei, Rapier (física) y ecctrl (personaje).
La interfaz (botones, modal) usa Tailwind CSS v4, shadcn/ui y los íconos de lucide-react.

## Fases

- [x] **Fase 1 — Base jugable:** isla, personaje con colisiones, cámara, árboles y 2 recuerdos que abren el modal.
  Extra: Tailwind + shadcn + lucide para la interfaz.
- [x] **Fase 2 — Estilo visual:** toon shading, mundo curvo, cielo con degradado, nubes, agua animada
  con espuma, y sombras reales (un sol cuyo mapa de sombras sigue al personaje, barato en celular).
- [~] **Fase 3 — Modelos reales:** árbol, roca, flor, banca y cartel ya usan modelos de Quaternius y Kenney.
  El personaje es un panda animado. Falta el buzón (usa forma de relleno). Ver `public/models/LEEME.md`.
- [ ] **Fase 4 — Backend con Supabase:** login para nosotros dos, base de datos, subida de fotos
  y un modo para colocar recuerdos nuevos en la isla desde la página.
- [ ] **Fase 5 — Deploy en Vercel.**

## Cómo correrlo

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Para probarlo en tu celular (en la misma red WiFi): `npm run dev -- --host`
y abre en el celular la dirección "Network" que aparece en la terminal.

## Controles

- **Computadora:** WASD o flechas para caminar, Shift para correr, E o Enter para ver un recuerdo, Esc para cerrarlo.
- **Celular:** joystick abajo a la izquierda, botón "Ver recuerdo" a la derecha.

## Qué archivo tocar para…

> Para todo lo del mundo 3D (terreno, agua, cielo, árboles, sombras…) hay una guía más completa en
> [`src/world/README.md`](src/world/README.md).

| Quiero…                                   | Archivo                                    |
| ----------------------------------------- | ------------------------------------------ |
| Agregar / editar recuerdos                | `src/data/memories.json`                   |
| Poner nuestras fotos                      | `public/memories/` (y la ruta en el JSON)  |
| Cambiar cuántos árboles, flores, rocas… hay y dónde | `src/world/scenery/scatter.ts`   |
| Poner fogata, tienda, cercas, canoa… a mano | `src/data/decorations.ts`                |
| Cambiar la forma de la isla, colinas y caminos | `src/world/terrain/terrainData.ts` |
| Cambiar colores del mundo, luces, tamaño de isla, velocidad, cámara | `src/config.ts` |
| Ajustar curvatura del mundo, sombras, escalones toon, luces | `src/config.ts` (`CURVE`, `SHADOWS`, `TOON`, `LIGHTS`) |
| Usar modelos GLB (tamaño, giro, animaciones) | `src/data/models.ts` + `public/models/LEEME.md` |
| Cambiar cómo se ve el personaje de relleno           | `src/player/CharacterPrimitive.tsx`      |
| Cambiar cómo se ve una banca, buzón, etc. | `src/memories/objects/*.tsx`               |
| Agregar un tipo de objeto de recuerdo nuevo (como las calabazas) | `src/types.ts`, `src/data/models.ts`, `src/memories/objects/index.ts` y `src/editor/Palette.tsx` |
| Cambiar el modal / botones                | `src/ui/`                                  |
| Cambiar colores, fuente y redondeo de la interfaz | `src/index.css` (variables en `:root`) |

### Un recuerdo en `memories.json`

```json
{
  "id": "playa",                  // único, sin espacios
  "titulo": "El día de la playa",
  "fecha": "2024-08-10",          // AAAA-MM-DD
  "texto": "Lo que quieras escribir…",
  "foto": "/memories/playa.jpg",  // la primera foto (archivo dentro de public/memories/)
  "fotos": ["/memories/playa.jpg", "/memories/playa2.jpg"], // opcional: todas las fotos, en orden
  "posicion": [2, 0, 6],          // [x, y, z]; la isla mide ~14 de radio
  "rotacion": 45,                 // opcional, en grados
  "tipo": "flor"                  // banca | buzon | foto | flor | calabaza | calabaza2 | sillas | tocadiscos | radio
}
```

## Estructura

```
src/
  config.ts            ajustes generales
  types.ts             forma de un recuerdo
  data/                datos de fábrica: recuerdos, decoración, catálogo del editor, modelos
  store/               estado: el mundo guardado (useWorldStore), el editor y el juego
  world/               el mundo 3D, por carpetas (terrain, water, sky, scenery, models, rendering, camera)
                       → mira src/world/README.md: qué cambiar para cada cosa
  editor/              modo editar: menú vertical, formulario de recuerdos, apuntar al suelo, miniaturas
  player/              personaje, teclas, posición compartida
  memories/            objetos de recuerdo + detección de cercanía
  ui/                  botón, modal, joystick, ayuda de controles
  components/ui/       componentes de shadcn (button, dialog, input…)
  lib/utils.ts         la función cn()
scripts/
  make-previews.py     prepara las imágenes de vista previa del menú del editor
public/
  previews/            imágenes del menú (generadas)
  memories/            fotos
  models/              modelos .glb (ver LEEME.md)
```

## Interfaz: Tailwind + shadcn + lucide

- **Imports con `@/`:** `@/components/ui/button` es lo mismo que `src/components/ui/button`.
- **Componentes de shadcn** viven en `src/components/ui/`. Son código tuyo: ábrelos y cámbialos.
  Para agregar más (input, card, sheet…):

  ```bash
  npx shadcn@latest add input card
  ```

- **`cn()`** (en `src/lib/utils.ts`) junta clases y la última gana, así puedes
  personalizar un componente desde afuera sin tocar su archivo:

  ```tsx
  <Button className={cn('rounded-full', isActive && 'bg-secondary')}>Hola</Button>
  ```

- **Íconos:** busca en https://lucide.dev/icons y úsalos así:
  `import { Heart } from 'lucide-react'` → `<Heart className="size-5" />`
- **Celular:** el prefijo `pointer-coarse:` aplica clases solo en pantallas táctiles
  (ver `src/ui/InteractButton.tsx`).

## Modo editar

Botón **Editar** (arriba a la derecha). Elige una pieza en la paleta y esa **herramienta se queda activa**:

- **Clic en el suelo** coloca una. Sigue activa para poner otra, sin volver a elegir ni confirmar.
- **Mantén el clic y arrastra** para "pintar" varias seguidas (una fila de cercas, un campo de flores).
  Todo el trazo se deshace de una vez.
- **Rueda del ratón** (o `R`) gira la pieza. **Clic derecho**, `Esc` o el botón **Terminar** sueltan la herramienta.
- **Menú vertical:** a la izquierda en computadora (a la derecha en celular, porque a la izquierda está el joystick).
  Arriba, las pestañas (Recuerdos · Naturaleza · Campamento · Construcciones); en medio, una cuadrícula de fichas
  **con la imagen de cada pieza**; abajo, lo que estás haciendo (colocar, o el objeto seleccionado).
  Elegir otra ficha cambia de herramienta sin salir; la activa se ve marcada. Se puede plegar con el botón ◀.
- **Variantes:** al elegir una familia aparecen sus variantes (Árbol: normal, grande, retorcido, seco…) y puedes
  cambiar de una a otra sin soltar la herramienta. Recuerda la última que usaste de cada familia.
  También puedes **cambiar la variante de algo ya colocado**: tócalo y elige otra.
- **Tocar un objeto** de la isla lo selecciona: **Mover**, **Otra igual** (activa la herramienta con esa pieza y su giro),
  girar, borrar y, si es un recuerdo, **Recuerdo** para cambiar su texto y foto.
- **Recuerdos nuevos** (banca, buzón, foto, flor): cada clic abre un formulario (título, fecha, texto, foto).
  Al guardarlo, la herramienta sigue activa para poner el siguiente.
- **Deshacer:** botón ↶ del panel o `Ctrl+Z` (hasta 40 pasos).
- **Celular:** toca o arrastra para mover la vista previa y pulsa **Colocar** (sigues hasta pulsar **Terminar**).
- Menú **⋯**: Exportar la isla a un archivo, Importar uno, o Restaurar la isla de fábrica (se puede deshacer).
- Atajos: `R` gira · `Enter` coloca · `Esc` termina · `Supr` borra lo seleccionado · `Ctrl+Z` deshace.

### La isla por defecto

La isla que ve cualquiera que abre la página por primera vez (o que pulsa **Restaurar isla**) sale de dos archivos:
`src/data/memories.json` (los recuerdos) y `src/data/props.json` (la decoración). Son justo lo que exporta el editor.

Para cambiarla: arma tu isla en el editor, **Editar → ⋯ → Exportar isla**, y copia las `memories` del archivo a
`memories.json` y las `props` a `props.json`. Ojo con las fotos: el editor las exporta **incrustadas** (texto
enorme, ~100 KB por foto). Mejor guárdalas como archivos en `public/memories/` y pon sus rutas
(`"/memories/mi-foto-1.jpg"`) en `foto` y `fotos`, así la página no carga 1,5 MB de fotos desde el inicio.

Tu propia isla, la que editas, se guarda en TU navegador y tiene prioridad sobre la de fábrica; por eso
cambiar estos archivos no se nota en tu navegador hasta que pulses **Restaurar isla**.

Todo se guarda en el navegador (localStorage) y sobrevive al recargar, pero **solo en ese navegador**: por eso
existe Exportar. En la Fase 4 se cambia por Supabase (solo hay que tocar `src/store/useWorldStore.ts`).

| Quiero…                                      | Archivo                         |
| -------------------------------------------- | ------------------------------- |
| Agregar una pieza o variante a la paleta | `src/data/catalog.ts` (una línea en `variants` de su familia) |
| Imágenes de vista previa del menú | `scripts/make-previews.py` (PNG de Kenney → `public/previews/`); las demás se dibujan en vivo (`src/editor/thumbnails.ts`) |
| Cambiar cómo se guardan los datos            | `src/store/useWorldStore.ts`    |
| Cambiar el panel del editor                  | `src/editor/EditorPanel.tsx`    |
| Cambiar el formulario de recuerdos           | `src/editor/MemoryForm.tsx`     |

Notas: los datos de fábrica (`memories.json`, `decorations.ts`) solo se usan la primera vez o al Restaurar.
Las fotos nuevas se reducen y guardan dentro del navegador (unas 30 caben); si se llena, el panel avisa.
Los árboles y plantas repartidos solos se quitan donde coloques algo encima, pero no se vuelven a repartir.

## El recuerdo como librito

Al acercarte a un objeto y pulsar **Ver recuerdo**, se abre un libro grande (`src/ui/book/`):

- **Cada hoja tiene dos páginas** (en celular, una sobre otra): fotos de un lado y texto del otro.
- **El texto largo se reparte solo** en varias hojas (usa columnas de CSS y vuelve a repartirse si cambias
  el tamaño de la ventana). No hay que cortarlo a mano. El título y la fecha abren la primera página.
- **Varias fotos:** una por hoja, a la izquierda. Si sobran fotos después del texto, ocupan ambas páginas.
  Tocar una foto la amplía.
- **Pasar de hoja:** botones, puntitos de abajo, flechas del teclado ← → o deslizando con el dedo.
- **Animación de pasar página (GSAP):** en pantallas anchas la hoja se **voltea en 3D** sobre el lomo, como el cuaderno negro de
  referencia: una hoja rígida de dos caras con la perspectiva en el contenedor, así que al girar **sobresale del libro**
  sola (su borde libre se acerca a la cámara). Sin sombras ni efectos encima. Su sombra cae suave sobre las páginas de abajo, siguiendo su borde (hacia
  adelante gira la página derecha; hacia atrás, la izquierda). En celular
  las hojas se deslizan. Con "reducir movimiento" activado, el cambio es directo.
- **Animación de apertura (GSAP):** cerrado, el libro solo enseña su portada (media página, centrada, con el corazón, el título
  y la fecha). Al abrirse **de derecha a izquierda**, la portada gira sobre el lomo y el libro se despliega; el reverso de
  la portada (su tapa interior) queda como la página izquierda de la primera hoja, así que esa página no se ve hasta que la
  portada la cubre. El marco café de atrás también se anima: empieza pegado a la portada y se expande hasta cubrir
  todo el libro. Tocar la portada acelera la animación. Con "reducir movimiento" activado, el libro aparece ya abierto.
- **Desde el editor** (Editar → tocar un recuerdo → Editar recuerdo) puedes agregar varias fotos de una vez,
  cambiarles el orden y quitarlas.

| Quiero…                                       | Archivo                         |
| --------------------------------------------- | ------------------------------- |
| Cambiar cómo se reparten fotos y texto        | `src/ui/book/spreads.ts`        |
| Cambiar el aspecto del libro (colores, letra) | `src/ui/book/Book.tsx`          |
| Cambiar la animación de apertura (tiempos, giro) | `src/ui/book/useBookIntro.ts`   |
| Cambiar la animación de pasar página (duración, perspectiva) | `src/ui/book/Flipper.tsx` (`FLIP_DURATION`, `PERSPECTIVE`) |
| Cambiar el tamaño del libro o su portada      | `src/ui/MemoryModal.tsx`        |
| Cambiar cómo se reparte el texto en páginas   | `src/ui/book/TextFlow.tsx`      |

## Estilo visual (Fase 2)

- **Toon:** usa `<ToonMaterial color="..." />` (`src/world/rendering/ToonMaterial.tsx`) en vez de materiales normales.
- **Mundo curvo:** `src/world/rendering/curvedWorld.ts` parchea todos los materiales a la vez; ajusta `CURVE` en `config.ts`
  (y recarga la página). Los suelos grandes deben tener varios cortes (ver `Island.tsx`), si no, no se doblan.
- **Sombras:** envuelve un objeto en `<Shadowed>` para que proyecte/reciba sombra.
  Si el celular va lento: `SHADOWS.enabled = false` en `config.ts`.
- **Agua, cielo, nubes:** `src/world/water/Water.tsx`, `sky/Sky.tsx`, `sky/Clouds.tsx`.

## Tips

- Para ver las cajas de colisión, en `src/world/Scene.tsx` cambia `<Physics>` por `<Physics debug>`.
- Para usar modelos de Kenney/Quaternius, lee `public/models/LEEME.md`.

## Sonido (`src/audio/`)

| Archivo | Qué hace |
| --- | --- |
| `songs.ts` | Lista de canciones (`public/songs/`), `HOME_SONG` y `trackFor(recuerdo)` (qué suena en cada recuerdo) |
| `music.ts` | Reproduce una canción a la vez con fundido; empieza en el primer toque/tecla (política de autoplay) |
| `sfx.ts` | Efectos sintetizados con WebAudio (pasos, aterrizar, acercarse, libro, hojas, clics, editor). Edita su "receta" para cambiar el sonido |
| `useGameAudio.ts` | Conecta todo con los stores del juego (abrir/cerrar recuerdo, editor, botones) |
| `useAudioStore.ts` | Silenciado (se recuerda); botón en `ui/MuteButton.tsx` |

- Sin recuerdo abierto suena `home.m4a`; al abrir uno suena su canción, y si no tiene, `home`.
- Asignar canción: en `memories.json` agrega `"cancion": "/songs/x.m4a", "cancionInicio": 2` (segundo de inicio), o elígela en el formulario del recuerdo.
- Los `.mp4` originales se convirtieron a `.m4a` (solo audio): pesaban 80 MB, ahora ~3 MB cada uno.
