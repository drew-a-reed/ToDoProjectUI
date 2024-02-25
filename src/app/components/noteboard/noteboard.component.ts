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
      this.done = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'done'
      );
      this.tasks = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'to do'
      );
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
      status: 'To Do',
      description: this.todoForm.value.task,
      done: false,
    };
    this.api.addTask(newTask).subscribe({
      next: (task) => {
        this.api.getAllTasks().subscribe((response) => {
          this.tasks = response;
          this.tasks = this.tasks.filter(
            (task) => task.status.toLowerCase() === 'to do'
          );
        });
      },
    });
    this.todoForm.reset();
  }

  editTask(task: Task, i: number) {
    this.todoForm.controls['task'].setValue(task.description);
    this.updateIndex = i;
    this.isEditEnabled = true;
  }

  updateTask() {
    const updatedTask = this.tasks[this.updateIndex];
    updatedTask.description = this.todoForm.value.task;
    this.api.updateTask(updatedTask).subscribe({
      next: (response) => {
        console.log(response);
        this.tasks[this.updateIndex] = updatedTask;
        this.todoForm.reset();
        this.updateIndex = undefined;
        this.isEditEnabled = false;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  deleteTask(task: Task, i: number) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.tasks.splice(i, 1);
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  deleteTaskInProgress(task: Task, i: number) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.inProgress.splice(i, 1);
        },
        (error) => {
          console.error('Error deleting task in progress:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  deleteTaskDone(task: Task, i: number) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.done.splice(i, 1);
        },
        (error) => {
          console.error('Error deleting task done:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  drop(event: CdkDragDrop<Task[]>, category: string) {
    let targetArray: Task[];
    let status: string;

    switch (category) {
      case 'tasks':
        targetArray = this.tasks;
        status = 'To Do';
        break;
      case 'inProgress':
        targetArray = this.inProgress;
        status = 'In Progress';
        break;
      case 'done':
        targetArray = this.done;
        status = 'Done';
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
      const movedTask = event.previousContainer.data[event.previousIndex];
      movedTask.status = status;

      transferArrayItem(
        event.previousContainer.data,
        targetArray,
        event.previousIndex,
        event.currentIndex
      );

      this.api.updateTask(movedTask).subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }


}
