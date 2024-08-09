import { Component } from '@angular/core';
import { CommonHeaderComponent } from "../common-header/common-header.component";
import { CommonFooterComponent } from "../common-footer/common-footer.component";
import { ProductComponent } from "../product/product.component";
import { AboutComponent } from "../about/about.component";

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [CommonHeaderComponent, CommonFooterComponent, ProductComponent,]
})
export class ProductsComponent {

}
