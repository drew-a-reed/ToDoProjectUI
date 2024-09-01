import { TokenApiModel } from './../models/token-api.model';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Token } from '@angular/compiler';
import { ITask } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrlDev: string = 'https://localhost:7174/api/';
  private baseUrl: string = 'https://taskeeperapi.azurewebsites.net/api/';

  constructor(private http: HttpClient) {}

  getAllTasks(taskboardId: string) {
    return this.http.get<ITask[]>(`${this.baseUrlDev}Task?taskboardId=${taskboardId}`);
  }

  addTask(task: ITask) {
    return this.http.post<ITask>(`${this.baseUrlDev}Task`, task);
  }

  updateTask(task: ITask) {
    return this.http.put<any>(`${this.baseUrlDev}Task/${task.taskId}`, task);
  }

  deleteTask(taskId: string) {
    return this.http.delete<ITask>(`${this.baseUrlDev}Task/${taskId}`);
  }
}
