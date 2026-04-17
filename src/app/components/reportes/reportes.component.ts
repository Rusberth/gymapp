import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { MembresiaService } from '../../services/membresia.service';
import { RutinaService } from '../../services/rutina.service';
import { PagoService } from '../../services/pago.service';
import { AsistenciaService } from '../../services/asistencia.service';
import { Usuario } from '../../models/usuario.model';
import { Membresia } from '../../models/membresia.model';
import { Pago } from '../../models/pago.model';
import { Asistencia } from '../../models/asistencia.model';
import { Rutina } from '../../models/rutina.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html'
})
export class ReportesComponent implements OnInit {
  usuarios: Usuario[] = [];
  membresias: Membresia[] = [];
  pagos: Pago[] = [];
  asistencias: Asistencia[] = [];
  rutinas: Rutina[] = [];
exportarPDF() {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-BO');

  doc.setFontSize(16);
  doc.text('Reporte del Gimnasio', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generado: ${fecha}`, 14, 22);

  // Resumen general
  autoTable(doc, {
    startY: 28,
    head: [['Indicador', 'Valor']],
    body: [
      ['Ingresos confirmados', `Bs ${this.totalIngresos}`],
      ['Membresías activas', String(this.membresiasActivas)],
      ['Asistencias del mes', String(this.asistenciasMes)],
      ['Clientes nuevos del mes', String(this.clientesNuevosMes)],
    ],
  });

  // Pagos pendientes
  const y1 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text('Cobros Pendientes', 14, y1);
  autoTable(doc, {
    startY: y1 + 4,
    head: [['Concepto', 'Cliente ID', 'Fecha', 'Monto']],
    body: this.pagosPendientes.map(p => [p.concepto, p.usuarioId, p.fechaPago, `Bs ${p.monto}`]),
  });

  // Membresías por vencer
  const y2 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text('Membresías por Vencer', 14, y2);
  autoTable(doc, {
    startY: y2 + 4,
    head: [['Tipo', 'Cliente ID', 'Fecha Fin', 'Precio']],
    body: this.membresiasPorVencer.map(m => [m.tipo, m.usuarioId, m.fechaFin, `Bs ${m.precio}`]),
  });

  doc.save(`reporte-gimnasio-${fecha}.pdf`);
}

exportarExcel() {
  const wb = XLSX.utils.book_new();
  const fecha = new Date().toLocaleDateString('es-BO');

  // Hoja 1: Resumen
  const resumen = [
    ['Indicador', 'Valor'],
    ['Ingresos confirmados', this.totalIngresos],
    ['Membresías activas', this.membresiasActivas],
    ['Asistencias del mes', this.asistenciasMes],
    ['Clientes nuevos del mes', this.clientesNuevosMes],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');

  // Hoja 2: Pagos pendientes
  const pagosData = [
    ['Concepto', 'Cliente ID', 'Fecha', 'Monto'],
    ...this.pagosPendientes.map(p => [p.concepto, p.usuarioId, p.fechaPago, p.monto]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pagosData), 'Pagos Pendientes');

  // Hoja 3: Membresías por vencer
  const memData = [
    ['Tipo', 'Cliente ID', 'Fecha Fin', 'Precio'],
    ...this.membresiasPorVencer.map(m => [m.tipo, m.usuarioId, m.fechaFin, m.precio]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(memData), 'Membresías por Vencer');

  XLSX.writeFile(wb, `reporte-gimnasio-${fecha}.xlsx`);
}
  constructor(
    private usuarioService: UsuarioService,
    private membresiaService: MembresiaService,
    private pagoService: PagoService,
    private asistenciaService: AsistenciaService,
    private rutinaService: RutinaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const [usuarios, membresias, pagos, asistencias, rutinas] = await Promise.all([
      this.usuarioService.getAll(),
      this.membresiaService.getAll(),
      this.pagoService.getAll(),
      this.asistenciaService.getAll(),
      this.rutinaService.getAll()
    ]);
    this.usuarios = usuarios;
    this.membresias = membresias;
    this.pagos = pagos;
    this.asistencias = asistencias;
    this.rutinas = rutinas;
    this.cdr.detectChanges();
  }

  get totalIngresos(): number {
    return this.pagos.filter((p) => p.estado === 'Pagado').reduce((sum, p) => sum + p.monto, 0);
  }

  get membresiasActivas(): number {
    return this.membresias.filter((m) => m.activa).length;
  }

  get asistenciasMes(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return this.asistencias.filter((a) => a.fecha.startsWith(currentMonth) && a.estado === 'Asistio').length;
  }

  get clientesNuevosMes(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return this.usuarios.filter((u) => u.fechaRegistro.startsWith(currentMonth)).length;
  }

  get pagosPendientes(): Pago[] {
    return this.pagos.filter((p) => p.estado === 'Pendiente').slice(0, 5);
  }

  get membresiasPorVencer(): Membresia[] {
    return this.membresias
      .filter((m) => m.activa && this.daysUntil(m.fechaFin) >= 0 && this.daysUntil(m.fechaFin) <= 7)
      .slice(0, 5);
  }

  get rutinasPorNivel(): { nivel: string; total: number }[] {
    return [
      { nivel: 'Principiante', total: this.rutinas.filter((r) => r.nivel === 'Principiante').length },
      { nivel: 'Intermedio', total: this.rutinas.filter((r) => r.nivel === 'Intermedio').length },
      { nivel: 'Avanzado', total: this.rutinas.filter((r) => r.nivel === 'Avanzado').length }
    ];
  }

  private daysUntil(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(`${dateString}T00:00:00`).getTime() - today.getTime()) / 86400000);
  }
}
