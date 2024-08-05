import { Component } from '@angular/core';
import { CommonHeaderComponent } from '../common-header/common-header.component';
import { SvgiconComponent } from '../svgicon/svgicon.component';
import { CollapsibleDirective } from '../collapsible.directive';
import { ProductComponent } from '../product/product.component';
import { FlexSliderComponent } from "../flex-slider/flex-slider.component";
import { CarouselComponent } from "../carousel/carousel.component";

@Component({
  selector: 'app-home2',
  standalone: true,
  imports: [
    CommonHeaderComponent,
    SvgiconComponent,
    CollapsibleDirective,
    ProductComponent,
    FlexSliderComponent,
    CarouselComponent
],
  templateUrl: './home2.component.html',
  styleUrl: './home2.component.scss',
})
export class Home2Component {
  testiResizeConfig = [
    {
      minW: 900,
      slideNo: 3,
    },
    {
      maxW: 600,
      slideNo: 2,
    }
  ];
}
