import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITask } from '../models/task';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = 'https://localhost:7174/api/';

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<any>(`${this.baseUrl}User/users`);
  }

  getAllTasks() {
    return this.http.get<ITask[]>(`${this.baseUrl}Task`);
  }

  addTask(task: ITask) {
    return this.http.post<ITask>(`${this.baseUrl}Task`, task);
  }

  updateTask(task: ITask) {
    return this.http.put<any>(`${this.baseUrl}Task/${task.id}`, task);
  }

  deleteTask(id: string) {
    return this.http.delete<ITask>(`${this.baseUrl}Task/${id}`);
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

}
