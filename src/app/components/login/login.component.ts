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
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  loginForm!: FormGroup;
  showModal: boolean = false;
  passwordState: string = 'Show';
  error: string = 'Login failed. Please check your credentials.';
  public resetPasswordEmail!: string;
  public isValidEmail!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userStore: UserStoreService,
    private resetService: ResetPasswordService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    google.accounts.id.initialize({
      client_id:
        '257479571203-af1404qragk94fe2fpnj60s3616t7k8c.apps.googleusercontent.com',
      callback: (response: any) => {
        this.handleLogin(response);
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      type: 'icon',
      theme: 'filled_blue',
      size: 'large',
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
      this.auth.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loginForm.reset();
          this.auth.storeToken(response.accessToken);
          this.auth.storeRefreshToken(response.refreshToken);
          const tokenPayload = this.auth.decodeToken();
          this.userStore.setFullNameForStore(tokenPayload.unique_name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.router.navigate(['noteboard']);
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

  checkValidEmail(event: string) {
    const value = event;
    const pattern =
      /^[a-zA-Z0-9\.\-_]+@([a-zA-Z0-9\-_]+\.)+[a-zA-Z0-9\-_]{2,3}$/;
    this.isValidEmail = pattern.test(value);
    return this.isValidEmail;
  }

  confirmToSend() {
    if (this.checkValidEmail(this.resetPasswordEmail)) {
      this.resetService
        .sendResetPasswordLink(this.resetPasswordEmail)
        .subscribe({
          next: (response) => {
            this.resetPasswordEmail = '';
            const buttonRef = document.getElementById('closeBtn');
            buttonRef?.click();
          },
          error: (err) => {
            alert('Reset Failed');
          },
        });
    }
  }

  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  handleLogin(response: any) {
    if (response) {
      const payload = this.decodeToken(response.credential);
      console.log(payload);

      var email = payload.email;
      var password = payload.aud + '@S';

      this.loginForm = this.formBuilder.group({
        email: [email, Validators.required],
        password: [password, Validators.required],
      });

      this.onLogin();
    }
  }
}
