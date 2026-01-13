import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ChallengeListComponent } from './components/challenge-list/challenge-list';
import { ChallengeDetailComponent } from './components/challenge-detail/challenge-detail';
import { ScoreboardComponent } from './components/scoreboard/scoreboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { VerifyEmailComponent } from './components/verify-email/verify-email';
import { inject } from '@angular/core';
import { AuthService } from './services/auth';

const authGuard = () => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    return true;
  }
  return false;
};

const adminGuard = () => {
  const authService = inject(AuthService);
  if (authService.isAdmin()) {
    return true;
  }
  // Redirect to challenges if not admin
  return false;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'challenges', component: ChallengeListComponent, canActivate: [authGuard] },
  { path: 'challenges/:id', component: ChallengeDetailComponent, canActivate: [authGuard] },
  { path: 'scoreboard', component: ScoreboardComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
