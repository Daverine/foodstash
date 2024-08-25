import { Component } from '@angular/core';
import { CommonHeaderComponent } from "../common-header/common-header.component";
import { CommonFooterComponent } from "../common-footer/common-footer.component";
import { ProductComponent } from "../product/product.component";
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [CommonHeaderComponent, CommonFooterComponent, ProductComponent, ModalComponent,],
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.scss'
})
export class CombosComponent {

}
