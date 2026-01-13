import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // No need for manual headers - cookies are sent automatically via credentialsInterceptor

  getChallenges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/challenges`);
  }

  getChallenge(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/challenges/${id}`);
  }

  submitFlag(id: string, flag: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/challenges/${id}/submit`, { flag });
  }

  createChallenge(challenge: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/challenges`, challenge);
  }
}
