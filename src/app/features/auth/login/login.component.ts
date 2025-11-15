import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

interface LoginFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="auth-card">
			<h1>Iniciar sesión</h1>
			<form #loginForm="ngForm" (ngSubmit)="onSubmit()">
				<label>
					Correo electrónico
					<input
						type="email"
						name="email"
						required
						[(ngModel)]="credentials.email"
						[disabled]="loading"
					/>
				</label>

				<label class="password-field">
					Contraseña
					<div class="password-input">
						<input
							[type]="passwordVisible ? 'text' : 'password'"
							name="password"
							required
							minlength="6"
							[(ngModel)]="credentials.password"
							[disabled]="loading"
						/>
						<button type="button" (click)="togglePasswordVisibility()" [disabled]="loading">
							{{ passwordVisible ? 'Ocultar' : 'Mostrar' }}
						</button>
					</div>
				</label>

				<label class="remember">
					<input
						type="checkbox"
						name="rememberMe"
						[(ngModel)]="credentials.rememberMe"
						[disabled]="loading"
					/>
					Recordarme
				</label>

				<button type="submit" [disabled]="loading || !loginForm.valid">
					{{ loading ? 'Ingresando...' : 'Ingresar' }}
				</button>
			</form>
		</div>
	`,
	styles: [
		`:host {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			min-height: 100vh;
			padding: 2.5rem 1.5rem;
			box-sizing: border-box;
		}

		.auth-card {
			width: 100%;
			max-width: 420px;
			padding: 2rem;
			border-radius: 16px;
			/* slightly more translucent so the overlay and public wrapper subtly show through */
			background: rgba(15, 23, 42, 0.78);
			color: white;
			box-shadow: 0 24px 50px rgba(2,6,23,0.55);
			backdrop-filter: blur(4px) saturate(110%);
			position: relative;
			z-index: 2;
			transition: transform 0.18s ease, box-shadow 0.18s ease;
		}

		.auth-card:hover {
			transform: translateY(-4px);
			box-shadow: 0 30px 60px rgba(2,6,23,0.7);
		}
		h1 {
			margin: 0 0 1.5rem;
			font-size: 1.75rem;
			text-align: center;
			font-weight: 700;
		}
		form {
			display: grid;
			gap: 1rem;
		}
		label {
			display: grid;
			gap: 0.35rem;
			font-weight: 500;
		}
		input[type='email'],
		input[type='password'],
		input[type='text'] {
			width: 100%;
			padding: 0.75rem;
			border-radius: 0.6rem;
			border: 1px solid rgba(255, 255, 255, 0.15);
			background: rgba(15, 23, 42, 0.65);
			color: inherit;
		}
		input:disabled {
			opacity: 0.6;
		}
		.password-field .password-input {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 0.5rem;
			align-items: center;
		}
		.password-field button {
			padding: 0.6rem 0.9rem;
			border-radius: 0.5rem;
			border: none;
			background: rgba(255, 255, 255, 0.12);
			color: inherit;
			cursor: pointer;
		}
		.remember {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 0.9rem;
		}
		button[type='submit'] {
			margin-top: 0.5rem;
			padding: 0.85rem;
			border: none;
			border-radius: 0.75rem;
			background: linear-gradient(135deg, #6366f1, #8b5cf6);
			color: white;
			font-weight: 600;
			cursor: pointer;
		}
		.link {
			margin-top: 1rem;
			width: 100%;
			border: none;
			background: none;
			color: rgba(255, 255, 255, 0.8);
			cursor: pointer;
			text-decoration: underline;
		}`
	]
})
export class LoginComponent {
	@ViewChild('loginForm', { static: false }) private formRef?: NgForm;

	credentials: LoginFormData = {
		email: '',
		password: '',
		rememberMe: false
	};

	loading = false;
	passwordVisible = false;

	constructor(
		private readonly authService: AuthService,
		private readonly notificationService: NotificationService,
		private readonly router: Router
	) {}

	togglePasswordVisibility(): void {
		this.passwordVisible = !this.passwordVisible;
	}

	onSubmit(): void {
		if (this.loading) {
			return;
		}

		const form = this.formRef;
		if (form && form.invalid) {
			form.form.markAllAsTouched();
			return;
		}

		const { email, password } = this.credentials;
		if (!email || !password) {
			this.notificationService.showError('Ingrese correo y contraseña.');
			return;
		}

		this.loading = true;
		this.authService.login({ email, password }).subscribe({
			next: (user: any) => this.handleSuccess(user as AuthUser),
			error: (error: any) => this.handleError(error)
		});
	}

	loginAsDemo(): void {
		const demoUser: AuthUser = {
			id: 'demo',
			nombre: 'Admin',
			apellido: 'Demo',
			email: 'admin@demo.com',
			nombreUsuario: 'admin_demo',
			activo: true,
			esAdmin: true,
			rol: 'admin'
		};
		this.authService.setUserData(demoUser, 'demo-token');
		this.notificationService.showSuccess('Inicio de sesión demo exitoso.');
		this.router.navigate(['/dashboard']);
	}

	private handleSuccess(user: AuthUser): void {
		if (!user) {
			this.notificationService.showError('No se recibió información del usuario.');
			this.loading = false;
			return;
		}
		this.notificationService.showSuccess('Inicio de sesión exitoso.');
		this.router.navigate(['/dashboard']);
		this.loading = false;
	}

	private handleError(error: unknown): void {
		console.error('Error al iniciar sesión', error);
		this.notificationService.showError('Credenciales inválidas o cuenta inactiva.');
		this.loading = false;
	}
}
