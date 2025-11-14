import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UsuarioCreate } from '../../../shared/models/usuario.model';

interface RegisterData extends UsuarioCreate {
	confirmPassword: string;
	telefono?: string;
	esAdmin: boolean;
}

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="auth-wrapper">
			<div class="auth-card">
				<h1>Crear cuenta</h1>
				<form #registerForm="ngForm" (ngSubmit)="onSubmit()">
					<div class="grid">
						<label>
							Nombre
							<input
								type="text"
								name="nombre"
								required
								minlength="2"
								[(ngModel)]="registerData.nombre"
								[disabled]="loading"
							/>
						</label>
						<label>
							Apellido
							<input
								type="text"
								name="apellido"
								required
								minlength="2"
								[(ngModel)]="registerData.apellido"
								[disabled]="loading"
							/>
						</label>
					</div>

					<label>
						Correo electrónico
						<input
							type="email"
							name="email"
							required
							[(ngModel)]="registerData.email"
							[disabled]="loading"
						/>
					</label>

					<div class="grid">
						<label>
							Documento
							<input
								type="text"
								name="numero_documento"
								required
								[(ngModel)]="registerData.numero_documento"
								[disabled]="loading"
							/>
						</label>
						<label>
							Rol (ID)
							<input
								type="text"
								name="id_rol"
								required
								[(ngModel)]="registerData.id_rol"
								[disabled]="loading"
							/>
						</label>
					</div>

					<div class="grid">
						<label>
							Tipo documento (ID)
							<input
								type="text"
								name="id_tipo_documento"
								required
								[(ngModel)]="registerData.id_tipo_documento"
								[disabled]="loading"
							/>
						</label>
						<label>
							Sexo (ID opcional)
							<input
								type="text"
								name="id_sexo"
								[(ngModel)]="registerData.id_sexo"
								[disabled]="loading"
							/>
						</label>
					</div>

					<div class="grid">
						<label>
							Contraseña
							<input
								type="password"
								name="password"
								required
								minlength="6"
								[(ngModel)]="registerData.password"
								[disabled]="loading"
							/>
						</label>
						<label>
							Confirmar contraseña
							<input
								type="password"
								name="confirmPassword"
								required
								minlength="6"
								[(ngModel)]="registerData.confirmPassword"
								[disabled]="loading"
							/>
						</label>
					</div>

					<label class="checkbox">
						<input
							type="checkbox"
							name="esAdmin"
							[(ngModel)]="registerData.esAdmin"
							[disabled]="loading"
						/>
						Registrar como administrador
					</label>

					<button type="submit" [disabled]="loading || !registerForm.valid">
						{{ loading ? 'Registrando...' : 'Registrarse' }}
					</button>
				</form>
			</div>
		</div>
	`,
	styles: [`
		.auth-wrapper {
			display: grid;
			place-items: center;
			min-height: 100vh;
			background: linear-gradient(135deg, #0f172a, #1e293b);
			padding: 1.5rem;
		}
		.auth-card {
			width: min(520px, 100%);
			padding: 2.25rem;
			border-radius: 1.25rem;
			background: rgba(15, 23, 42, 0.9);
			color: white;
			box-shadow: 0 22px 48px rgba(15, 23, 42, 0.38);
		}
		h1 {
			margin: 0 0 1.75rem;
			font-size: 1.9rem;
			text-align: center;
			font-weight: 700;
		}
		form {
			display: grid;
			gap: 1rem;
		}
		.grid {
			display: grid;
			gap: 1rem;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
		label {
			display: grid;
			gap: 0.35rem;
			font-weight: 500;
		}
		input[type='text'],
		input[type='email'],
		input[type='password'] {
			width: 100%;
			padding: 0.75rem;
			border-radius: 0.7rem;
			border: 1px solid rgba(255, 255, 255, 0.15);
			background: rgba(15, 23, 42, 0.62);
			color: inherit;
		}
		input:disabled {
			opacity: 0.6;
		}
		.checkbox {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			font-size: 0.95rem;
		}
		button[type='submit'] {
			margin-top: 0.5rem;
			padding: 0.9rem;
			border: none;
			border-radius: 0.8rem;
			background: linear-gradient(135deg, #22d3ee, #6366f1);
			color: white;
			font-weight: 600;
			cursor: pointer;
		}
	`]
})
export class RegisterComponent {
	@ViewChild('registerForm', { static: false }) private formRef?: NgForm;

	registerData: RegisterData = this.createInitialData();
	loading = false;

	constructor(
		private readonly usuarioService: UsuarioService,
		private readonly notificationService: NotificationService,
		private readonly router: Router
	) {}

	onSubmit(): void {
		if (this.loading) {
			return;
		}

		const form = this.formRef;
		if (form && form.invalid) {
			form.form.markAllAsTouched();
			return;
		}

		if (this.registerData.password !== this.registerData.confirmPassword) {
			this.notificationService.showError('Las contraseñas no coinciden.');
			return;
		}

		const payload: UsuarioCreate = {
			nombre: this.registerData.nombre.trim(),
			apellido: this.registerData.apellido.trim(),
			email: this.registerData.email.trim(),
			password: this.registerData.password,
			numero_documento: this.registerData.numero_documento.trim(),
			id_rol: this.registerData.id_rol ?? '',
			id_tipo_documento: this.registerData.id_tipo_documento ?? '',
			id_sexo: this.registerData.id_sexo || null,
			id_usuario_crea: null
		};

		if (this.registerData.esAdmin) {
			payload.id_rol = payload.id_rol || 'admin';
		}

		this.loading = true;
		this.usuarioService.create(payload).subscribe({
			next: () => this.handleSuccess(),
			error: error => this.handleError(error)
		});
	}

	private handleSuccess(): void {
		this.notificationService.showSuccess('Usuario registrado exitosamente.');
		this.resetFormState();
		this.router.navigate(['/auth/login']);
		this.loading = false;
	}

	private handleError(error: unknown): void {
		console.error('Error al registrar usuario', error);
		this.notificationService.showError('Error al registrar usuario. Intente nuevamente.');
		this.loading = false;
	}

	private resetFormState(): void {
		this.formRef?.resetForm();
		this.registerData = this.createInitialData();
	}

	private createInitialData(): RegisterData {
		return {
			nombre: '',
			apellido: '',
			email: '',
			password: '',
			confirmPassword: '',
			numero_documento: '',
			id_rol: '',
			id_tipo_documento: '',
			id_sexo: null,
			id_usuario_crea: null,
			telefono: '',
			esAdmin: false
		};
	}
}
