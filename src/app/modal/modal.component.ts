import { Component } from '@angular/core';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  host: {
    '[id]': 'id',
    'class': 'modal',
    'tabindex': '-1',
  }
})
export class ModalComponent extends PanelComponent {
  override default = {
    namespace: 'modal',
    toBeConsidered: ':scope .dialog, :scope .md-control',
    toggler: '.open-modal',
    toExcuseToggler: '.ex-open-modal',
    setHighlightRange: true,
    setTabRange: true,
    closeOnEsc: true,
    closeOnWrapperClick: true,
    dismissible: true,
    autoFocusEl: ':scope [md-autofocus]',
    dismisser: '.exit-modal',
    lockScreen: true,
    inDuration: 500,
    outDuration: 500
  };
}
