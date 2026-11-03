# `src/world/` — el mundo 3D

Todo lo que se dibuja dentro del canvas 3D: el terreno, el agua, el cielo, los árboles,
los modelos y los efectos visuales. (La interfaz en HTML está en `src/ui/` y `src/editor/`;
el personaje en `src/player/`; los objetos de recuerdo en `src/memories/`.)

## Mapa de carpetas

```
world/
├── Scene.tsx            Arma el mundo: junta todo lo de abajo. Empieza leyendo aquí.
│
├── terrain/             EL SUELO
│   ├── terrainData.ts     La forma de la isla: costa, colinas, playa, caminos (puro cálculo)
│   ├── TerrainMesh.tsx    Dibuja el suelo y crea su colisión
│   ├── grassTexture.ts    La textura de trazos del pasto
│   └── IslandBounds.tsx   Paredes invisibles en la costa (para no caer al agua)
│
├── water/
│   └── Water.tsx          El agua: colores, olas y espuma (un shader)
│
├── sky/                 CIELO Y LUZ
│   ├── Sky.tsx            Degradado del cielo
│   ├── Clouds.tsx         Nubes que pasan
│   └── Sun.tsx            El sol: la luz principal y las sombras
│
├── scenery/             LO QUE HAY SOBRE LA ISLA
│   ├── scatter.ts         Reparte árboles, rocas, flores, pasto… (una vez, con semilla fija)
│   ├── Scenery.tsx        Dibuja lo repartido y le pone colisión
│   ├── Landmarks.tsx      Dibuja la decoración colocada a mano (fogata, cercas…)
│   └── PropView.tsx       Una pieza de decoración: modelo + colisión + luz
│
├── models/              CARGAR MODELOS 3D (.glb)
│   ├── useModel.ts        Carga un GLB y lo ajusta (tamaño, pies en el suelo, toon)
│   ├── GlbModel.tsx       Muestra un GLB
│   ├── ModelOrFallback.tsx  Muestra el GLB o una forma simple si falla
│   ├── ModelBoundary.tsx    Evita que un modelo roto tire todo el juego
│   ├── useModelExists.ts    ¿Existe el archivo? (lo usa el personaje)
│   └── InstancedModel.tsx   Dibuja MUCHAS copias de una pieza de golpe (árboles, pasto…)
│
├── rendering/           CÓMO SE VE TODO (estilo gráfico)
│   ├── curvedWorld.ts     El mundo curvo (parchea los shaders de three.js)
│   ├── ToonMaterial.tsx   Material "caricatura" para usar en JSX
│   ├── toonGradient.ts    Los escalones de luz del toon
│   ├── toonify.ts         Convierte los materiales de un GLB a toon
│   └── Shadowed.tsx       Envoltorio: hace que un objeto proyecte/reciba sombras
│
└── camera/
    └── FollowCamera.tsx   La cámara que sigue al personaje
```

**Regla para saber dónde va algo nuevo:** ¿es el suelo? → `terrain/`. ¿Está en el cielo o es luz? → `sky/`.
¿Es algo que se coloca sobre la isla? → `scenery/`. ¿Es sobre cómo cargar un archivo 3D? → `models/`.
¿Cambia el aspecto de TODO (materiales, sombras, curva)? → `rendering/`.

---

## ¿Qué cambio para…?

