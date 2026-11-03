# Modelos 3D (.glb)

## Estado actual

| Archivo           | Qué trae                                                                    | Origen                     |
| ----------------- | --------------------------------------------------------------------------- | -------------------------- |
| `naturaleza.glb`  | 40 piezas: árboles, arbustos, flores, pasto, hongos, rocas, piedritas (2 MB) | Quaternius Stylized Nature |
| `props.glb`       | 21 piezas: fogata, tienda, cercas, troncos, canoa, cartel, torii (70 KB)    | Kenney Nature + sushi pack |
| `banca.glb`       | Banca (objeto de recuerdo)                                                  | Kenney Furniture           |
| `personaje.glb`   | Panda con animaciones Idle / Walk / Run                                     | pack sushi-restaurant      |
| `beach-chairs.glb` | Dos sillas de playa y una sombrilla, juntas (3 piezas; optimizado de 1,1 MB a 97 KB) | listo (recuerdo **Sillas de playa**) |
| `record-player.glb` | Tocadiscos (una pieza, `Record_Player`) | listo (recuerdo **Tocadiscos**) |
| `pumpkin-1.glb`, `pumpkin-2.glb` | Dos calabazas sueltas (la pieza dentro de cada archivo se llama `Pumpkin`) | listas (familia **Calabaza** del editor) |
| `buzon.glb`       | —                                                                           | falta (usa relleno)        |

`naturaleza.glb` y `props.glb` juntan muchas piezas en un solo archivo (comparten texturas, así pesan poco).
Cada pieza se pide por su nombre (`node` en `src/data/models.ts`, `variants` en `src/world/scenery/scatter.ts`,
`node` en `src/data/decorations.ts`).

**Piezas de `naturaleza.glb`:** `Pine_1`–`Pine_5`, `CommonTree_1`–`CommonTree_5`, `TwistedTree_1`–`3`,
`DeadTree_1`–`2`, `Bush_Common`, `Bush_Common_Flowers`, `Flower_3_Group`, `Flower_3_Single`, `Flower_4_Group`,
`Flower_4_Single`, `Clover_1`–`2`, `Fern_1`, `Plant_1`, `Plant_7`, `Grass_Common_Short`, `Grass_Common_Tall`,
`Grass_Wispy_Short`, `Grass_Wispy_Tall`, `Mushroom_Common`, `Mushroom_Laetiporus`, `Rock_Medium_1`–`3`,
`Pebble_Round_1`–`3`, `Pebble_Square_1`–`3`.

**Piezas de `props.glb`:** `campfire_logs`, `campfire_stones`, `tent_detailedOpen`, `tent_smallClosed`, `fence_simple`,
`fence_simpleCenter`, `fence_simpleDiagonal`, `fence_gate`, `fence_planks`, `log`, `log_large`, `log_stack`,
`stump_old`, `stump_round`, `canoe`, `sign`, `hanging_moss`, `lily_large`, `lily_small`, `statue_obelisk`,
`Environment_ToriiGate`.

### Cómo agregar más piezas de los packs originales (carpeta `assets/`)
Los GLB se arman con `@gltf-transform/cli` (une las piezas y comparte texturas):

```bash
# 1) juntar las piezas que quieras en un solo archivo
npx @gltf-transform/cli merge pieza1.glb pieza2.glb temporal.glb
# 2) comprimir (texturas a 512 px, geometría comprimida)
npx @gltf-transform/cli optimize temporal.glb salida.glb --compress meshopt --texture-compress webp --texture-size 512
```

Para ver los nombres de las piezas de un GLB: `npx @gltf-transform/cli inspect archivo.glb`.

---

Pon aquí tus modelos con **exactamente estos nombres** y el juego los usa solo.
Si falta alguno, se ve la forma simple de relleno, así que puedes ir de uno en uno.

| Archivo          | Qué es                              | Altura (en `src/data/models.ts`) |
| ---------------- | ----------------------------------- | -------------------------------- |
| `personaje.glb`  | El personaje, **con animaciones**   | 1.5 m                            |
| `arbol.glb`      | Árbol                               | 3.4 m                            |
| `roca.glb`       | Roca                                | 0.8 m                            |
| `banca.glb`      | Banca (recuerdo)                    | 0.95 m                           |
| `buzon.glb`      | Buzón (recuerdo)                    | 1.4 m                            |
| `foto.glb`       | Foto colgada (recuerdo)             | 1.5 m                            |
| `flor.glb`       | Flor (recuerdo)                     | 0.9 m                            |

