import { Component } from '@angular/core';
import { CommonHeaderComponent } from "../common-header/common-header.component";
import { CommonFooterComponent } from "../common-footer/common-footer.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonHeaderComponent, CommonFooterComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