### La isla y el suelo
| Quiero… | Dónde |
|---|---|
| Hacer la isla más grande o más chica | `ISLAND.radius` en `src/config.ts` (si pasa de ~20, ver "Tamaño de la isla" abajo) |
| Cambiar la forma de la costa | `coastRadius()` en `terrain/terrainData.ts` (las 3 ondas `Math.sin`) |
| Más o menos colinas | `hills()` en `terrain/terrainData.ts` (los números `0.3`, `0.2`, `0.1` son la altura) |
| Playa más ancha o menos empinada | `BEACH.width` en `src/config.ts` (más = más suave). `BEACH.depth` = profundidad del mar, `BEACH.sand` = cuánta pendiente es arena. Todo lo demás se ajusta solo |
| Colores de arena, tierra o pasto | `COLORS` y `GRASS` en `src/config.ts` |
| Manchas de pasto oscuro | `GRASS.patches` (0 = ninguna) y `GRASS.dark` en `src/config.ts` |
| Trazos de la textura del pasto | `terrain/grassTexture.ts` y `GRASS.repeat` |
| Ancho o forma de los caminos | `pathStrength()` en `terrain/terrainData.ts` (el camino va del inicio a cada recuerdo) |
| Más detalle en el suelo (más suave) | `TERRAIN.cells` en `src/config.ts` (más pesado) |
| Hasta dónde se puede caminar hacia el agua | `BEACH.walkLimit` en `src/config.ts` |
| Hasta dónde se puede colocar cosas con el editor | `BEACH.placeLimit` en `src/config.ts` |

### El agua
| Quiero… | Dónde |
|---|---|
| Colores del agua y la espuma | `COLORS.water`, `waterDeep`, `foam` en `src/config.ts` |
| Altura del nivel del agua | `ISLAND.waterLevel` en `src/config.ts` |
| Líneas de espuma, olas, manchas de luz | el shader (texto GLSL) dentro de `water/Water.tsx` |

### Cielo, luz y sombras
| Quiero… | Dónde |
|---|---|
| Colores del cielo | `COLORS.sky` (horizonte y niebla) y `COLORS.skyTop` en `src/config.ts` |
| Nubes (cuántas, dónde, qué rápido) | la lista `clouds` y `DRIFT_SPEED` en `sky/Clouds.tsx` |
| Fuerza de la luz y color de las sombras | `LIGHTS` en `src/config.ts` |
| De dónde viene el sol (largo de las sombras) | `LIGHTS.sunOffset` en `src/config.ts` (el 2º número más alto = sombra más corta) |
| Calidad / apagar sombras | `SHADOWS` en `src/config.ts` (`enabled: false` las apaga: más rápido en celular) |
| Niebla (qué tan lejos se difumina) | el `<fog>` en `Scene.tsx` |

### Lo que hay sobre la isla
| Quiero… | Dónde |
|---|---|
| Más o menos árboles, flores, pasto, rocas… | `count` de cada tipo en `scenery/scatter.ts` (`0` los quita) |
| Más variedad (otros árboles, otras flores) | `variants` de cada tipo en `scenery/scatter.ts` (nombres en `public/models/LEEME.md`) |
| En qué zona sale cada cosa (orilla / centro) | `minInside`, `maxInside`, `edgeBias` en `scenery/scatter.ts` |
| Que la isla se reparta distinto | `SEED` en `scenery/scatter.ts` |
| Tamaño de árboles, flores… | `height` de cada variante y `scale` en `scenery/scatter.ts` |
| Fogata, tienda, cercas… de fábrica | `src/data/decorations.ts` |
| Nuevas piezas o variantes para la paleta del editor | `src/data/catalog.ts` (familias con `variants`) |
| Cómo choca el personaje con las piezas | `collider` en `src/data/catalog.ts` (decoración) o `scenery/scatter.ts` (árboles y rocas) |

### Modelos 3D
| Quiero… | Dónde |
|---|---|
| Cambiar qué modelo usa un objeto | `src/data/models.ts` (y `catalog.ts` para decoración) |
| Un modelo se ve de lado, muy grande o con colores raros | `rotationY`, `height`, `material` en `src/data/models.ts` |
| Agregar modelos nuevos | `public/models/LEEME.md` explica cómo juntar GLB |
| Cambiar los escalones de luz toon | `TOON.shades` en `src/config.ts` |

### Efectos
| Quiero… | Dónde |
|---|---|
| Quitar o suavizar la curvatura del mundo | `CURVE` en `src/config.ts` (`strength: 0` = plano). Recarga la página |
| Cámara (altura, ángulo, suavidad) | `CAMERA` en `src/config.ts` |

---

## Cómo se conecta todo (para entender el código)

