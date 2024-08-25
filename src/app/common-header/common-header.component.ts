import { Component } from '@angular/core';
import { SvgiconComponent } from "../svgicon/svgicon.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [SvgiconComponent, RouterLink, RouterLinkActive, DropdownComponent],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {

}
