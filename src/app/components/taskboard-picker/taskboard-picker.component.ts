declare var google: any;
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateform';
import { TaskboardService } from 'src/app/services/taskboard.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private taskboardService: TaskboardService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
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

  onLogin() {
    if (this.loginForm.valid) {
      this.taskboardService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const taskboardId = response.taskboardId;

          this.loginForm.reset();

          this.router.navigate(['noteboard'],{queryParams:{taskboardId:taskboardId}});
        },
        error: (response) => {
          alert('Email/password do not match.');
        },
      });
    } else {
      ValidateForm.validateAllFormFields(this.loginForm);
      this.showModal = true;
    }
  }

}
