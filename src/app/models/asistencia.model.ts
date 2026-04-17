export interface Asistencia {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  fecha: string;
  horaEntrada: string;
  area: 'Sala' | 'Cardio' | 'Funcional' | 'Personalizado';
  estado: 'Asistio' | 'Falta';
  observacion: string;
}
