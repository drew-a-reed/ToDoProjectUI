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
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { TaskService } from 'src/app/services/task.service';
import { ActivatedRoute } from '@angular/router';

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
  status?: string;
  dueDate?: string;
  users: IUser[] = [];
  role!: string;
  fullName: string = '';
  userList = new FormControl<IUser[]>([]);
  user: IUser | undefined;
  usersAssignedToTask:  IUser[] = [];
  taskUserMap: { [taskId: string]: IUser[] } = {};
  priorities: string[] = ['Low', 'Medium', 'High', 'Stuck'];
  priorityList = new FormControl<ITask[]>([]);
  taskboardId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private userStore: UserStoreService,
    private taskService: TaskService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      task: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['', Validators.required]
    });

    this.activatedRoute.queryParams.subscribe(val => {
      this.taskboardId = val['taskboardId'];
    })

    this.userService.getAllUsers().subscribe((response) => {
      this.users = response;
    });

    if(this.taskboardId){
      this.getAllTasks(this.taskboardId);
    }

    this.userStore.getFullNameFromStore().subscribe((val) => {
      const fullNameFromToken = this.auth.getFullNameFromToken();
      this.fullName = val || fullNameFromToken;
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });
  }

  getAllTasks(taskboardId: string) {
    console.log(taskboardId);

    this.taskService.getAllTasks(taskboardId).subscribe((response) => {
      this.tasks = response;
console.log(this.tasks);

      this.inProgress = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'in progress'
      );
      this.done = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'done'
      );
      this.tasks = this.tasks.filter(
        (task) => task.status.toLowerCase() === 'to do'
      );

      [...this.tasks, ...this.inProgress, ...this.done].forEach((task) => {
        if (task['taskId'] !== undefined) {
          this.userService.getAssignedUsersForTask(task['taskId']).subscribe((users) => {
            if (task['taskId'] !== undefined) {
              this.taskUserMap[task['taskId']] = users;
            }
          });
        }
      });
    });
  }

  addTask() {

    const newTask: ITask = {
      status: 'To Do',
      title: this.todoForm.value.task,
      assignedDate: new Date(),
      dueDate: this.todoForm.value.date,
      description: this.todoForm.value.description,
      priority: this.todoForm.value.priority,
      done: false,
    };

    console.log(newTask);

    this.taskService.addTask(newTask).subscribe({

      next: (response) => {
        const taskId = response['taskId'];
        if (taskId) {
          this.addUserTask(taskId);
        } else {
          console.error('Task ID is undefined');
        }
        if (this.taskboardId) {
          this.getAllTasks(this.taskboardId);
        }
      },
    });

    this.todoForm.reset();
  }

  addUserTask(taskId: string) {
    const selectedUsers = this.userList.value;

    if (selectedUsers && selectedUsers.length > 0) {
      const selectedUserIds = selectedUsers.map((user) => user['userId']);

      this.userService.deleteUsersFromTask(taskId).subscribe({
        next: () => {
          this.userService.addUserTasks(selectedUserIds, taskId).subscribe({
            next: (response) => {
              if (this.taskboardId) {
                this.getAllTasks(this.taskboardId);
              }
            },
            error: (error) => {
              console.error('Error adding user tasks:', error);
            },
          });
        },
        error: (error) => {
          console.error('Error deleting existing user tasks:', error);
        },
      });
    }
    this.userList.reset();
  }

  editTask(task: ITask) {
    if (task && task['taskId']) {
      this.status = task.status;
      this.taskId = task['taskId'];
      this.todoForm.controls['task'].setValue(task.title);
      this.todoForm.controls['date'].setValue(task.dueDate);
      this.todoForm.controls['description'].setValue(task.description);
      this.todoForm.controls['priority'].setValue(task.priority);
      this.isEditEnabled = true;

      this.userService.getAssignedUsersForTask(task['taskId']).subscribe((users) => {
        this.usersAssignedToTask = users;
        const selectedUsers = users.map(user => this.users.find(u => u['userId'] === user['userId'])!);
        this.userList.setValue(selectedUsers);
      });
    } else {
      console.error('Task ID is undefined');
    }
  }

  updateTask() {
    const status = this.status || 'To Do';

    const updatedTask: ITask = {
      taskId: this.taskId,
      status: status,
      title: this.todoForm.value.task,
      dueDate: this.todoForm.value.date,
      description: this.todoForm.value.description,
      priority: this.todoForm.value.priority,
      done: false,
    };

    this.taskService.updateTask(updatedTask).subscribe({
      next: (response) => {
        const taskId = response['taskId'];
        this.addUserTask(taskId);
        this.todoForm.reset();
        this.isEditEnabled = false;
        if (this.taskboardId) {
          this.getAllTasks(this.taskboardId);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteTask(task: ITask) {
    console.log(task);
    console.log(task['taskId']);


    if (task['taskId']) {
      this.taskService.deleteTask(task['taskId']).subscribe(
        () => {
          this.tasks = this.tasks.filter((t) => t.taskId !== task['taskId']);
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
    if (task['taskId']) {
      this.taskService.deleteTask(task['taskId']).subscribe(
        () => {
          this.inProgress = this.inProgress.filter((t) => t.taskId !== task['taskId']);
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
    if (task['taskId']) {
      this.taskService.deleteTask(task['taskId']).subscribe(
        () => {
          this.done = this.done.filter((t) => t.taskId !== task['taskId']);
        },
        (error) => {
          console.error('Error deleting task done:', error);
        }
      );
    } else {
      console.error('Task ID is undefined');
    }
  }

  getBackgroundColor(priority: string): string {
    switch (priority) {
      case 'Low':
        return '#238240';
      case 'Medium':
        return '#fce803';
      case 'High':
        return '#B3180C';
      case 'Stuck':
        return 'repeating-linear-gradient(45deg, #FFFF00, #FFFF00 10px, #000000 10px, #000000 20px)';
      default:
        return '#000';
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

      this.taskService.updateTask(movedTask).subscribe({
        next: (response) => {
          if (this.taskboardId) {
            this.getAllTasks(this.taskboardId);
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }
}
