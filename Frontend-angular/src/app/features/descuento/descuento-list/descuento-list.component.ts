import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Descuento, DescuentoCreate, DescuentoUpdate } from '../../../shared/models/descuento.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-descuento-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './descuento-list.component.html',
  styleUrls: ['./descuento-list.component.scss']
})
export class DescuentoListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly authService = inject(AuthService);

  descuentos: Descuento[] = [];
  private allDescuentos: Descuento[] = [];
  private filteredDescuentos: Descuento[] = [];
  private currentUserId: string | null = null;
  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';
  modalOpen = false;
  modalTitle = 'Nuevo descuento';

  isAdmin = false;

  filters = {
    codigo: '',
    activo: '',
    fecha: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  readonly form = this.fb.group({
    codigo: ['', Validators.required],
    porcentaje: [0, [Validators.required, Validators.min(0)]],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http.get<Descuento[]>(`${this.apiUrl}/descuentos/`).subscribe({
      next: data => {
        this.allDescuentos = data ?? [];
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar los descuentos.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const termCodigo = this.filters.codigo.trim().toLowerCase();
    const activoFiltro = this.filters.activo;
    const fechaFiltro = this.parseDate(this.filters.fecha);

    this.filteredDescuentos = this.allDescuentos.filter(descuento => {
      const matchesCodigo = !termCodigo || (descuento.codigo ?? '').toLowerCase().includes(termCodigo);
      const matchesActivo =
        activoFiltro === '' ||
        (activoFiltro === 'true' && descuento.activo) ||
        (activoFiltro === 'false' && !descuento.activo);
      const matchesFecha = !fechaFiltro || this.isDiscountValidOn(descuento, fechaFiltro);
      return matchesCodigo && matchesActivo && matchesFecha;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredDescuentos.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.descuentos = this.filteredDescuentos.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { codigo: '', activo: '', fecha: '' };
    this.onFilterChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private isDiscountValidOn(descuento: Descuento, date: Date): boolean {
    const inicio = this.parseDate(descuento.fecha_inicio);
    const fin = this.parseDate(descuento.fecha_fin);
    const afterStart = !inicio || inicio <= date;
    const beforeEnd = !fin || fin >= date;
    return afterStart && beforeEnd;
  }

  resetForm(): void {
    this.form.reset({
      codigo: '',
      porcentaje: 0,
      fecha_inicio: '',
      fecha_fin: '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nuevo descuento';
    this.resetForm();
    this.modalOpen = true;
  }

  edit(descuento: Descuento): void {
    this.editingId = descuento.id;
    this.modalTitle = 'Editar descuento';
    this.form.patchValue({
      codigo: descuento.codigo,
      porcentaje: descuento.porcentaje,
      fecha_inicio: descuento.fecha_inicio ? descuento.fecha_inicio.substring(0, 10) : '',
      fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.substring(0, 10) : '',
      activo: descuento.activo
    });
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.resetForm();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const { codigo, porcentaje, fecha_inicio, fecha_fin, activo } = this.form.value;
    const codigoValor = (codigo ?? '').toString().trim().toUpperCase();
    const porcentajeValor = porcentaje == null ? NaN : Number(porcentaje);
    const fechaInicioValor = (fecha_inicio ?? '').toString().trim();
    const fechaFinValor = (fecha_fin ?? '').toString().trim();

    if (!codigoValor || Number.isNaN(porcentajeValor) || !fechaInicioValor || !fechaFinValor) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    const basePayload = {
      codigo: codigoValor,
      porcentaje: porcentajeValor,
      fecha_inicio: fechaInicioValor,
      fecha_fin: fechaFinValor,
      activo: !!activo
    };

    if (this.editingId) {
      const payload: DescuentoUpdate = {
        ...basePayload,
        id_usuario_edita: this.currentUserId ?? undefined
      };
      this.http.put<Descuento>(`${this.apiUrl}/descuentos/${this.editingId}/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar el descuento.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: DescuentoCreate = {
        ...basePayload,
        id_usuario_crea: this.currentUserId ?? undefined
      };
      this.http.post<Descuento>(`${this.apiUrl}/descuentos/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear el descuento.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(descuento: Descuento): void {
    if (!confirm(`¿Eliminar el descuento ${descuento.codigo}?`)) {
      return;
    }
    this.saving = true;
    const payload = {
      activo: false,
      id_usuario_edita: this.currentUserId ?? undefined
    };
    this.http.put(`${this.apiUrl}/descuentos/${descuento.id}/`, payload).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === descuento.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar el descuento.';
        console.error(err);
        this.saving = false;
      }
    });
  }
}
