export interface Membresia {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  tipo: 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}