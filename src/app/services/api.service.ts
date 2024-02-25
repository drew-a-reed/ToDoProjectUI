import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = 'https://localhost:7174/api/';

  constructor(private http: HttpClient) { }

  getAllUsers(){
    return this.http.get<any>(`${this.baseUrl}User`);
  }

  getAllTasks(){
    return this.http.get<Task[]>(`${this.baseUrl}Task`);
  }

  addTask(task: Task){
    return this.http.post<Task>(`${this.baseUrl}Task`, task);
  }

  updateTask(task: Task){
    return this.http.put<any>(`${this.baseUrl}Task/${task.id}`, task);
  }

  deleteTask(id: string){
    return this.http.delete<Task>(`${this.baseUrl}Task/${id}`);
  }

}
