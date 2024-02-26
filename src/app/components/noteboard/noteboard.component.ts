import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { ITask } from 'src/app/models/task';
import { IUser } from 'src/app/models/user';
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
  task!: ITask;
  tasks: ITask[] = [];
  taskId?: string;
  inProgress: ITask[] = [];
  done: ITask[] = [];
  isEditEnabled: boolean = false;
  users: IUser[] = [];
  role!: string;
  fullName: string = '';
  userList = new FormControl<IUser[]>([]);
  user: IUser | undefined;

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

    this.api.getAllUsers().subscribe((response) => {
      this.users = response;
    });

    this.getAllTasks();

    this.userStore.getFullNameFromStore().subscribe((val) => {
      const fullNameFromToken = this.auth.getFullNameFromToken();
      this.fullName = val || fullNameFromToken;
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });
  }

  getAllTasks() {
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
  }

  addTask() {
    const newTask: ITask = {
      status: 'To Do',
      description: this.todoForm.value.task,
      done: false,
    };

    this.api.addTask(newTask).subscribe({
      next: (response) => {
        const taskId = response['taskId'];
        this.addUserTask(taskId);

        this.getAllTasks();
      },
    });

    this.todoForm.reset();
  }

  addUserTask(taskId: string) {
    const selectedUsers = this.userList.value;

    if (selectedUsers && selectedUsers.length > 0) {
      const selectedUserIds = selectedUsers.map((user) => user.id);

      this.api.addUserTasks(selectedUserIds, taskId).subscribe({
        next: (response) => {
          console.log('User tasks added:', response);
        },
        error: (error) => {
          console.error('Error adding user tasks:', error);
        },
      });
    }
    this.userList.reset();
  }

  editTask(task: ITask) {
    if (task && task.id) {
      this.taskId = task.id;
      this.todoForm.controls['task'].setValue(task.description);
      this.isEditEnabled = true;

    } else {
      console.error('Task ID is undefined');
    }
  }

  updateTask() {
    const updatedTask: ITask = {
      id: this.taskId,
      status: 'To Do',
      description: this.todoForm.value.task,
      done: false,
    };

    this.api.updateTask(updatedTask).subscribe({
      next: (response) => {
        const taskId = response['taskId'];
        this.addUserTask(taskId);
        this.todoForm.reset();
        this.isEditEnabled = false;
        this.getAllTasks();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteTask(task: ITask) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.tasks = this.tasks.filter((t) => t.id !== task.id);
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  deleteTaskInProgress(task: ITask) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.inProgress = this.inProgress.filter((t) => t.id !== task.id);
        },
        (error) => {
          console.error('Error deleting task in progress:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  deleteTaskDone(task: ITask) {
    if (task.id) {
      this.api.deleteTask(task.id).subscribe(
        () => {
          this.done = this.done.filter((t) => t.id !== task.id);
        },
        (error) => {
          console.error('Error deleting task done:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  drop(event: CdkDragDrop<ITask[]>, category: string) {
    let targetArray: ITask[];
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
        },
      });
    }
  }
}
