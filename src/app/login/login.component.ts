import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgiconComponent } from "../svgicon/svgicon.component";
import { AuthpageComponent } from "../authpage/authpage.component";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SvgiconComponent, AuthpageComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
