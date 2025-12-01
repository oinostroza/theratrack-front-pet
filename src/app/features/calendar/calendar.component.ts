import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CareSessionsService } from '../care-sessions/services/care-sessions.service';
import { SessionsService } from '../sessions/services/sessions.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../shared/components/error-display/error-display.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DateUtil } from '../../core/utils/date.util';
import { StatusUtil } from '../../core/utils/status.util';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'care-session' | 'therapy-session';
  color: string;
  bgColor: string;
  borderColor: string;
  data: any;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent, ModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  private readonly careSessionsService = inject(CareSessionsService);
  private readonly sessionsService = inject(SessionsService);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly currentDate = signal<Date>(new Date());
  readonly events = signal<CalendarEvent[]>([]);
  readonly selectedEvent = signal<CalendarEvent | null>(null);
  readonly showEventModal = signal<boolean>(false);
  
  readonly StatusUtil = StatusUtil;
  readonly DateUtil = DateUtil;

  readonly currentMonth = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  });

  readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Cargar sesiones de cuidado y sesiones de terapia
    this.careSessionsService.getSessions().subscribe({
      next: (careSessions) => {
        const careEvents: CalendarEvent[] = careSessions.map(session => ({
          id: session.id,
          title: `Cuidado: ${session.petId}`,
          date: new Date(session.startTime),
          type: 'care-session',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          data: session
        }));

        this.sessionsService.getSessions().subscribe({
          next: (therapySessions) => {
            const therapyEvents: CalendarEvent[] = therapySessions
              .filter(s => s.fechaInicio)
              .map(session => ({
                id: session.id.toString(),
                title: `Terapia: ${session.conceptoPrincipal || 'Sesión'}`,
                date: new Date(session.fechaInicio!),
                type: 'therapy-session',
                color: 'text-purple-700',
                bgColor: 'bg-purple-100',
                borderColor: 'border-purple-300',
                data: session
              }));

            this.events.set([...careEvents, ...therapyEvents]);
            this.isLoading.set(false);
          },
          error: (error) => {
            this.error.set('Error al cargar sesiones de terapia');
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        this.error.set('Error al cargar sesiones de cuidado');
        this.isLoading.set(false);
      }
    });
  }

  getEventsForDay(day: Date | null): CalendarEvent[] {
    if (!day) return [];
    return this.events().filter(event => {
      return event.date.toDateString() === day.toDateString();
    });
  }

  previousMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(date);
  }

  nextMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(date);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day.toDateString() === today.toDateString();
  }

  openEventModal(event: CalendarEvent): void {
    this.selectedEvent.set(event);
    this.showEventModal.set(true);
  }

  closeEventModal(): void {
    this.showEventModal.set(false);
    this.selectedEvent.set(null);
  }
}

