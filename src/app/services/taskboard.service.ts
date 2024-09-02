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
    return this.http.post<any>(`${this.baseUrl}register`, taskboardObj);
  }

  loginTaskboard(taskboardObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, taskboardObj);
  }


}
