import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITaskboard } from '../models/taskboard';

@Injectable({
  providedIn: 'root',
})
export class TaskboardService {
  private baseUrlDev: string = 'https://localhost:7174/api/taskboard/';
  private baseUrl: string =
    'https://taskeeperapi.azurewebsites.net/api/taskboard/';

  constructor(private http: HttpClient) {}

  createTaskboard(taskboardObj: any) {
    return this.http.post<any>(`${this.baseUrlDev}register`, taskboardObj);
  }

  login(taskboardObj: any) {
    return this.http.post<any>(`${this.baseUrlDev}authenticate`, taskboardObj);
  }

  addUserToTaskboard(taskboardId: string, userId: string, role: string) {
    const body = { taskboardId, userId, role };
    return this.http.post<any>('https://taskeeperapi.azurewebsites.net/api/usertaskboard/', body);
  }

}
