import { Component } from '@angular/core';
import { SvgiconComponent } from "../svgicon/svgicon.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DropdownComponent } from "../dropdown/dropdown.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SvgiconComponent, RouterLink, RouterLinkActive, DropdownComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
