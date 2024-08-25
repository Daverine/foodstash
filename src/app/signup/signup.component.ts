import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgiconComponent } from "../svgicon/svgicon.component";
import { AuthpageComponent } from "../authpage/authpage.component";
import { DropdownComponent } from "../dropdown/dropdown.component";


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SvgiconComponent, AuthpageComponent, DropdownComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

}
