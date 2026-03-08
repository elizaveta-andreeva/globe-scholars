import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  constructor(
    public authService: AuthService,
  ){}

  userImage:string = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
}
