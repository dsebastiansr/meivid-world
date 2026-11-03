import { ChevronLeft, ChevronRight, ImagePlus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { HOME_SONG, SONGS } from '@/audio/songs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { memoryPhotos } from '@/memories/photos';
import { useEditorStore, type MemoryFormState } from '@/store/useEditorStore';
import { fileToDataUrl } from './fileToDataUrl';

// El `id` del <form>: el botón "Guardar" vive en el DialogFooter (fuera del <form>)
// y se conecta con él mediante el atributo `form`.
const FORM_ID = 'memory-form';

// El contenido del diálogo. Es un fragmento: sus tres partes (DialogHeader, el formulario y
// DialogFooter) quedan como hijas directas del DialogContent que lo rodea (ver MemoryForm abajo).
function MemoryFormBody({ form }: { form: MemoryFormState }) {
  const { saveForm, closeForm, deleteFormMemory } = useEditorStore.getState();
  const [titulo, setTitulo] = useState(form.memory.titulo);
  const [fecha, setFecha] = useState(form.memory.fecha);
  const [texto, setTexto] = useState(form.memory.texto);
  const [fotos, setFotos] = useState<string[]>(() => memoryPhotos(form.memory));
  const [cancion, setCancion] = useState(form.memory.cancion ?? '');
  const [cancionInicio, setCancionInicio] = useState(String(form.memory.cancionInicio ?? 0));
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Agrega todas las fotos que elijas (una por una, para no saturar el navegador)
  const addPhotos = async (files: File[]) => {
    setLoadingPhotos(true);
    for (const file of files) {
      try {
        const image = await fileToDataUrl(file, 800, 0.78);
        setFotos((current) => [...current, image]);
      } catch {
        window.alert(
          `No se pudo leer la foto "${file.name}". Prueba con otra.`,
        );
      }
    }
    setLoadingPhotos(false);
  };

  const removePhoto = (index: number) =>
    setFotos((current) => current.filter((_, i) => i !== index));

  const movePhoto = (index: number, delta: number) =>
    setFotos((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  // `foto` (la primera) se sigue guardando aparte, por compatibilidad con recuerdos antiguos
  const save = () =>
    saveForm({
      ...form.memory,
      titulo: titulo.trim(),
      fecha,
      texto,
      foto: fotos[0] ?? '',
      fotos,
      cancion: cancion || undefined,
      cancionInicio: cancion ? Math.max(0, Number(cancionInicio) || 0) : undefined,
    });

  const remove = () => {
    if (window.confirm('¿Borrar este recuerdo?')) deleteFormMemory();
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle className="text-xl font-extrabold">
          {form.isNew ? 'Nuevo recuerdo' : 'Editar recuerdo'}
        </DialogTitle>
        {/* DialogDescription es solo texto (se dibuja como <p>): aquí no va el formulario */}
        <DialogDescription>
          Se verá como un librito: las fotos en una página y el texto en la
          otra.
        </DialogDescription>
      </DialogHeader>

      {/* Cuerpo: es la parte que se desplaza si el formulario no cabe en la pantalla */}
      <form
        id={FORM_ID}
        className="flex min-h-0 flex-1 touch-pan-y flex-col gap-5 overflow-y-auto px-6 pb-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (titulo.trim()) save();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label>
            Fotos{' '}
            {fotos.length > 0 && (
              <span className="font-normal text-muted-foreground">
                ({fotos.length})
              </span>
            )}
          </Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {fotos.map((src, index) => (
              <div
                key={`${index}-${src.length}`}
                className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
              >
                <img src={src} alt="" className="size-full object-cover" />
                {index === 0 && (
                  <span className="absolute top-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Primera
                  </span>
                )}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="destructive"
                  className="absolute top-1 right-1 rounded-full"
                  onClick={() => removePhoto(index)}
                  aria-label="Quitar foto"
                >
                  <X />
                </Button>
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 p-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="text-white"
                    disabled={index === 0}
                    onClick={() => movePhoto(index, -1)}
                    aria-label="Mover antes"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="text-white"
                    disabled={index === fotos.length - 1}
                    onClick={() => movePhoto(index, 1)}
                    aria-label="Mover después"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={loadingPhotos}
              onClick={() => fileInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-bold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <ImagePlus className="size-6" />
              {loadingPhotos ? 'Preparando…' : 'Agregar fotos'}
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) addPhotos(files);
              event.target.value = '';
            }}
          />
          <p className="text-xs text-muted-foreground">
            Puedes elegir varias a la vez y cambiarles el orden. Cada foto se
            reduce para que quepan muchas en el navegador.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-title">Título</Label>
            <Input
              id="memory-title"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Nuestra primera cita"
              autoFocus={form.isNew}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-date">Fecha</Label>
            <Input
              id="memory-date"
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-song">Canción</Label>
            <select
              id="memory-song"
              value={cancion}
              onChange={(event) => setCancion(event.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">La de la isla (por defecto)</option>
              {SONGS.filter((song) => song.src !== HOME_SONG).map((song) => (
                <option key={song.src} value={song.src}>
                  {song.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-song-start">Empieza en (seg)</Label>
            <Input
              id="memory-song-start"
              type="number"
              min={0}
              value={cancionInicio}
              disabled={!cancion}
              onChange={(event) => setCancionInicio(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="memory-text">Lo que quieres recordar</Label>
          <Textarea
            id="memory-text"
            className="max-w-full"
            rows={10}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="Escribe aquí todo lo que quieras. Si es largo, el libro lo reparte solo en varias hojas."
          />
        </div>
      </form>

      {/* DialogFooter ya trae su borde y su fondo: se pega abajo, fuera del desplazamiento */}
      <DialogFooter className="m-0">
        {!form.isNew && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="sm:mr-auto"
            onClick={remove}
            aria-label="Borrar recuerdo"
          >
            <Trash2 />
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={closeForm}>
          Cancelar
        </Button>
        {/* form={FORM_ID}: envía el formulario aunque el botón esté fuera de él */}
        <Button
          type="submit"
          form={FORM_ID}
          disabled={!titulo.trim() || loadingPhotos}
        >
          Guardar
        </Button>
      </DialogFooter>
    </>
  );
}

// Ventana para escribir o editar un recuerdo (título, fecha, texto y varias fotos).
// Jerarquía de shadcn:  Dialog › DialogContent › DialogHeader · cuerpo · DialogFooter
export function MemoryForm() {
  const form = useEditorStore((state) => state.form);
  const closeForm = useEditorStore((state) => state.closeForm);

  return (
    <Dialog open={form !== null} onOpenChange={(open) => !open && closeForm()}>
      {/* p-0 y gap-0: cada parte (header, cuerpo, footer) pone su propio relleno. Así el
          footer queda de borde a borde y solo el cuerpo se desplaza. */}
      <DialogContent className="flex max-h-[calc(100%-2rem)] flex-col gap-4 overflow-hidden rounded-3xl p-0 select-text sm:max-w-2xl">
        {/* key: al abrir otro recuerdo, el formulario se reinicia con sus datos */}
        {form && <MemoryFormBody key={form.memory.id} form={form} />}
      </DialogContent>
    </Dialog>
  );
}
