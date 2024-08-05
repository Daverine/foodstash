import { Component } from '@angular/core';
import { SvgiconComponent } from '../svgicon/svgicon.component';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [SvgiconComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent {}