No importa el tamaño con que lo exportes: el juego lo escala a la altura de la tabla,
le pone los pies en el suelo y lo centra. Si un modelo se ve de espaldas o de lado,
usa `rotationY` en `src/data/models.ts` (por ejemplo `rotationY: 180`).

---

## Cómo pedirle los modelos a una IA (Meshy, Tripo, etc.)

### Estilo (para que se parezca a Longvinter)
Usa el mismo "bloque de estilo" en TODOS los prompts, así los modelos combinan entre sí:

> stylized low-poly game asset, hand-painted texture, saturated colors, soft cartoon look,
> chunky simple shapes, single object, centered, no ground, no background

Ejemplos:

- **Árbol:** `pine tree, layered fluffy foliage, reddish-brown trunk, <bloque de estilo>`
- **Roca:** `grey boulder with moss, rounded faceted shape, <bloque de estilo>`
- **Banca:** `wooden park bench with iron legs, <bloque de estilo>`
- **Buzón:** `blue mailbox on wooden post with red flag, <bloque de estilo>`
- **Flor:** `big pink flower with yellow center on a green stem, <bloque de estilo>`
- **Personaje:** `cute chibi character, big head, small body, simple clothes, standing in A-pose, <bloque de estilo>`

### Ajustes al generar
- Si dejas elegir, pide **pocos polígonos** (objetos: 2 000 – 10 000; personaje: 5 000 – 15 000) y **texturas de 1024**.
- Exporta en **GLB** (no FBX ni OBJ).
- **Objetos:** una cosa por modelo (no "una banca con árbol y suelo").
- **Personaje:** pídelo en **pose A o T** (brazos separados), si no el rig sale mal.
- Revisa la **licencia** de la herramienta: en planes gratis suelen pedir dar crédito o no permitir uso comercial. Para una web personal casi siempre está bien.

### El personaje animado
El personaje necesita un esqueleto y al menos las animaciones **idle** (quieto) y **walk** (caminar); **run** (correr) es opcional.

1. En la misma herramienta de IA, usa la opción de **auto-rig / animación** (Meshy y Tripo la tienen) y descarga el GLB **con las animaciones dentro**.
2. Alternativa: sube el personaje a **Mixamo** (gratis, mixamo.com), baja Idle y Walking y únelos en un solo GLB con Blender.
3. El juego busca las animaciones por palabra en el nombre ("idle", "walk", "run"). Si tus clips se llaman distinto, escribe los nombres exactos en `CHARACTER.animations` de `src/data/models.ts`.

Para ver cómo se llaman los clips de tu GLB: arrástralo a https://gltf-viewer.donmccurdy.com y mira la pestaña **Animation**.

### Si el GLB pesa mucho (importante en celular)
Comprime el modelo (bájalo a ~1 MB o menos). Desde la carpeta del proyecto:

```bash
npx @gltf-transform/cli optimize public/models/arbol.glb public/models/arbol.glb --compress draco --texture-compress webp --texture-size 1024
```

(Cambia `arbol.glb` por el archivo que quieras. El juego lee modelos comprimidos sin configurar nada más.)

---

## Si un modelo no se ve bien

| Problema                                  | Qué hacer                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Se ve de espaldas / de lado               | `rotationY: 180` (o 90 / -90) en `src/data/models.ts`                  |
| Muy grande o muy chico                    | Cambia `height` en `src/data/models.ts`                                |
| Los colores se ven raros o muy oscuros    | Prueba `material: 'original'` en ese modelo (conserva su material)     |
| No aparece (ves la forma simple)          | Revisa el nombre del archivo y la consola del navegador (F12)          |
| El personaje no se anima                  | Revisa los nombres de los clips (ver arriba)                           |
| Choca raro con el personaje               | Las colisiones son cajas simples: ajústalas en `src/memories/objects/index.ts` (`collider`), `Tree.tsx` o `Rock.tsx` |
