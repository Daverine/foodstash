import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-svgicon',
  standalone: true,
  imports: [NgIf],
  templateUrl: './svgicon.component.html',
  styleUrl: './svgicon.component.scss'
})
export class SvgiconComponent {
  @Input() name;
}
