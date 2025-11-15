import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../../../shared/models/categoria.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categoria-list.component.html',
  styleUrls: ['./categoria-list.component.scss']
})
export class CategoriaListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly categoriaService = inject(CategoriaService);

  categorias: Categoria[] = [];
  private allCategorias: Categoria[] = [];
  private filteredCategorias: Categoria[] = [];
  private serverFilterSnapshot = { nombre: '' };
  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';
  modalOpen = false;
  modalTitle = 'Nueva categoría';

  isAdmin = false;

  filters = {
    nombre: '',
    descripcion: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const nombre = this.filters.nombre.trim();
    const request$ = nombre
      ? this.categoriaService.getByNombre(nombre).pipe(
          map(categoria => (categoria ? [categoria] : [])),
          catchError(err => {
            if (err.status === 404) {
              return of([]);
            }
            return throwError(() => err);
          })
        )
      : this.categoriaService.list();

    request$.subscribe({
      next: data => {
        this.allCategorias = data ?? [];
        if (nombre && this.allCategorias.length === 0) {
          this.errorMessage = 'No se encontraron categorías con ese nombre.';
        }
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
        this.updateServerFilterSnapshot();
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar las categorías.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const nombreTerm = this.filters.nombre.trim().toLowerCase();
    const descripcionTerm = this.filters.descripcion.trim().toLowerCase();

    this.filteredCategorias = this.allCategorias.filter(categoria => {
      const nombre = (categoria.nombre ?? '').toLowerCase();
      const descripcion = (categoria.descripcion ?? '').toLowerCase();
      const matchesNombre = !nombreTerm || nombre.includes(nombreTerm);
      const matchesDescripcion = !descripcionTerm || descripcion.includes(descripcionTerm);
      return matchesNombre && matchesDescripcion;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredCategorias.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.categorias = this.filteredCategorias.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    if (this.shouldRefetchFromServer()) {
      this.loadData();
    } else {
      this.applyFilters();
    }
  }

  clearFilters(): void {
    this.filters = { nombre: '', descripcion: '' };
    this.loadData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  resetForm(): void {
    this.form.reset({ nombre: '', descripcion: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nueva categoría';
    this.resetForm();
    this.modalOpen = true;
  }

  edit(categoria: Categoria): void {
    this.editingId = categoria.id;
    this.modalTitle = 'Editar categoría';
    this.form.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion
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

    const { nombre, descripcion } = this.form.value;
    const nombreValor = (nombre ?? '').toString().trim();
    const descripcionValor = (descripcion ?? '').toString().trim();
    if (!nombreValor || !descripcionValor) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    if (this.editingId) {
      const payload: CategoriaUpdate = {
        nombre: nombreValor,
        descripcion: descripcionValor
      };
      this.categoriaService.update(this.editingId, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar la categoría.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: CategoriaCreate = { nombre: nombreValor, descripcion: descripcionValor };
      this.categoriaService.create(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear la categoría.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(categoria: Categoria): void {
    if (!confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) {
      return;
    }
    this.saving = true;
    this.categoriaService.delete(categoria.id).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === categoria.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar la categoría.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  private shouldRefetchFromServer(): boolean {
    return this.filters.nombre.trim() !== this.serverFilterSnapshot.nombre;
  }

  private updateServerFilterSnapshot(): void {
    this.serverFilterSnapshot = { nombre: this.filters.nombre.trim() };
  }
}

