import { Component, effect, ElementRef, Input, signal } from '@angular/core';
import { utils } from '../../assets/js/utils'


@Component({
  selector: 'app-panel',
  standalone: true,
  template: '',
})
export class PanelComponent {
  constructor(el: ElementRef) {
    this.pl = el.nativeElement;
    Object.keys(this.m).forEach(el => this.m[el] = this.m[el].bind(this));

    effect(() => {
      if (this.showPanel()) {
        utils.lockWindowScroll(this.uniqueId);
        if (typeof(this.settings.controller) === 'function') this.settings.controller(this.pl, this.settings);
        document.addEventListener('keydown', this.m.panelKbdFunc);
        this.pl.addEventListener('click', this.m.panelClickFunc);
        if (this.settings.closeOnEsc) this.EscTrack = utils.getEscTrack(), document.addEventListener('keyup', this.m.panelEscFunc);
        this.pl.classList.add('active');
        setTimeout(() => {
          if (typeof(this.settings.ready) === 'function') this.settings.ready(this.pl, this.settings);
          this.pl.scrollTop = 0;

          let autoFocusEl = [...this.pl.querySelectorAll(this.settings.autoFocusEl)][0];
          if (autoFocusEl) autoFocusEl.focus();
          else this.pl.focus();
        }, this.settings.inDuration);
      }
      else {
        document.removeEventListener('keydown', this.m.panelKbdFunc);
        this.pl.removeEventListener('click', this.m.panelClickFunc);
        if (this.settings.closeOnEsc) document.removeEventListener('keyup', this.m.panelEscFunc);					
        // safely get out of escape track
        if (typeof(this.EscTrack) === 'number') {
          if (utils.checkEscStatus(this.EscTrack)) this.EscTrack = undefined;
          else {
            let
              count = 0,
              counter = setInterval(() => {
                if (utils.checkEscStatus(this.EscTrack)) {
                  this.EscTrack = undefined;
                  clearInterval(counter);
                }
                else if (count >= 5) {
                  console.log(`Escape Track on ${this.pl} is lost.`);
                  this.EscTrack = undefined;
                  clearInterval(counter);
                }
                count++
              }, 5)
            ;
          }
        }
        this.pl.classList.remove('active');
        setTimeout(() => {
          if (typeof(this.settings.complete) === 'function') this.settings.complete(this.pl, this.settings);
          if (this.settings.caller) this.settings.caller.focus();
          this.settings.caller = undefined;
          utils.unlockWindowScroll(this.uniqueId);
        }, this.settings.outDuration);
      }
    })
  }

  @Input() id;
  @Input() options;

  showPanel = signal(false);
  uniqueId;
  EscTrack;
  factory = {
    namespace: 'panel',
    toBeConsidered: ':scope .panel, :scope .pl-controls',
    toggler: '.open-panel',
    toExcuseToggler: '.ex-open-panel',
    setHighlightRange: true,
    setTabRange: true,
    closeOnEsc: true,
    closeOnWrapperClick: true,
    dismissible: true,
    dismisser: ':scope .exit-panel',
    autoFocusEl: ':scope [pl-autofocus]',
    commands: {
      open: 'open panel',
      close: 'close panel'
    },
    lockScreen: true,
    inDuration: 500,
    outDuration: 500,
    controller: undefined,
    ready: undefined,
    complete: undefined
  };
  default;
  settings;
  pl;
  
  m = {
    panelClickFunc(e) {
      if ((this.settings.closeOnWrapperClick && ![...this.pl.querySelectorAll(this.settings.toBeConsidered)].filter((el) => el.contains(e.target))[0]) || (this.settings.dismissible && e.target.closest(this.settings.dismisser))) this.showPanel.set(false);
    },
    panelKbdFunc(e) {
      // tab function in panel
      if (this.settings.setTabRange && e.key === 'Tab') utils.focusRangeOnTab(this.pl, e);
      // Control + A function in panel
      else if (this.settings.setHighlightRange && e.ctrlKey && e.code === 'KeyA') {
        if (document.querySelectorAll('input:focus, textarea:focus')[0]) return;
        e.preventDefault();
        utils.setHighlightRange(this.pl);
      }
    },
    panelEscFunc(e) {
      if (e.key === 'Escape' && utils.checkEscStatus(this.EscTrack)) this.EscTrack = undefined, this.showPanel.set(false);
    },
    togglePanel(e) {
      let toggler = [...document.querySelectorAll(this.settings.toggler)].filter((el) => el.contains(e.target) && (el.getAttribute('data-target') === this.id || el.getAttribute('href') === `#${this.id}`))[0];
      if (!toggler || e.target.closest(this.settings.toExcuseToggler)) return;
      this.settings.caller = toggler;
      this.showPanel.update(value => !value);
    },
    pl_console(e) {
      if (e.detail === this.settings.commands.open) this.showPanel.set(true);
      else if (e.detail === this.settings.commands.close) this.showPanel.set(false);
    }
  };

  ngOnInit() {
    this.settings = {
      ...this.factory,
      ...this.default || {},
      ...this.options || {}
    };
  };

  ngAfterViewInit() {
    this.uniqueId = utils.getUniqueId(this.settings.namespace);
    document.addEventListener('click', this.m.togglePanel);
    this.pl.addEventListener('plconsole', this.m.pl_console);
  };

  onDestroy() {
    this.showPanel.set(false);
    utils.unlockWindowScroll(this.uniqueId);
    document.removeEventListener('keydown', this.m.panelKbdFunc);
    this.pl.removeEventListener('click', this.m.panelClickFunc);
    document.removeEventListener('click', this.m.togglePanel);
  }
}