```
src/data/*  (memories.json, decorations.ts, catalog.ts, models.ts)   ← los datos de fábrica
        │
        ▼
src/store/useWorldStore.ts     ← lo que HAY en la isla (empieza con los datos de fábrica;
        │                         el modo editar lo cambia y se guarda en el navegador)
        ▼
world/Scene.tsx ─┬─ terrain/TerrainMesh      lee: recuerdos (para los caminos)
                 ├─ scenery/Scenery          lee: recuerdos y decoración (quita lo que estorba)
                 ├─ scenery/Landmarks        lee: decoración
                 └─ memories/MemorySpot      lee: recuerdos
```

**Una sola fuente para la altura del suelo.** `terrain/terrainData.ts` define `groundHeight(x, z)`.
La malla que ves, la colisión con la que caminas, el lugar donde se posan los objetos, la textura
con la que el agua dibuja la espuma y el editor al apuntar con el ratón usan **esa misma función**.
Por eso, si cambias `coastRadius()`, `hills()` o `beach()`, todo se ajusta solo y siempre coincide.

**El mundo curvo es solo visual.** `rendering/curvedWorld.ts` dobla lo que se dibuja lejos de la cámara,
pero la física y los datos son planos. Por eso el editor (`src/editor/picking.ts`) corrige los clics con
la misma fórmula. Si cambias la fórmula de la curva, cámbiala también ahí.

**Orden de carga:** `App.tsx` importa `world/rendering/curvedWorld` ANTES de dibujar. Si se dibujara antes,
los materiales ya compilados no tendrían la curva.

**Instancias.** Lo repartido por la isla (cientos de piezas) se dibuja con `models/InstancedModel.tsx`:
una sola orden a la tarjeta gráfica por cada tipo de pieza. Por eso la isla llena de árboles y pasto
no pesa en celular. Las piezas con colisión llevan aparte una caja invisible (se genera en `scatter.ts`).

## La playa

`BEACH` (en `src/config.ts`) es el único ajuste de la playa. Cuando lo cambias, se mueven solos:
la pendiente del suelo, dónde empiezan las colinas, el color de la arena, los caminos de tierra, las
paredes invisibles de la costa, dónde se puede colocar con el editor y las zonas donde se reparten
árboles y rocas (se miden desde donde empieza el pasto, no desde la costa).

Con una playa más ancha el pasto ocupa menos: la isla "se come" parte de su radio. Si quieres
conservar el mismo pasto, sube `ISLAND.radius` lo mismo que subas `BEACH.width`.

Ojo: las piezas puestas en `decorations.ts` con `onCoast(...)` miden desde la costa (inside = 0),
que ya no coincide con la orilla del agua si cambias la playa. Pruébalas y ajusta su `inset`.

## Tamaño de la isla

`ISLAND.radius` cambia el radio. Si lo subes a más de ~20, ajusta también:

1. `TERRAIN.size` (`src/config.ts`): debe cubrir el doble del radio máximo de la costa, más ~4 m. Y `TERRAIN.cells` a ~2 por metro.
2. `scenery/scatter.ts`: las dos líneas `(random() - 0.5) * 36` (el área donde se reparte) al doble del radio máximo; y sube los `count`.
3. Las ondas de `coastRadius()` (`1.7`, `1.1`, `0.7`) están en metros: multiplícalas por el mismo factor para conservar la forma.

## Cosas buenas de saber

- **Windows no distingue mayúsculas:** no pongas dos archivos que solo cambien en mayúsculas (`Terrain.tsx` y `terrain.ts`), el servidor de desarrollo se confunde.
- **Cambias algo en `config.ts` y no se nota:** recarga con `Ctrl + Shift + R`. Algunos valores (la curva) se "hornean" en el shader al cargar.
- **Para ver las colisiones:** en `Scene.tsx` cambia `<Physics>` por `<Physics debug>`.
- **Imports:** dentro de una carpeta se usa `./archivo`; entre carpetas, `@/world/carpeta/archivo`.
