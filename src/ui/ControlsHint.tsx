import { Kbd } from '@/components/ui/kbd';

// Pequeña ayuda de controles para computadora.
export function ControlsHint() {
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 flex -translate-x-1/2 items-center gap-5 rounded-full bg-background/90 px-4 py-2 text-sm whitespace-nowrap">
      <div className='space-x-1' >
        <Kbd className="font-bold">W</Kbd>
        <Kbd className="font-bold">A</Kbd>
        <Kbd className="font-bold">S</Kbd>
        <Kbd className="font-bold">D</Kbd>
        <span>caminar</span>
      </div>
      <div className='space-x-1' >
        <Kbd className="font-bold">Shift</Kbd>
        <span>correr</span>
      </div>
      <div className='space-x-1' >
        <Kbd className="font-bold">E</Kbd>
        <span>ver recuerdo</span>
      </div>
    </div>
  );
}
