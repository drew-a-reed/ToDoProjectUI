import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITaskboard } from '../models/taskboard';

@Injectable({
  providedIn: 'root',
})
export class UserTaskboardService {
  private baseUrlDev: string = 'https://localhost:7174/api/usertaskboard/';
  private baseUrl: string =
    'https://taskeeperapi.azurewebsites.net/api/usertaskboard/';

  constructor(private http: HttpClient) {}

  addUserToTaskboard(userTaskboard: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}`, userTaskboard, { headers });
  }

  getUserTaskboards(userId: any){
    return this.http.get<any>(`${this.baseUrl}${userId}`);
  }

}
