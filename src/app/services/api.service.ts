import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITask } from '../models/task';
import { IUser } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // private baseUrl: string = 'https://localhost:7174/api/';
  private baseUrl: string = 'https://taskeep.azurewebsites.net/api/';

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<any>(`${this.baseUrl}User/users`);
  }

  getUserById(userId: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.baseUrl}User/${userId}`);
  }

  getAllTasks() {
    return this.http.get<ITask[]>(`${this.baseUrl}Task`);
  }

  addTask(task: ITask) {
    return this.http.post<ITask>(`${this.baseUrl}Task`, task);
  }

  updateTask(task: ITask) {
    return this.http.put<any>(`${this.baseUrl}Task/${task.taskId}`, task);
  }

  deleteTask(taskId: string) {
    return this.http.delete<ITask>(`${this.baseUrl}Task/${taskId}`);
  }

  addUserTasks(userIds: string[], taskId: string) {
    const userTasks = userIds.map((userId) => {
      return { userId, taskId: taskId };
    });
    return this.http.post<any>(`${this.baseUrl}UserTask/user-tasks`, userTasks);
  }

  getAssignedUsersForTask(taskId: string) {
    return this.http.get<IUser[]>(`${this.baseUrl}UserTask/users/${taskId}/tasks`);
  }

  deleteUsersFromTask(taskId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}UserTask/tasks/${taskId}`);
  }
}
