declare var google: any;
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { TaskboardService } from 'src/app/services/taskboard.service';
import { IUserTaskboard } from 'src/app/models/user-taskboard.model';
import { UserTaskboardService } from 'src/app/services/user-taskboard.service';

@Component({
  selector: 'app-taskboard-creator',
  templateUrl: './taskboard-creator.component.html',
  styleUrls: ['./taskboard-creator.component.scss']
})
export class TaskboardCreatorComponent {
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  createTaskboardForm!: FormGroup;
  showModal: boolean = false;
  error: string = 'Login failed. Please check your credentials.';
  passwordState: string = 'Show';
  userId: string | null = null;
  taskboardId: string | null = null;
  userTaskboard!: IUserTaskboard;
  router: any;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private taskboardService: TaskboardService,
    private UserTaskboardService: UserTaskboardService
  ) {}

  ngOnInit(): void {

    this.userId = this.auth.getUserId();

    this.createTaskboardForm = this.formBuilder.group({
      taskboardName: ['', Validators.required],
      taskboardPassword: ['', Validators.required],
    });
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
    this.isText ? (this.passwordState = 'Hide') : (this.passwordState = 'Show');
  }

  onCreate() {
    if (this.createTaskboardForm.valid) {
      this.taskboardService.createTaskboard(this.createTaskboardForm.value).subscribe({
        next: (response) => {
          this.taskboardId = response.taskboardId;
          this.userTaskboard = this.userTaskboard || {};

          if (this.taskboardId && this.userId) {
            this.userTaskboard.taskboardId = this.taskboardId;
            this.userTaskboard.userId = this.userId
            this.userTaskboard.role = "Owner";
          }
          this.UserTaskboardService.addUserToTaskboard(this.userTaskboard).subscribe({
            next: (response) => {
              console.log(response);
            }
          });

          this.createTaskboardForm.reset();

          this.router.navigate(['taskboard-picker']);
        },
        error: (response) => {
          this.error = response.error.message;
          this.showModal = true;
        },
      });
    } else {
      ValidateForm.validateAllFormFields(this.createTaskboardForm);
      this.showModal = true;
    }
  }

  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

}
