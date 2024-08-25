import { Component } from '@angular/core';
import { CommonHeaderComponent } from '../common-header/common-header.component';
import { SvgiconComponent } from '../svgicon/svgicon.component';
import { CollapsibleDirective } from '../collapsible.directive';
import { ProductComponent } from '../product/product.component';
import { FlexSliderComponent } from "../flex-slider/flex-slider.component";
import { CarouselComponent } from "../carousel/carousel.component";
import { CommonFooterComponent } from "../common-footer/common-footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CommonHeaderComponent,
    SvgiconComponent,
    CollapsibleDirective,
    ProductComponent,
    FlexSliderComponent,
    CarouselComponent,
    CommonFooterComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  testiResizeConfig = [
    {
      minW: 900,
      slideNo: 3,
    },
    {
      maxW: 900,
      minW: 500,
      slideNo: 2,
    },
    {
      maxW: 500,
      slideNo: 1,
    }
  ];
}
