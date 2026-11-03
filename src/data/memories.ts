import type { Memory } from '@/types'
import memoriesJson from './memories.json'

// Los recuerdos de fábrica (los de memories.json). Los que se agregan o editan desde
// la página viven en src/store/useWorldStore.ts, que empieza con estos.
export const seedMemories = memoriesJson as Memory[]
