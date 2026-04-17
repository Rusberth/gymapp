export interface Pago {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  concepto: string;
  monto: number;
  metodoPago: 'Efectivo' | 'Transferencia' | 'QR' | 'Tarjeta';
  estado: 'Pagado' | 'Pendiente';
  fechaPago: string;
  observacion: string;
}
