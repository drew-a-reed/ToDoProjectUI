declare var google: any;
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { TaskboardService } from 'src/app/services/taskboard.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private taskboardService: TaskboardService
  ) {}

  ngOnInit(): void {
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

  onSignup() {
    if (this.createTaskboardForm.valid) {
      this.taskboardService.signUp(this.createTaskboardForm.value).subscribe({
        next: (response) => {
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
