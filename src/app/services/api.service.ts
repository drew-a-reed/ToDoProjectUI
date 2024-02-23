import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    return this.http.get<any>(`${this.baseUrl}Task`);
  }

  deleteTask(id: string){
    return this.http.delete<any>(`${this.baseUrl}Task/${id}`);
  }

}
