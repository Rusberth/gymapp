import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { Membresia } from '../../models/membresia.model';
import { Rutina } from '../../models/rutina.model';
import { Pago } from '../../models/pago.model';
import { Asistencia } from '../../models/asistencia.model';
import { UsuarioService } from '../../services/usuario.service';
import { MembresiaService } from '../../services/membresia.service';
import { RutinaService } from '../../services/rutina.service';
import { PagoService } from '../../services/pago.service';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-detalle.html'
})
export class ClienteDetalleComponent implements OnInit {
  cliente: Usuario | null = null;
  membresias: Membresia[] = [];
  rutinas: Rutina[] = [];
  pagos: Pago[] = [];
  asistencias: Asistencia[] = [];

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private membresiaService: MembresiaService,
    private rutinaService: RutinaService,
    private pagoService: PagoService,
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    const [cliente, membresias, rutinas, pagos, asistencias] = await Promise.all([
      this.usuarioService.getById(id),
      this.membresiaService.getByUsuarioId(id),
      this.rutinaService.getByUsuarioId(id),
      this.pagoService.getByUsuarioId(id),
      this.asistenciaService.getByUsuarioId(id)
    ]);

    this.cliente = cliente;
    this.membresias = membresias.sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
    this.rutinas = rutinas;
    this.pagos = pagos.sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
    this.asistencias = asistencias.sort((a, b) => `${b.fecha}${b.horaEntrada}`.localeCompare(`${a.fecha}${a.horaEntrada}`));
    this.cdr.detectChanges();
  }

  get totalPagado(): number {
    return this.pagos.filter((p) => p.estado === 'Pagado').reduce((sum, p) => sum + p.monto, 0);
  }
}
