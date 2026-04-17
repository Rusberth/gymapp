import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { MembresiaService } from './membresia.service';
import { RutinaService } from './rutina.service';
import { PagoService } from './pago.service';
import { AsistenciaService } from './asistencia.service';
import { Usuario } from '../models/usuario.model';
import { Membresia } from '../models/membresia.model';
import { Rutina } from '../models/rutina.model';
import { Pago } from '../models/pago.model';
import { Asistencia } from '../models/asistencia.model';

type DemoUserSeed = Usuario & {
  email: string;
  membresia: Omit<Membresia, 'usuarioId'>;
  rutina: Omit<Rutina, 'usuarioId'>;
  pagos: Omit<Pago, 'usuarioId'>[];
  asistencias: Omit<Asistencia, 'usuarioId'>[];
};

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly seedKey = 'gymapp_demo_seed_v2';

  constructor(
    private usuarioService: UsuarioService,
    private membresiaService: MembresiaService,
    private rutinaService: RutinaService,
    private pagoService: PagoService,
    private asistenciaService: AsistenciaService
  ) {}

  async ensureDemoData(): Promise<void> {
    if (localStorage.getItem(this.seedKey) === 'done') {
      return;
    }

    const usersSeed = this.buildDemoUsers();
    const existingUsers = await this.usuarioService.getAll();
    const [existingPagos, existingAsistencias] = await Promise.all([
      this.pagoService.getAll(),
      this.asistenciaService.getAll()
    ]);
    const userByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));

    for (const seed of usersSeed) {
      const { membresia, rutina, pagos, asistencias, ...usuario } = seed;
      let usuarioId = userByEmail.get(seed.email.toLowerCase())?.id;

      if (!usuarioId) {
        usuarioId = await this.usuarioService.add(usuario);
        await this.membresiaService.add({ ...membresia, usuarioId });
        await this.rutinaService.add({ ...rutina, usuarioId });
      }

      const hasPagos = existingPagos.some((item) => item.usuarioId === usuarioId);
      const hasAsistencias = existingAsistencias.some((item) => item.usuarioId === usuarioId);

      if (!hasPagos) {
        for (const pago of pagos) {
          await this.pagoService.add({ ...pago, usuarioId });
        }
      }

      if (!hasAsistencias) {
        for (const asistencia of asistencias) {
          await this.asistenciaService.add({ ...asistencia, usuarioId });
        }
      }
    }

    localStorage.setItem(this.seedKey, 'done');
  }

  private buildDemoUsers(): DemoUserSeed[] {
    const today = new Date();
    return [
      {
        nombre: 'Carla',
        apellido: 'Mendoza',
        edad: 27,
        email: 'carla.mendoza@gymapp.demo',
        telefono: '72100345',
        fechaRegistro: this.formatDate(this.shiftDays(today, -34)),
        membresia: { tipo: 'Mensual', precio: 150, fechaInicio: this.formatDate(this.shiftDays(today, -4)), fechaFin: this.formatDate(this.shiftDays(today, 26)), activa: true },
        rutina: { nombre: 'Tonificacion inicial', descripcion: 'Rutina base para adaptacion, movilidad y resistencia general.', ejercicios: 'Sentadilla libre, remo con banda, press militar, caminata inclinada', series: 3, repeticiones: 12, diasSemana: 'Lunes, miercoles y viernes', nivel: 'Principiante' },
        pagos: [{ concepto: 'Membresia mensual', monto: 150, metodoPago: 'QR', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -4)), observacion: 'Renovacion al dia' }],
        asistencias: [
          { fecha: this.formatDate(this.shiftDays(today, -1)), horaEntrada: '18:10', area: 'Sala', estado: 'Asistio', observacion: '' },
          { fecha: this.formatDate(today), horaEntrada: '18:18', area: 'Cardio', estado: 'Asistio', observacion: '' }
        ]
      },

      
      {
        nombre: 'Luis',
        apellido: 'Arce',
        edad: 31,
        email: 'luis.arce@gymapp.demo',
        telefono: '72544890',
        fechaRegistro: this.formatDate(this.shiftDays(today, -20)),
        membresia: { tipo: 'Trimestral', precio: 400, fechaInicio: this.formatDate(this.shiftDays(today, -18)), fechaFin: this.formatDate(this.shiftDays(today, 72)), activa: true },
        rutina: { nombre: 'Hipertrofia superior', descripcion: 'Enfoque en torso y espalda con progresion semanal.', ejercicios: 'Press banca, jalon al pecho, remo con barra, fondos asistidos', series: 4, repeticiones: 10, diasSemana: 'Martes, jueves y sabado', nivel: 'Intermedio' },
        pagos: [{ concepto: 'Plan trimestral', monto: 400, metodoPago: 'Transferencia', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -18)), observacion: '' }],
        asistencias: [{ fecha: this.formatDate(this.shiftDays(today, -2)), horaEntrada: '07:05', area: 'Sala', estado: 'Asistio', observacion: '' }]
      },
      {
        nombre: 'Andrea',
        apellido: 'Flores',
        edad: 24,
        email: 'andrea.flores@gymapp.demo',
        telefono: '73455001',
        fechaRegistro: this.formatDate(this.shiftDays(today, -11)),
        membresia: { tipo: 'Mensual', precio: 150, fechaInicio: this.formatDate(this.shiftDays(today, -2)), fechaFin: this.formatDate(this.shiftDays(today, 5)), activa: true },
        rutina: { nombre: 'Gluteo y pierna', descripcion: 'Trabajo localizado con enfasis en fuerza y estabilidad.', ejercicios: 'Hip thrust, sentadilla bulgara, peso muerto rumano, abducciones', series: 4, repeticiones: 12, diasSemana: 'Lunes, miercoles y viernes', nivel: 'Intermedio' },
        pagos: [{ concepto: 'Membresia mensual', monto: 150, metodoPago: 'Efectivo', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -2)), observacion: '' }],
        asistencias: [{ fecha: this.formatDate(today), horaEntrada: '06:40', area: 'Funcional', estado: 'Asistio', observacion: '' }]
      },
      {
        nombre: 'Mateo',
        apellido: 'Salinas',
        edad: 36,
        email: 'mateo.salinas@gymapp.demo',
        telefono: '71134982',
        fechaRegistro: this.formatDate(this.shiftDays(today, -62)),
        membresia: { tipo: 'Semestral', precio: 750, fechaInicio: this.formatDate(this.shiftDays(today, -41)), fechaFin: this.formatDate(this.shiftDays(today, 139)), activa: true },
        rutina: { nombre: 'Fuerza total', descripcion: 'Programa de fuerza para tren superior e inferior.', ejercicios: 'Peso muerto, press militar, dominadas, sentadilla frontal', series: 5, repeticiones: 6, diasSemana: 'Lunes, martes, jueves y sabado', nivel: 'Avanzado' },
        pagos: [{ concepto: 'Plan semestral', monto: 750, metodoPago: 'Transferencia', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -41)), observacion: '' }],
        asistencias: [{ fecha: this.formatDate(this.shiftDays(today, -1)), horaEntrada: '20:00', area: 'Personalizado', estado: 'Asistio', observacion: 'Trabajo pesado' }]
      },
      {
        nombre: 'Valeria',
        apellido: 'Suarez',
        edad: 29,
        email: 'valeria.suarez@gymapp.demo',
        telefono: '70211478',
        fechaRegistro: this.formatDate(this.shiftDays(today, -8)),
        membresia: { tipo: 'Anual', precio: 1400, fechaInicio: this.formatDate(this.shiftDays(today, -8)), fechaFin: this.formatDate(this.shiftDays(today, 357)), activa: true },
        rutina: { nombre: 'Resistencia funcional', descripcion: 'Circuitos mixtos para capacidad aerobica y control corporal.', ejercicios: 'Burpees, battle ropes, remo ergometro, swings con kettlebell', series: 4, repeticiones: 15, diasSemana: 'Martes, jueves y sabado', nivel: 'Intermedio' },
        pagos: [{ concepto: 'Plan anual', monto: 1400, metodoPago: 'QR', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -8)), observacion: 'Promocion aniversario' }],
        asistencias: [{ fecha: this.formatDate(this.shiftDays(today, -3)), horaEntrada: '19:10', area: 'Cardio', estado: 'Asistio', observacion: '' }]
      },
      {
        nombre: 'Diego',
        apellido: 'Paredes',
        edad: 40,
        email: 'diego.paredes@gymapp.demo',
        telefono: '71900654',
        fechaRegistro: this.formatDate(this.shiftDays(today, -95)),
        membresia: { tipo: 'Mensual', precio: 150, fechaInicio: this.formatDate(this.shiftDays(today, -38)), fechaFin: this.formatDate(this.shiftDays(today, -8)), activa: false },
        rutina: { nombre: 'Reacondicionamiento', descripcion: 'Retorno progresivo con ejercicios de bajo impacto.', ejercicios: 'Bicicleta estatica, plancha, prensa liviana, estiramientos guiados', series: 3, repeticiones: 15, diasSemana: 'Lunes, miercoles y viernes', nivel: 'Principiante' },
        pagos: [{ concepto: 'Membresia mensual', monto: 150, metodoPago: 'Efectivo', estado: 'Pendiente', fechaPago: this.formatDate(this.shiftDays(today, -8)), observacion: 'Cobro pendiente' }],
        asistencias: [{ fecha: this.formatDate(this.shiftDays(today, -9)), horaEntrada: '17:50', area: 'Sala', estado: 'Falta', observacion: 'No asistio' }]
      },
      {
        nombre: 'Natalia',
        apellido: 'Rojas',
        edad: 22,
        email: 'natalia.rojas@gymapp.demo',
        telefono: '73688012',
        fechaRegistro: this.formatDate(this.shiftDays(today, -15)),
        membresia: { tipo: 'Trimestral', precio: 400, fechaInicio: this.formatDate(this.shiftDays(today, -10)), fechaFin: this.formatDate(this.shiftDays(today, 80)), activa: true },
        rutina: { nombre: 'Core y estabilidad', descripcion: 'Fortalecimiento de zona media y control postural.', ejercicios: 'Plancha frontal, hollow hold, elevaciones de piernas, farmer walks', series: 4, repeticiones: 14, diasSemana: 'Martes, jueves y viernes', nivel: 'Principiante' },
        pagos: [{ concepto: 'Plan trimestral', monto: 400, metodoPago: 'Tarjeta', estado: 'Pagado', fechaPago: this.formatDate(this.shiftDays(today, -10)), observacion: '' }],
        asistencias: [{ fecha: this.formatDate(today), horaEntrada: '08:05', area: 'Sala', estado: 'Asistio', observacion: '' }]
      }
    ];
  }

  private shiftDays(baseDate: Date, days: number): Date {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
