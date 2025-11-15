import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent],
  template: `
    <ng-container *ngIf="isLoggedIn; else publicLayout">
      <div class="wrapper">
        <aside class="sidebar-container" data-color="brand">
          <app-sidebar></app-sidebar>
        </aside>
        <main class="main-panel">
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </ng-container>
    <ng-template #publicLayout>
      <div class="public-wrapper">
        <router-outlet></router-outlet>
      </div>
    </ng-template>
  `,
  styles: [`
    .wrapper {
      display: flex;
      min-height: 100vh;
    }

    .sidebar-container {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1000;
      width: 260px;
      background: linear-gradient(140deg, #0f172a 0%, #1c2640 55%, #1e293b 100%);
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.4);
      transition: all 0.3s ease;
      border-right: 1px solid rgba(148, 163, 184, 0.12);
    }

    .main-panel {
      flex: 1;
      margin-left: 260px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .content {
      padding: 0;
    }

    @media (max-width: 991px) {
      .sidebar-container {
        transform: translate3d(-260px, 0, 0);
        transition: all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1);
      }

      .sidebar-container.show {
        transform: translate3d(0, 0, 0);
      }

      .main-panel {
        margin-left: 0;
      }
    }

    .public-wrapper {
      min-height: 100vh;
			background: linear-gradient(135deg, #0f172a, #1e293b);
      display: flex;
      align-items: stretch;
      justify-content: center;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend-angular-clean-architecture';
  isLoggedIn = false;
  private authSub?: Subscription;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}