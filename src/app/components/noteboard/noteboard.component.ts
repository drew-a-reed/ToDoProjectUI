import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Task } from 'src/app/models/task.model';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-noteboard',
  templateUrl: './noteboard.component.html',
  styleUrls: ['./noteboard.component.scss'],
})
export class NoteBoardComponent implements OnInit {
  todoForm!: FormGroup;
  tasks: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];
  updateIndex!: any;
  isEditEnabled: boolean = false;
  public users: any = [];
  public role!: string;
  public fullName: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private userStore: UserStoreService
  ) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      task: ['', Validators.required],
    });

    this.api.getAllUsers().subscribe((res) => {
      this.users = res;
    });

    this.api.getAllTasks().subscribe((response) => {
      this.tasks = response;
      this.inProgress = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'in progress'
      );
      this.done = this.tasks.filter((task) => task.status.toLowerCase() === 'done');
      this.tasks = this.tasks.filter((task) => task.status.toLowerCase() === 'to do');
    });

    this.userStore.getFullNameFromStore().subscribe((val) => {
      const fullNameFromToken = this.auth.getFullNameFromToken();
      this.fullName = val || fullNameFromToken;
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });
  }

  addTask() {
    const newTask: Task = {
      id: '',
      status: 'To Do',
      description: this.todoForm.value.task,
      done: false,
    };
    this.tasks.push(newTask);
    this.todoForm.reset();
  }

  editTask(task: Task, i: number) {
    this.todoForm.controls['task'].setValue(task.description);
    this.updateIndex = i;
    this.isEditEnabled = true;
  }

  updateTask() {
    this.tasks[this.updateIndex].description = this.todoForm.value.task;
    this.tasks[this.updateIndex].done = false;
    this.todoForm.reset();
    this.updateIndex = undefined;
    this.isEditEnabled = false;
  }

  deleteTask(task: Task, i: number) {
    this.api.deleteTask(task.id).subscribe(
      () => {
        this.tasks.splice(i, 1);
      },
      (error) => {
        console.error('Error deleting task:', error);
      }
    );
  }


  deleteTaskInProgress(i: number) {
    this.inProgress.splice(i, 1);
  }

  deleteTaskDone(i: number) {
    this.done.splice(i, 1);
  }

  drop(event: CdkDragDrop<Task[]>, category: string) {
    let targetArray: Task[];

    switch (category) {
      case 'tasks':
        targetArray = this.tasks;
        break;
      case 'inProgress':
        targetArray = this.inProgress;
        break;
      case 'done':
        targetArray = this.done;
        break;
      default:
        return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        targetArray,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
