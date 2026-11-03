// cn() junta clases de Tailwind y resuelve los choques: la última gana.
//   cn('px-2 bg-red-500', 'px-4')            → 'bg-red-500 px-4'
//   cn('rounded', isActive && 'bg-primary')  → agrega la clase solo si isActive
// Todos los componentes de src/components/ui la usan para aceptar `className`,
// así puedes personalizar cualquiera desde afuera: <Button className="rounded-full" />
//
// Viene del paquete "cn" (de shadcn), que reemplaza a clsx + tailwind-merge.
export { cn } from 'cn'
