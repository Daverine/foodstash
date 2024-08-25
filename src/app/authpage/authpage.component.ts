import { Component } from '@angular/core';
import { CarouselComponent } from '../carousel/carousel.component';
import { SvgiconComponent } from '../svgicon/svgicon.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-authpage',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SvgiconComponent, CarouselComponent],
  templateUrl: './authpage.component.html',
  styleUrl: './authpage.component.scss'
})
export class AuthpageComponent {

}
