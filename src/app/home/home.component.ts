import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { CollapsibleDirective } from '../collapsible.directive';
import { SvgiconComponent } from '../svgicon/svgicon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SliderComponent,
    CollapsibleDirective,
    SvgiconComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
