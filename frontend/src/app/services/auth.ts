import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerification(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, {
      token,
      new_password: newPassword
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.role === 'admin';
  }

  getUserRole(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.role : null;
  }
}
