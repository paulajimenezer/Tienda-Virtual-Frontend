import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario, UsuarioCreate, UsuarioUpdate, UsuarioFilters } from '../../../shared/models/usuario.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss']
})
export class UsuarioListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly usersEndpoint = `${this.apiUrl}/usuarios/`;
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  readonly rolesOptions = [
    { id: 'a295ed20-9aa4-4819-afab-d7f3480bed7d', label: 'Cliente' },
    { id: 'ca26014d-6a7f-449f-ae64-eedcb017e9a3', label: 'Administrador' },
  ];

  readonly tipoDocumentoOptions = [
    { id: '09cac2ca-72b0-4578-8b2f-b4e53e9b14e9', label: 'TI' },
    { id: 'ed16b917-2a00-48e6-a58c-09ebf7c87d0d', label: 'CC' },
    { id: 'dfb2f5a4-967f-4507-a86e-88c4729f7f61', label: 'PP' },
  ];

  readonly sexoOptions = [
    { id: 'fd2e7d39-7c3f-4524-8618-61d58360a20d', label: 'Femenino' },
    { id: '5e5d56e6-56af-435b-bccb-1440e604ddb5', label: 'Masculino' },
    { id: '20280792-9e56-4050-babf-a4505852a364', label: 'Otro' },
  ];

  usuarios: Usuario[] = [];
  private allUsuarios: Usuario[] = [];
  private filteredUsuarios: Usuario[] = [];
  private currentUserId: string | null = null;

  filters = {
    nombre: '',
    email: '',
    activo: ''
  };

  loading = false;
  saving = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  editingId: string | null = null;
  modalOpen = false;
  modalTitle = 'Nuevo usuario';

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    numero_documento: ['', Validators.required],
    id_rol: ['', Validators.required],
    id_tipo_documento: ['', Validators.required],
    id_sexo: [''],
    activo: [true]
  });

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;
    this.loadData();
  }

  private buildFilters(): UsuarioFilters {
    return {
      nombre: this.filters.nombre.trim() || undefined,
      email: this.filters.email.trim() || undefined,
      activo:
        this.filters.activo === ''
          ? undefined
          : this.filters.activo === 'true'
    };
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    
    console.log('🔍 Cargando usuarios desde:', `${this.apiUrl}/usuarios/`);
    console.log('🔑 Token en localStorage:', localStorage.getItem('auth_token') ? 'SÍ' : 'NO');
    
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/`).subscribe({
      next: data => {
        console.log('✅ Usuarios recibidos:', data.length);
        this.allUsuarios = data ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        console.error('❌ Error al cargar usuarios:', err);
        console.error('Status:', err.status);
        console.error('Detail:', err.error);
        this.errorMessage = 'No fue posible cargar los usuarios.';
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const termNombre = this.filters.nombre.trim().toLowerCase();
    const termEmail = this.filters.email.trim().toLowerCase();
    const filterActivo = this.filters.activo;

    this.filteredUsuarios = this.allUsuarios.filter(usuario => {
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
      const matchesNombre = !termNombre || nombreCompleto.includes(termNombre);
      const matchesEmail = !termEmail || usuario.email.toLowerCase().includes(termEmail);
      const matchesActivo =
        filterActivo === '' ||
        (filterActivo === 'true' && usuario.activo !== false) ||
        (filterActivo === 'false' && usuario.activo === false);
      return matchesNombre && matchesEmail && matchesActivo;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredUsuarios.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.usuarios = this.filteredUsuarios.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { nombre: '', email: '', activo: '' };
    this.onFilterChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  openCreateModal(): void {
    this.modalTitle = 'Nuevo usuario';
    this.editingId = null;
    this.form.reset({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      numero_documento: '',
      id_rol: this.rolesOptions[0]?.id ?? '',
      id_tipo_documento: this.tipoDocumentoOptions[0]?.id ?? '',
      id_sexo: '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.modalOpen = true;
  }

  edit(usuario: Usuario): void {
    this.modalTitle = 'Editar usuario';
    this.editingId = usuario.id;
    this.form.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '',
      numero_documento: usuario.numero_documento,
      id_rol: usuario.id_rol,
      id_tipo_documento: usuario.id_tipo_documento,
      id_sexo: usuario.id_sexo ?? '',
      activo: usuario.activo ?? true
    });
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
  }

  toggleModal(event: MouseEvent): void {
    event.stopPropagation();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const payload: Partial<UsuarioCreate & UsuarioUpdate> = {
      nombre: formValue.nombre ?? '',
      apellido: formValue.apellido ?? '',
      email: formValue.email ?? '',
      numero_documento: formValue.numero_documento ?? '',
      id_rol: formValue.id_rol ?? '',
      id_tipo_documento: formValue.id_tipo_documento ?? '',
      id_sexo: formValue.id_sexo ? formValue.id_sexo : null,
      activo: formValue.activo ?? true
    };

    if (!this.editingId) {
      if (!formValue.password) {
        this.form.get('password')?.setErrors({ required: true });
        this.form.markAllAsTouched();
        return;
      }
      (payload as UsuarioCreate).password = formValue.password;
    } else if (formValue.password) {
      (payload as UsuarioUpdate).password = formValue.password;
    }

    this.saving = true;
    const request$ = this.editingId
      ? this.http.put<Usuario>(`${this.apiUrl}/usuarios/${this.editingId}/`, payload)
      : this.http.post<Usuario>(`${this.apiUrl}/usuarios/`, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;
        this.loadData();
      },
      error: err => {
        this.errorMessage = this.editingId
          ? 'Error al actualizar el usuario.'
          : 'Error al crear el usuario.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  remove(usuario: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${usuario.email}?`)) {
      return;
    }
    this.saving = true;
    const payload = {
      activo: false,
      id_usuario_edita: this.currentUserId ?? undefined
    };
    this.http.put(`${this.apiUrl}/usuarios/${usuario.id}/`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.loadData();
      },
      error: err => {
        this.errorMessage = 'Error al eliminar el usuario.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  getRoleLabel(id: string): string {
    return this.rolesOptions.find(option => option.id === id)?.label ?? id;
  }

  getTipoDocumentoLabel(id: string): string {
    return this.tipoDocumentoOptions.find(option => option.id === id)?.label ?? id;
  }

  getSexoLabel(id?: string | null): string {
    if (!id) return 'Sin definir';
    return this.sexoOptions.find(option => option.id === id)?.label ?? id;
  }
}