declare var google: any;
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import ValidateForm from 'src/app/helpers/validateform';
import { ITaskboard } from 'src/app/models/taskboard';
import { IUserTaskboard } from 'src/app/models/user-taskboard.model';
import { AuthService } from 'src/app/services/auth.service';
import { TaskboardService } from 'src/app/services/taskboard.service';
import { UserTaskboardService } from 'src/app/services/user-taskboard.service';

@Component({
  selector: 'app-taskboard-picker',
  templateUrl: './taskboard-picker.component.html',
  styleUrls: ['./taskboard-picker.component.scss']
})
export class TaskboardPickerComponent {
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  loginForm!: FormGroup;
  showModal: boolean = false;
  passwordState: string = 'Show';
  error: string = 'Login failed. Please check your credentials.';
  userId: string | null = null;
  userTaskboard!: IUserTaskboard;
  taskboardId: string | null = null;
  taskboardName?: string;
  taskboards: ITaskboard[] = [];
  taskboardList = new FormControl<IUserTaskboard[]>([]);
  filteredTaskboards!: Observable<ITaskboard[]>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private taskboardService: TaskboardService,
    private auth: AuthService,
    private userTaskboardService: UserTaskboardService
  ) {}

  ngOnInit(): void {

    this.userId = this.auth.getUserId();

    this.loginForm = this.formBuilder.group({
      taskboardName: ['Demo Taskboard', Validators.required],
      taskboardPassword: ['Password123!', Validators.required],
    });

    if (this.userId){
      this.getAllTaskboards(this.userId);
    }

  }

  private _filter(value: string): ITaskboard[] {
    const filterValue = value.toLowerCase();
    return this.taskboards.filter(taskboard => taskboard.taskboardName.toLowerCase().includes(filterValue));
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
    this.isText ? (this.passwordState = 'Hide') : (this.passwordState = 'Show');
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.taskboardService.loginTaskboard(this.loginForm.value).subscribe({
        next: (response) => {
          this.taskboardId = response.taskboardId;

          this.userTaskboard = this.userTaskboard || {};

          if (this.taskboardId && this.userId) {
            this.userTaskboard.taskboardId = this.taskboardId;
            this.userTaskboard.userId = this.userId
            this.userTaskboard.role = "User";
          }
          this.userTaskboardService.addUserToTaskboard(this.userTaskboard).subscribe({
            next: (response) => {
              console.log(response);
            }
          });

          this.loginForm.reset();

          this.router.navigate(['noteboard'],{queryParams:{taskboardId:this.taskboardId}});
        },
        error: (response) => {
          alert('Taskboard Name/password do not match.');
        },
      });
    } else {
      ValidateForm.validateAllFormFields(this.loginForm);
      this.showModal = true;
    }
  }

  getAllTaskboards(userId: string) {
    this.userTaskboardService.getUserTaskboards(userId).subscribe((response) => {
      this.taskboards = response;

      this.filteredTaskboards = this.loginForm.get('taskboardName')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filterTaskboards(value))
      );
    });
  }

  private filterTaskboards(value: string): ITaskboard[] {
    const filterValue = value.toLowerCase();
    return this.taskboards.filter(taskboard =>
      taskboard.taskboardName.toLowerCase().includes(filterValue)
    );
  }
}
