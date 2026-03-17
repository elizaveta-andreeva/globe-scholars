import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserAccount } from '../../services/auth/interface';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  formErrorMsg:string = '';
  apiErrorMsg:string = '';

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
  }

  validateForm() {
    if(this.username?.invalid || this.password?.invalid){
      this.formErrorMsg = 'Please fill in all fields!'
      return false;
    }
    this.formErrorMsg = '';
    return true;
  }

  async login(){
    if(!this.validateForm()) return;
    const values = this.form.getRawValue();
    this.authService.login(values.username, values.password).subscribe({
      next: (res: UserAccount) => {
        console.log(res.message);
        this.router.navigateByUrl('/');
      }, error: (res) => {
          this.apiErrorMsg = res.error.error;
          console.log(res)
      }
    })
  }

  get username() {
    return this.form.get('username')
  }
  get password() {
    return this.form.get('password')
  }
}
