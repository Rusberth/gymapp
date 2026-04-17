export interface Rutina {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  nombre: string;
  descripcion: string;
  ejercicios: string;
  series: number;
  repeticiones: number;
  diasSemana: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
}