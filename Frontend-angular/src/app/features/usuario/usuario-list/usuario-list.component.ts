import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginationParams } from '../../../core/models/api-response.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { CreateUsuarioRequest, UpdateUsuarioRequest, Usuario, UsuarioFilters } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  filters: UsuarioFilters = {};
  
  // Modal properties
  showModal = false;
  editingUsuario: Usuario | null = null;
  usuarioForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      nombre_usuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      contraseña: [''],
      es_admin: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.usuarioService.getUsuarios(pagination, this.filters).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        // Si el backend no está disponible, usar datos mock
        if (error.status === 0 || error.status === undefined) {
          console.log('Backend no disponible, usando datos mock para usuarios');
          this.usuarios = [{
            id: '1',
            nombre: 'Administrador',
            nombre_usuario: 'admin',
            email: 'admin@itm.edu.co',
            telefono: '',
            activo: true,
            es_admin: true,
            fecha_creacion: new Date().toISOString(),
            fecha_edicion: new Date().toISOString()
          }];
          this.totalPages = 1;
        }
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsuarios();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadUsuarios();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsuarios();
    }
  }

  openCreateModal(): void {
    this.editingUsuario = null;
    this.usuarioForm.reset({
      nombre: '',
      nombre_usuario: '',
      email: '',
      telefono: '',
      contraseña: '',
      es_admin: false
    });
    this.showModal = true;
  }

  editUsuario(usuario: Usuario): void {
    this.editingUsuario = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
      telefono: usuario.telefono || '',
      contraseña: '',
      es_admin: usuario.es_admin
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUsuario = null;
    this.usuarioForm.reset();
  }

  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    if (!this.editingUsuario && !this.usuarioForm.get('contraseña')?.value) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }

    const formValue = this.usuarioForm.value;

    if (this.editingUsuario) {
      // Actualizar usuario existente
      const updateData: UpdateUsuarioRequest = {
        nombre: formValue.nombre,
        nombre_usuario: formValue.nombre_usuario,
        email: formValue.email,
        telefono: formValue.telefono,
        es_admin: formValue.es_admin
      };
      
      this.usuarioService.updateUsuario(this.editingUsuario.id, updateData).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          alert('Error al actualizar el usuario');
        }
      });
    } else {
      // Crear nuevo usuario
      const newUsuario: CreateUsuarioRequest = {
        nombre: formValue.nombre,
        nombre_usuario: formValue.nombre_usuario,
        email: formValue.email,
        telefono: formValue.telefono,
        contraseña: formValue.contraseña,
        password: formValue.contraseña, // Alias for frontend compatibility
        apellido: formValue.apellido || '', // Add missing field
        es_admin: formValue.es_admin
      };
      
      this.usuarioService.createUsuario(newUsuario).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          alert('Error al crear el usuario');
        }
      });
    }
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar el usuario "${usuario.email}"?`)) {
      this.usuarioService.deleteUsuario(usuario.id).subscribe({
        next: () => {
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  desactivarUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de desactivar el usuario "${usuario.email}"?`)) {
      this.usuarioService.desactivarUsuario(usuario.id).subscribe({
        next: () => {
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Error al desactivar usuario:', error);
          alert('Error al desactivar el usuario');
        }
      });
    }
  }
}
