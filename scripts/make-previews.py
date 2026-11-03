"""
Prepara las imágenes de vista previa del menú del editor.

Toma los PNG isométricos de los packs de Kenney (carpeta assets/), recorta el espacio
vacío y los centra en un cuadrado de 112 px. Los guarda en public/previews/ y escribe
src/data/previews.ts con la lista de los que existen.

Uso (necesita Pillow:  python -m pip install pillow):
    python scripts/make-previews.py

Para agregar una pieza nueva: añádela a PIEZAS (nombre del archivo SIN extensión, igual
al `node` del catálogo) y vuelve a correr el script.
Las piezas de Quaternius no traen PNG: el menú las dibuja en vivo (ver src/editor/thumbnails.ts).
"""
import os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(RAIZ, 'assets')
SALIDA = os.path.join(RAIZ, 'public', 'previews')
TAMANO = 112  # lado del cuadrado final
ANGULO = 'NE'  # NE se lee mejor en la mayoría de las piezas

# nombre de la pieza -> carpeta del pack de Kenney donde está su PNG
NATURE = 'kenney_nature-kit/Isometric'
FURNITURE = 'kenney_furniture-kit/Isometric'
PIEZAS = {
    'campfire_logs': NATURE, 'campfire_stones': NATURE,
    'tent_detailedOpen': NATURE, 'tent_smallClosed': NATURE,
    'fence_simple': NATURE, 'fence_planks': NATURE, 'fence_gate': NATURE, 'fence_simpleDiagonal': NATURE,
    'log_stack': NATURE, 'log_large': NATURE, 'log': NATURE, 'stump_round': NATURE, 'stump_old': NATURE,
    'canoe': NATURE, 'sign': NATURE, 'statue_obelisk': NATURE,
    'bench': FURNITURE,
}

os.makedirs(SALIDA, exist_ok=True)
hechas = []
for pieza, carpeta in sorted(PIEZAS.items()):
    origen = os.path.join(ASSETS, carpeta, f'{pieza}_{ANGULO}.png')
    if not os.path.exists(origen):
        print('falta', origen)
        continue
    imagen = Image.open(origen).convert('RGBA')
    imagen = imagen.crop(imagen.getchannel('A').getbbox())  # quitar el espacio vacío
    escala = (TAMANO - 8) / max(imagen.width, imagen.height)
    imagen = imagen.resize((max(1, round(imagen.width * escala)), max(1, round(imagen.height * escala))), Image.LANCZOS)
    lienzo = Image.new('RGBA', (TAMANO, TAMANO), (0, 0, 0, 0))
    lienzo.alpha_composite(imagen, ((TAMANO - imagen.width) // 2, (TAMANO - imagen.height) // 2))
    lienzo.save(os.path.join(SALIDA, f'{pieza}.png'), optimize=True)
    hechas.append(pieza)

lista = ',\n  '.join(f"{p!r}: '/previews/{p}.png'" for p in hechas).replace("'", "'")
codigo = f"""// GENERADO por scripts/make-previews.py: no lo edites a mano.
// Imágenes de vista previa del menú del editor, por nombre de pieza (el `node` del catálogo).
// Las piezas que no están aquí se dibujan en vivo (ver src/editor/thumbnails.ts).
export const previewImages: Record<string, string> = {{
  {lista},
}}
"""
with open(os.path.join(RAIZ, 'src', 'data', 'previews.ts'), 'w', encoding='utf-8') as f:
    f.write(codigo)
print(f'{len(hechas)} previews en public/previews/ y src/data/previews.ts')
