import { Component } from '@angular/core';
import { SvgiconComponent } from "../svgicon/svgicon.component";
import { CollapsibleDirective } from '../collapsible.directive';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [SvgiconComponent, RouterLink, RouterLinkActive],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {

}
