import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITaskboard } from '../models/taskboard';

@Injectable({
  providedIn: 'root',
})
export class TaskboardService {
  private baseUrlDev: string = 'https://localhost:7174/api/';
  private baseUrl: string =
    'https://taskeeperapi.azurewebsites.net/api/taskboard/';

  constructor(private http: HttpClient) {}

  signUp(taskboardObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, taskboardObj);
  }

  login(taskboardObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, taskboardObj);
  }

  addUserToTaskboard(taskboardId: string, userId: string) {
    const body = { taskboardId, userId };
    return this.http.post<any>('https://taskeeperapi.azurewebsites.net/api/usertaskboard/', body);
  }

}
