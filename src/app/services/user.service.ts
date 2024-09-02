import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITask } from '../models/task';
import { IUser } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrlDev: string = 'https://localhost:7174/api/';
  private baseUrl: string = 'https://taskeeperapi.azurewebsites.net/api/';

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<any>(`${this.baseUrl}User/users`);
  }

  getUserById(userId: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.baseUrl}User/${userId}`);
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
