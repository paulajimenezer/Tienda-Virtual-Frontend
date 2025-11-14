import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="card">
          <div class="card-header text-center">
            <h2 class="card-title">Recuperar Contraseña</h2>
            <p class="text-muted">Ingresa tu email para recibir instrucciones de recuperación</p>
          </div>
          
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #forgotForm="ngForm">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  id="email"
                  class="form-control" 
                  [(ngModel)]="email"
                  name="email"
                  required
                  email
                  #emailInput="ngModel"
                  [class.is-invalid]="emailInput.invalid && emailInput.touched"
                >
                <div class="invalid-feedback" *ngIf="emailInput.invalid && emailInput.touched">
                  <div *ngIf="emailInput.errors?.['required']">El email es requerido</div>
                  <div *ngIf="emailInput.errors?.['email']">El email no es válido</div>
                </div>
              </div>

              <div class="form-group">
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="forgotForm.invalid || loading"
                >
                  <span *ngIf="loading">Enviando...</span>
                  <span *ngIf="!loading">Enviar Instrucciones</span>
                </button>
              </div>

              <div class="text-center mt-3">
                <a routerLink="/auth/login" class="text-decoration-none">
                  ← Volver al inicio de sesión
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .forgot-password-card {
      width: 100%;
      max-width: 400px;
    }
    
    .w-100 {
      width: 100%;
    }
    
    .text-decoration-none {
      text-decoration: none;
    }
    
    .text-decoration-none:hover {
      text-decoration: underline;
    }
    
    .is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  email = '';
  loading = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    // TODO: Implementar verificación de autenticación
  }

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    
    // TODO: Implementar servicio para recuperar contraseña
    // Por ahora solo simulamos el envío
    setTimeout(() => {
      this.notificationService.showSuccess('Se han enviado las instrucciones a tu email');
      this.router.navigate(['/auth/login']);
      this.loading = false;
    }, 2000);
  }
}
