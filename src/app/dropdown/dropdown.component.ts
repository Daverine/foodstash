import { Attribute, Component, effect, ElementRef, EventEmitter, Input, Output, signal } from '@angular/core';
import { utils } from '../../assets/js/utils'
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  host: {
    'class': 'dropdown',
    '[class.active]': 'showDropdown()',
    '[tabindex]': 'settings.selectable ? 0 : null',
  }
})
export class DropdownComponent {
  classes;
  hoverable;
  menuId;

  constructor(el: ElementRef,
    @Attribute('class') classes,
    @Attribute('data-hover') hoverable,
    @Attribute('data-target') menuId
  ) {
    this.dd = el.nativeElement;
    this.classes = classes ? classes.split(' ') : [];
    this.hoverable = hoverable !== 'false' && hoverable !== null;
    this.menuId = menuId;
    Object.keys(this.m).forEach(el => this.m[el] = this.m[el].bind(this));

    effect(() => {
      if (this.showDropdown()) {
        if (this.dd.matches('.disabled, [disabled]')) return;
        let items = [...this.dm.querySelectorAll(this.s.it_i)];

        this.EscTrack = utils.getEscTrack();

        if (this.settings.searchable) {						
          this.sb.focus();
          // what to do when searching in a dropdown box
          this.sb.addEventListener('input', this.m.dd_searchFunc);
          utils.triggerEvent(this.sb, 'input');
        }
        document.addEventListener('click', this.m.dd_clickOnDom);
        document.addEventListener('keyup', this.m.dd_EscTabFunc);
        document.addEventListener('keydown', this.m.dd_KBFunc);
        window.addEventListener('resize', this.m.dd_CalcPosition);
        window.addEventListener('scroll', this.m.dd_CalcPosition, true);
        this.m.dd_onItemsHoverEvent();
        this.m.dd_CalcPosition();
        this.dm.classList.add('visible');

        // highlight (add .hover class to) the active item or the first item in the menu list if dropdown is opened with with keyboard keys or it is a searchable dropdown. (default action)
        if (this.tmp.keyboard) {
          let acItem = items.filter((el) => el.matches('.active'))[0] || items[0];
          
          if (acItem) {
            acItem.classList.add('hovered')
            items.filter((el) => el != acItem).forEach((el) => el.classList.remove('hovered'));
          }
          
          document.addEventListener('mousemove', this.m.dd_mouseMover);
        }
        // auto scroll dropdown-menu to active item position.
        setTimeout(() => {
          let acItem = items.filter((el) => el.matches('.active'))[0];
          if (acItem) {
            let
              getIop = utils.getParents(acItem, '', this.dm).filter((el) => (window.getComputedStyle(el).getPropertyValue('overflow-y') === 'auto' || window.getComputedStyle(el).getPropertyValue('overflow-y') === 'scroll'))[0],
              iOp = getIop ? getIop : this.dm,
              dScroll = iOp.scrollTop,
              sAmt = acItem.getBoundingClientRect().top - iOp.getBoundingClientRect().top + dScroll
            ;

            iOp.scrollTop = sAmt;
          }
        }, this.settings.duration + 50);
      }
      else {
        [...this.dm.querySelectorAll(':scope .dropdown.active')].forEach((el) => utils.triggerEvent(el, new CustomEvent('ddconsole', {detail: 'close'})));

        document.removeEventListener('click', this.m.dd_clickOnDom);
        document.removeEventListener('keyup', this.m.dd_EscTabFunc);
        document.removeEventListener('keydown', this.m.dd_KBFunc);
        document.removeEventListener('mousemove', this.m.dd_mouseMover);
        window.removeEventListener('resize', this.m.dd_CalcPosition);
        window.removeEventListener('scroll', this.m.dd_CalcPosition, true);
        this.m.dd_offItemHoverEvent();
        [...this.dm.querySelectorAll(this.s.it)].forEach((el) => el.classList.remove('hovered'));

        if (this.settings.searchable) {
          this.sb.removeEventListener('input', this.m.dd_searchFunc);
          this.sb.value = '';
          this.sc.classList.remove('filtered');
          this.ph.classList.remove('filtered');
        }
        
        if (this.settings.hover) document.removeEventListener('mousemove', this.m.dd_toggleDropdown);
        
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
                  console.warn(`Escape Track on ${this.dd} is lost.`);
                  this.EscTrack = undefined;
                  clearInterval(counter);
                }
                count++
              }, 10)
            ;
          }
        }
        
        this.dm.classList.remove('visible');
      }
    });
    effect(() => {
      if (this.allItemFiltered()) utils.triggerEvent(this.dm, new CustomEvent('dmconsole', {detail: 'on allItemFiltered'}));
      else utils.triggerEvent(this.dm, new CustomEvent('dmconsole', {detail: 'off allItemFiltered'}));
    });
    effect(() => {
      if (this.allItemSelected()) utils.triggerEvent(this.dm, new CustomEvent('dmconsole', {detail: 'on allItemSelected'}));
      else utils.triggerEvent(this.dm, new CustomEvent('dmconsole', {detail: 'off allItemSelected'}));
    });      
  }

	@Input() modelValue;
  @Input() name;
  @Input() placeholder;
  @Input() options;
  
  @Output() update = new EventEmitter();

  dd;
  dm;
  sc;
  ph;
  ip;
  sb;
  sz;
  
  showDropdown = signal(false);
  uniqueId;
  EscTrack;
  settings;
  s;
  menuProp = {
    visible: false,
    view: "vertical",
    lhs: false,
    rhs: false,
    upward: false,
    downward: false
  };
  tmp = {
    selectionContent: undefined,
    positionStream: undefined,
    asdm: [], // an array to contain browseable sub dropdown menu
    keyboard: undefined,
  };
  allItemSelected = signal(false);
  allItemFiltered = signal(false);
  value = new BehaviorSubject(undefined);
  m = {
    dd_setSelect(item, xClose = false) {
      if (!item || !this.settings.selectable) return;
      
      let items = [...this.dm.querySelectorAll(this.s.it)];
      
      if (this.settings.multipleSelect) {
        if (item.matches('.selected')) return;

        let
          itemIndex = items.indexOf(item),
          ddid = utils.getUniqueId('ddid'),
          itemValue = item.getAttribute('data-value') || item.textContent
        ;
        
        item.classList.add('selected');
        this.ip.luiData[ddid] = itemValue;
        this.value.next(Object.values(this.ip.luiData));
        item.setAttribute('data-ddid', ddid);
        this.tmp.selectionContent.push({
          html: `${item.innerHTML} <i class="svgv1 action close trailing icon"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480.435-421.652 277.522-219.304q-12.131 12.13-29.392 12.413-17.26.282-28.826-12.848-12.695-12.131-12.478-28.674.217-16.544 12.913-29.674L422.217-480 219.304-683.348q-12.695-12.13-12.695-28.674 0-16.543 12.695-29.674 11.566-12.13 28.826-11.848 17.261.283 29.392 12.414l202.913 202.347L682.478-741.13q12.131-12.131 29.392-12.414 17.26-.282 28.826 11.848 12.695 13.131 12.478 29.674-.217 16.544-11.913 28.674L538.783-480l202.478 201.913q11.696 12.696 11.913 29.457.217 16.76-12.478 28.891-11.566 13.13-28.826 12.848-17.261-.283-29.392-12.413L480.435-421.652Z"/></svg></i>`,
          index: ddid
        });
        this.sc.classList.remove('no-content');

        if (this.settings.searchable && this.showDropdown()) {
          this.sb.value = '';
          utils.triggerEvent(this.sb, 'input');
          this.sb.focus();
        }

        if (!items.filter((el) => !el.matches('.selected'))[0]) this.allItemSelected.set(true);

        if (!this.showDropdown() || this.dd.matches('.indicating')) return;

        item.classList.remove('hovered');
        
        if (!this.settings.searchable) {
          let
            next = items.filter((el, i) => i > itemIndex && !el.matches('.selected'))[0],
            prev = items.filter((el, i) => i < itemIndex && !el.matches('.selected')).slice(-1)[0]
          ;
          if (next) next.classList.add('hovered');
          else if (prev) prev.classList.add('hovered');
        }

        this.m.dd_CalcPosition();
      }
      else {
        item.classList.add('active');
        if (!this.showDropdown() && items.filter((el) => el !== item && el.matches('.active'))[0]) console.warn("A selection-dropdown on this page has multiple preselected value which is not suppose to be except it is a multiple-selection-dropdown. Only the first preselected value will be preselected.");

        items.filter((el) => el !== item).forEach((el) => el.classList.remove('active'));
        this.value.next(item.getAttribute('data-value') || item.textContent);
        this.tmp.selectionContent = item.innerHTML;
      }

      if (!xClose) {
        if (this.settings.searchable) {
          this.sb.value = '';
          utils.triggerEvent(this.sb, 'input');
        }

        this.showDropdown.set(false);
      }
    },
    dd_setDeselect(sItem) {
      if (!this.settings.multipleSelect) return;
      
      let
        ddid = sItem.getAttribute('data-ddid'),
        item = [...this.dm.querySelectorAll(`:scope [data-ddid="${ddid}"]`)][0]
      ;

      delete this.ip.luiData[ddid];
      this.value.next(Object.values(this.ip.luiData));
      item.classList.remove('selected');
      item.setAttribute('data-ddid', '');
      this.tmp.selectionContent = this.tmp.selectionContent.filter((el) => el.index !== ddid);

      if (this.allItemSelected()) this.allItemSelected.set(false);
      if (!this.tmp.selectionContent[0]) this.sc.classList.add('no-content');

      if (this.showDropdown()) {
        if (this.settings.searchable) {
          this.sb.value = '';
          utils.triggerEvent(this.sb, 'input');
        }
      
        this.m.dd_CalcPosition();
      }

      if (this.settings.searchable) this.sb.focus();
    },
    dd_toggleDropdown(e) {
      if (typeof(e) === "object") {
        if ([...this.dd.querySelectorAll(':scope > .content > .chip')].filter((el) => el.contains(e.target))[0] || (e.target && e.target.closest('ex-dropdown'))) return;

        if (this.settings.hover) {
          let timeDelay = this.settings.delay || 300;

          if (e.type === 'mouseenter') {
            document.addEventListener('mousemove', this.m.dd_toggleDropdown);
            clearTimeout(this.tmp.hdt);
            this.tmp.sdt = setTimeout(() => {
              if (this.settings.searchable) this.m.dd_toggleDropdown('keyboard');
              else this.showDropdown.set(true);
            }, timeDelay/2);
          }
          else if (e.type === 'mousemove') {
            if (this.tmp.asdm.filter((el) => el.contains(e.target))[0]) {
              this.settings.closing = false;
              clearTimeout(this.tmp.hdt);
              return;
            }
            if (this.settings.closing) return;
            
            this.settings.closing = true;
            clearTimeout(this.tmp.sdt);
            this.tmp.hdt = setTimeout(() => {
              this.settings.closing = false;
              this.showDropdown.set(false);
            }, timeDelay);
          }
          else if (e.type === 'touchstart') {
            // prevent opening and closing event from interfering with drop menu item actions.
            if (this.dm.contains(e.target)) return;
            
            if (this.showDropdown()) {
              clearTimeout(this.tmp.sdt);
              this.showDropdown.set(false);
            }
            else {
              document.addEventListener('mousemove', this.m.dd_toggleDropdown);
              clearTimeout(this.tmp.hdt);
              if (this.settings.searchable) this.m.dd_toggleDropdown('keyboard');
              else this.showDropdown.set(true);
            }
          }
        }
        else {
          // prevent opening and closing event from interfering with drop menu item actions.
          if (this.dm.contains(e.target)) return;
          
          let timeDelay = this.settings.delay || 0;

          e.preventDefault();
          //get pointer cordinate to use for page-dropdown
          if (this.settings.page) this.settings.e = e;

          if (this.showDropdown()) {
            if (this.settings.searchable && this.dd.classList.contains('select') && !this.dd.querySelector(':scope .ddico')?.contains(e.target)) {
              this.sb.focus();
              return;
            }
            
            setTimeout(() => this.showDropdown.set(false), timeDelay);
          }
          else {
            setTimeout(() => {
              if (this.settings.searchable) this.m.dd_toggleDropdown('keyboard');
              else this.showDropdown.set(true);
            }, timeDelay)
          }
        }
        return;
      }
      else if (e === 'keyboard') {
        this.tmp.keyboard = true;
        if (this.showDropdown()) return;
      }
      
      if (this.showDropdown()) this.showDropdown.set(false);
      else if (e !== 'close-all') this.showDropdown.set(true);

      if (e === 'close-all') this.m.dd_closeAll();
    },
    dd_openWithKeyboard(e) {
      if ((e.key == "Enter" || e.key == "ArrowDown") && (this.dd.matches(':focus') || this.dd.querySelectorAll(':scope :focus')[0]) && !this.showDropdown()) {
        e.preventDefault();
        this.m.dd_toggleDropdown('keyboard');
      }
    },
    dd_openWithSearch() {
      if (this.sb.value) {
        this.ph.classList.add('filtered');
        if (!this.settings.multipleSelect) this.sc.classList.add('filtered');
      }
      else {
        this.ph.classList.remove('filtered');
        if (!this.settings.multipleSelect) this.sc.classList.remove('filtered');
      }

      this.sz.textContent = this.sb.value;
      this.sb.style.width = this.sz.clientWidth + 'px';
      if (!this.showDropdown()) this.m.dd_toggleDropdown("keyboard");
    },
    dd_mSClickFunc(e) {
      let
        sItems = [...this.dd.querySelectorAll(':scope > .content > .chip')],
        sItem = sItems.filter((el) => el.contains(e.target))[0],
        sItemClose = [...this.dd.querySelectorAll(':scope > .content > .chip > .close')].filter((el) => el.contains(e.target))[0]
      ;
      // deselecting multiple dropdown item when not opened when user clicks on the close button of a chip
      if (sItemClose && !this.showDropdown()) this.m.dd_setDeselect(sItem);
      else if (sItem) {
        let sItemSib = sItems.filter((el) => el != sItem);
        
        // select a chip that is not selected if user clicks on them.
        if (!sItem.matches('.active')) sItem.classList.add('active');
        // deselect a chip that is selected if user click on them and there is no other chip selected
        else if (!sItemSib.filter((el) => el.matches('.active'))[0]) sItem.classList.remove('active');
        
        // if the control key is not pressed when user clicks on a chip, deselect the siblings of the chip 
        if (!e.ctrlKey) sItemSib.forEach((el) => el.classList.remove('active'));
      }
      // if one or more chip(s) is selected and user clicks out, deselect the selected chips
      else sItems.forEach((el) => el.classList.remove('active'));
    },
    dd_mSKBFunc(e) {
      let acSItems = [...this.dd.querySelectorAll(':scope > .content > .chip.active')];

      if (acSItems[0]) {
        let
          prevSib = acSItems[0].previousElementSibling,
          nextSib = acSItems.slice(-1)[0].nextElementSibling
        ;

        // deselect items with keyboard when they are selected
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (e.key == 'Backspace' && prevSib) prevSib.classList.add('active');
          else if (e.key == 'Backspace' && nextSib) nextSib.classList.add('active');
          else if (e.key == 'Delete' && nextSib) nextSib.classList.add('active');
          else if (e.key == 'Delete' && prevSib) prevSib.classList.add('active');

          acSItems.forEach((el) => this.m.dd_setDeselect(el));
        }
        else if (e.key === 'ArrowRight' && nextSib) {
          if (nextSib === this.sb) {
            acSItems.forEach((el) => el.classList.remove('active'));
            this.sb.focus();
            return;
          }
          else if (nextSib.matches('.chip')) {
            if (!e.shiftKey) acSItems.forEach((el) => el.classList.remove('active'));
            nextSib.classList.add('active');
          }
        }
        else if (e.key === 'ArrowLeft' && prevSib && prevSib.matches('.chip')) {
          if (!e.shiftKey) acSItems.forEach((el) => el.classList.remove('active'));
          prevSib.classList.add('active');
        }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          acSItems.forEach((el) => el.classList.remove('active'));
          if (e.key === 'ArrowDown') this.m.dd_toggleDropdown('keyboard');
        }
        else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') acSItems.forEach((el) => el.classList.remove('active'));
      }
      /* delete the last chip in multiple dropdown if searchbox is focused-on and seachbox is empty and the backspace key is pressed */
      else if (this.settings.searchable && this.sb.matches(':focus') && !this.sb.value && e.key == 'Backspace' && [...this.dd.querySelectorAll(':scope > .content > .chip')][0]) this.m.dd_setDeselect([...this.dd.querySelectorAll(':scope > .content > .chip')].slice(-1)[0]);
      else if ((this.dd.matches(':focus') || this.dd.querySelectorAll(':scope :focus')[0])) {
        let sItems = [...this.dd.querySelectorAll(':scope > .content > .chip')];

        if (sItems[0]) {
          if (e.key == 'ArrowRight') sItems[0].classList.add('active');
          else if (e.key == 'ArrowLeft') sItems.pop().classList.add('active');
        }
      }
    },
    dd_checkerFill(dm) {
      if (dm.querySelectorAll(':scope .dropdown.browse')[0]) {
        [...dm.querySelectorAll(':scope .dropdown.browse')].forEach((el) => {
          let newDm = document.getElementById(el.getAttribute('data-target')); 
          if (newDm) {
            this.tmp.asdm.push(newDm);
            this.m.dd_checkerFill(newDm);
          }
        });
      }
    },
    dd_searchFunc() {
      let 
        items = [...this.dm.querySelectorAll(this.s.it_i)],
        filter = this.sb.value.toUpperCase()
      ;

      items.forEach((el) => {
        if (el.textContent.toUpperCase().trim().indexOf(filter.trim()) !== 0) el.classList.add('filtered');
        else el.classList.remove('filtered');
      });

      items = [...this.dm.querySelectorAll(this.s.it_f)];

      if (!items[0]) {
        [...this.dm.querySelectorAll(this.s.it)].forEach((el) => el.classList.remove('hovered'));

        if (filter && !this.allItemFiltered()) this.allItemFiltered.set(true);
        else if (!filter && this.allItemFiltered()) this.allItemFiltered.set(false);
      }
      else if (filter && !this.dd.matches('.indicating')) {
        [...this.dm.querySelectorAll(this.s.it)].forEach((el) => el.classList.remove('hovered'));
        items[0].classList.add('hovered');
        this.allItemFiltered.set(false);
      }
      
      if (this.settings.multipleSelect) {
        if (filter) {
          this.sc.classList.remove('no-content');
          let sItems = [...this.dd.querySelectorAll(':scope > .content > .chip')];
          if (sItems[0]) sItems.forEach(el => el.classList.remove('active'));
        }
        else if (!this.tmp.selectionContent[0]) this.sc.classList.add('no-content');
      }

      this.m.dd_CalcPosition();
    },
    dd_clickOnDom(e) {
      let
        items = [...this.dm.querySelectorAll(this.s.it)],
        item = items.filter((el) => el.contains(e.target))[0],
        sItem = [...this.dd.querySelectorAll(':scope > .content > .chip')].filter((el) => el.contains(e.target))[0],
        sItemClose = [...this.dd.querySelectorAll(':scope > .content > .chip > .close')].filter((el) => el.contains(e.target))[0],
        exiter = [...this.dm.querySelectorAll(this.s.ex)].filter(el => el.contains(e.target))[0]
      ;

      /* Close when an exiter is clicked or on "Click Out" */
      if (exiter || (!this.dd.contains(e.target) && !this.dm.contains(e.target))) this.showDropdown.set(false);
      /* do something when an item is clicked */
      else if (item) {					
        if (item.matches('.dropdown')) return;

        if (this.settings.selectable) {
          /* deselecting items for multiple select dropdown that has the indicating class */
          if (item.matches('.selected')) this.m.dd_setDeselect([...this.dd.querySelectorAll(':scope > .content > .chip')].filter(el => el.getAttribute('data-ddid') === item.getAttribute('data-ddid'))[0]);
          // select item if dropdown is selectable
          else this.m.dd_setSelect(item, (this.settings.multipleSelect ? true : false));
        }
        // close all dropdown including all sub dropdowns and parent dropdowns
        else if ((this.settings.closeOnItemClick && !item.matches('.dd-xclose')) || item.matches('.dd-close')) this.m.dd_toggleDropdown('close-all');
      }
      else if (sItemClose) this.m.dd_setDeselect(sItem);

    },
    dd_EscTabFunc(e) {
      // you should use an Escape tracker here to stop other plugins like modal from triggering close on escape press if the dropdown is opened down.
      if ((e.key == 'Escape' && utils.checkEscStatus(this.EscTrack)) || (e.key == 'Tab' && ![...this.dd.querySelectorAll(':scope :focus')][0] && ![...this.dm.querySelectorAll(':scope :focus')][0] && ![...this.dm.querySelectorAll(':scope .dropdown.active')][0])) {
        e.preventDefault();
        if (e.key === 'Escape') this.EscTrack = undefined;
        this.showDropdown.set(false);

        if (e.key == 'Tab') this.m.dd_closeAll();
        else if (this.dd.matches('.sub') && this.m.dd_getParentDropdown()) utils.triggerEvent(this.m.dd_getParentDropdown(), new CustomEvent('ddconsole', {detail: {command: 'set hovered item', el: this.dd}}));
      }
    },
    dd_KBFunc(e) {
      let items = [...this.dm.querySelectorAll(this.s.it_f)];
      /*
        The Enter key triggers the click action on an item
        Enter and right arrow key open a sub dropdown that is hovered.
      */
      if (e.key == 'Enter' || e.key == 'ArrowRight') {
        let item = items.filter((el) => el.matches('.hovered'))[0];
        if (!item) return;
        if (item.matches('.dropdown:not(.active)')) {
          e.preventDefault();
          utils.triggerEvent(item, new CustomEvent('ddconsole', {detail: 'open with keyboard'}));
        }
        else if (e.key == 'Enter') {
          e.preventDefault();
          item.click();
        }
      }
      // Arrow left key (Use to close a sub dropdown) support
      else if (e.key == 'ArrowLeft' && this.dd.matches('.sub') && ![...this.dm.querySelectorAll(':scope .dropdown.active')][0]) {
        e.preventDefault();
        this.showDropdown.set(false);
        if (this.dd.matches('.sub') && this.m.dd_getParentDropdown()) utils.triggerEvent(this.m.dd_getParentDropdown(), new CustomEvent('ddconsole', {detail: {command: 'set hovered item', el: this.dd}}));
      }
      // Up and down arrrow key navigation on dropdown menu item.
      else if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
        let
          hvItem = items.filter((el) => el.matches('.hovered'))[0],
          acItem = items.filter((el) => el.matches('.active'))[0]
        ;

        if (![...this.dm.querySelectorAll(':scope .dropdown.active')][0]) {
          e.preventDefault();
          this.m.dd_offItemHoverEvent();

          // cii is current-item-index, nii is new-item-index ci is new-current-item
          let
            cii = (hvItem)
              ? items.indexOf(hvItem)
              : (acItem)
                ? items.indexOf(acItem)
                : -1,
            nii = (e.key == 'ArrowUp') 
              ? (cii <= 0)
                ? items.length - 1
                : cii - 1
              : (cii === items.length - 1 || cii < 0)
                ? 0 
                : cii + 1,
            ci = items[nii]
          ;

          /* Enable scroll of overflow parent to hovered-item to make the hovered item visible */
          if (ci) {
            let
              getIop = utils.getParents(ci, '', this.dm).filter((el) => (window.getComputedStyle(el).getPropertyValue('overflow-y') === 'auto' || window.getComputedStyle(el).getPropertyValue('overflow-y') === 'scroll'))[0],
              iOp = getIop ? getIop : this.dm,
              dSc = iOp.scrollTop,
              dH = iOp.clientHeight,
              eH = ci.offsetHeight,
              eTop = ci.getBoundingClientRect().top - iOp.getBoundingClientRect().top + dSc,
              oDif = dSc + dH - eTop,
              sAmt = e.key == 'ArrowUp'
                ? ((nii === items.length - 1 && eH > oDif) || dSc > eTop)
                  ? eTop
                  : eTop > (dSc + dH - eH)
                    ? eTop - dH + (eH*2)
                    : undefined 
                : e.key == 'ArrowDown'
                  ? ((nii === 0 && dSc > eTop) || eH > oDif)
                    ? dSc + eH - oDif
                    : dSc > eTop
                      ? eTop - eH
                      : undefined
                  : undefined
            ;

            iOp.scrollTop = sAmt;
            items.forEach((el) => el.classList.remove('hovered'));
            ci.classList.add('hovered');
            if (this.settings.selectable && !this.settings.multipleSelect) this.m.dd_setSelect(ci, true);
          }
        }

        document.addEventListener('mousemove', this.m.dd_mouseMover);
      }
    },
    dd_ItemHover(e) {
      let item = e.currentTarget;
      item.classList.add('hovered');
      [...this.dm.querySelectorAll(this.s.it_i)].filter((el) => el !== item).forEach((el) => el.classList.remove('hovered'));
    },
    dd_ItemLeave(e) {
      e.currentTarget.classList.remove('hovered');
    },
    dd_onItemsHoverEvent() {
      [...this.dm.querySelectorAll(this.s.it_i)].forEach((el) => {
        el.addEventListener('mouseenter', this.m.dd_ItemHover);
        el.addEventListener('mouseleave', this.m.dd_ItemLeave);
      });
    },
    dd_offItemHoverEvent() {
      [...this.dm.querySelectorAll(this.s.it_i)].forEach((el) => {
        el.removeEventListener('mouseenter', this.m.dd_ItemHover);
        el.removeEventListener('mouseleave', this.m.dd_ItemLeave);
      });
    },
    dd_mouseMover(e) {
      let items = [...this.dm.querySelectorAll(this.s.it_i)];

      if (this.dd.contains(e.target) || this.dm.contains(e.target)) {
        let item = items.filter((el) => el.contains(e.target))[0];
        if (!item) return;
        item.classList.add('hovered');
        items.filter((el) => el !== item).forEach((el) => el.classList.remove('hovered'));
      }
      else if (this.settings.hover) { this.showDropdown.set(false); }
      else { items.forEach((el) => el.classList.remove('hovered')); }

      this.m.dd_onItemsHoverEvent();
      document.removeEventListener('mousemove', this.m.dd_mouseMover);
    },
    dd_CalcPosition() {
      if (this.settings.page) {
        let cord = {
          left: (this.settings.e.pageX - window.scrollX) || 0,
          top: (this.settings.e.pageY - window.scrollY) || 0,
          right: undefined, bottom: undefined,
        };

        cord.right = document.documentElement.clientWidth - cord.left;
        cord.bottom = document.documentElement.clientHeight - cord.top;
        this.dm.style.right = 'auto';
        this.dm.style.bottom = 'auto';

        if (cord.right >= this.dm.offsetWidth) {
          this.dm.style.left = cord.left;
          this.dm.classList.add('rhs');
        }
        else if (cord.left >= this.dm.offsetWidth) {
          this.dm.style.left = cord.left - this.dm.offsetWidth;
          this.dm.classList.add('lhs');
        }
        else if (cord.right >= cord.left) {
          this.dm.classList.add('rhs');
          if (cord.right + cord.left >= this.dm.offsetWidth)  this.dm.style.left = document.documentElement.clientWidth - this.dm.offsetWidth;
          else {
            this.dm.style.left = 0;
            this.dm.style.maxWidth = document.documentElement.clientWidth;
          }
        }
        else {
          this.dm.classList.add('lhs');
          this.dm.style.left = 0;
          if (cord.right + cord.left < this.dm.offsetWidth) this.dm.style.maxWidth = document.documentElement.clientWidth;
        }

        if (cord.bottom >= this.dm.offsetHeight) {
          this.dm.style.top = cord.top;
          this.dm.classList.add('downward');
        }
        else if (cord.top >= this.dm.offsetHeight) {
          this.dm.style.top = cord.top - this.dm.offsetHeight;
          this.dm.classList.add('upward');
        }
        else if (cord.bottom >= cord.top) {
          this.dm.classList.add('downward');
          if (cord.bottom + cord.top >= this.dm.offsetHeight) this.dm.style.top = document.documentElement.clientHeight - this.dm.offsetHeight;
          else {
            this.dm.style.top = 0;
            this.dm.style.maxHeight = document.documentElement.clientHeight;
          }
        }
        else {
          this.dm.classList('upward');
          this.dm.style.top = 0;
          if (cord.bottom + cord.top < this.dm.offsetHeight) this.dm.style.maxWidth = document.documentElement.clientHeight;
        }
      }
      else {
        let
          dProp = this.dd.getBoundingClientRect(),
          dmProp = {
            width: this.dm.offsetWidth,
            height: this.dm.offsetHeight
          },
          vHeight = window.innerHeight,
          vWidth = window.innerWidth - utils.getScrollbarWidth(),
          spacing, dmPosition
        ;

        if (this.settings.view === "vertical") {
          spacing = {
            top: dProp.top,
            bottom: vHeight - dProp.top - dProp.height,
            left: dProp.left + dProp.width,
            right: vWidth - dProp.left,
          }

          dmPosition = {
            left: dProp.left + dProp.width - dmProp.width,
            right: dProp.left,
            top: dProp.top - dmProp.height,
            bottom: dProp.top + dProp.height,
          }
        }
        else {
          spacing = {
            top: dProp.top + dProp.height,
            bottom: vHeight - dProp.top,
            left: dProp.left,
            right: vWidth - dProp.left - dProp.width,
          }

          dmPosition = {
            left: dProp.left - dmProp.width,
            right: dProp.left + dProp.width,
            top: dProp.top + dProp.width - dmProp.height,
            bottom: dProp.top,
          }
        }

        if (this.settings.directionPriority.x === 'right') {
          if (spacing.right >= dmProp.width || spacing.right >= spacing.left || dmProp.width > spacing.left) {
            if (!this.dd.classList.contains('select')) this.dm.style.left = `${dmPosition.right}px`;
            if (!this.dm.classList.contains('rhs')) {
              this.dm.classList.add('rhs');
              this.dm.classList.remove('lhs');
            }
          }
          else {
            if (!this.dd.classList.contains('select')) this.dm.style.left = `${dmPosition.left}px`;
            if (!this.dm.classList.contains('lhs')) {
              this.dm.classList.add('lhs');
              this.dm.classList.remove('rhs');
            }
          }
        }
        else if (this.settings.directionPriority.x === 'center') {
                    this.dm.style.left = `${Math.max(Math.min(Math.max(0, dProp.left + (dProp.width/2) - (dmProp.width/2)), (vWidth - dmProp.width)), 0)}px`;
        }
        else {
          if (spacing.left >= dmProp.width) {
            if (!this.dd.classList.contains('select')) this.dm.style.left = `${dmPosition.left}px`;
            if (!this.dm.classList.contains('lhs')) {
              this.dm.classList.add('lhs');
              this.dm.classList.remove('rhs');
            }
          }
          else {
            if (!this.dd.classList.contains('select')) this.dm.style.left = `${dmPosition.right}px`;
            if (!this.dm.classList.contains('rhs')) {
              this.dm.classList.add('rhs');
              this.dm.classList.remove('lhs');
            }
          }
        }

        if (this.settings.directionPriority.y === 'bottom') {
          if (spacing.bottom >= dmProp.height || spacing.bottom >= spacing.top || dmProp.height > spacing.top) {
            if (!this.dd.classList.contains('select')) this.dm.style.top = `${dmPosition.bottom}px`;
            if (!this.dm.classList.contains('downward')) {
              this.dm.classList.add('downward');
              this.dm.classList.remove('upward');
            }
          }
          else {
            if (!this.dd.classList.contains('select')) this.dm.style.top = `${dmPosition.top}px`;
            if (!this.dm.classList.contains('upward')) {
              this.dm.classList.add('upward');
              this.dm.classList.remove('downward');
            }
          }
        }
        else {
          if (spacing.top >= dmProp.height) {
            if (!this.dd.classList.contains('select')) this.dm.style.top = `${dmPosition.top}px`;
            if (!this.dm.classList.contains('upward')) {
              this.dm.classList.add('upward');
              this.dm.classList.remove('downward');
            }
          }
          else {
            if (!this.dd.classList.contains('select')) this.dm.style.top = `${dmPosition.bottom}px`;
            if (!this.dm.classList.contains('downward')) {
              this.dm.classList.add('downward');
              this.dm.classList.remove('upward');
            }
          }
        }
      }
    },
    dd_closeAll() {
      let pDd = this.m.dd_getParentDropdown();
      if (pDd) utils.triggerEvent(pDd, new CustomEvent('ddconsole', {detail: 'close all ancestor dropdown'}));
    },
    dd_getParentDropdown() {
      let pDd = utils.getParents(this.dd, '.drop.menu')[0];
      if (pDd && pDd.matches('[data-browsed]')) pDd = [...document.querySelectorAll(`[data-target="${pDd.getAttribute('id')}"]`)].filter(el => el.matches('.dropdown'))[0];
      else pDd = utils.getParents(this.dd, '.dropdown')[0];
      return pDd;
    },
    dd_console(e) {
      if (e.detail === 'close') this.showDropdown.set(false);
      else if (e.detail === 'close all ancestor dropdown') this.m.dd_toggleDropdown('close-all');
      else if (e.detail === 'open') this.showDropdown.set(true);
      else if (e.detail === 'open with keyboard') this.m.dd_toggleDropdown('keyboard');
      else if (e.detail.command === 'set hovered item' && e.detail.el) {
        [...this.dm.querySelectorAll(this.s.it)].forEach((el) => el.classList.remove('hovered'));
        setTimeout(() => e.detail.el.classList.add('hovered'), 10);
      }
    },
    emit_model(value) {
      if (JSON.stringify(value) === JSON.stringify(this.modelValue)) return;
      this.update.emit(value);
    },
    absorb_model(newVal) {
      if (JSON.stringify(newVal) === JSON.stringify(this.value.value)) return;
      let items = [...this.dm.querySelectorAll(this.s.it)];
      
      if (this.settings.multipleSelect) {
        if (!Array.isArray(newVal)) this.update.emit(this.value.value);
        else {
          let modelItems = [];

          newVal.forEach((el) => {
            for (let i = 0; i < items.length; i++) {
              if (el === (items[i].getAttribute('data-value') || items[i].textContent)) {
                modelItems.push(items[i]);
                break;
              }
            }
          });

          items.forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('data-ddid', '');
          });
          this.ip.luiData = {};
          this.tmp.selectionContent = [];

          if (modelItems[0]) {
            modelItems.forEach((item) => {
              let 
                ddid = utils.getUniqueId('ddid'),
                itemValue = item.getAttribute('data-value') || item.textContent
              ;
              
              item.classList.add('selected');
              this.ip.luiData[ddid] = itemValue;
              item.setAttribute('data-ddid', ddid);
              this.tmp.selectionContent.push({
                html: `${item.innerHTML} <i class="svgv1 action close trailing icon"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480.435-421.652 277.522-219.304q-12.131 12.13-29.392 12.413-17.26.282-28.826-12.848-12.695-12.131-12.478-28.674.217-16.544 12.913-29.674L422.217-480 219.304-683.348q-12.695-12.13-12.695-28.674 0-16.543 12.695-29.674 11.566-12.13 28.826-11.848 17.261.283 29.392 12.414l202.913 202.347L682.478-741.13q12.131-12.131 29.392-12.414 17.26-.282 28.826 11.848 12.695 13.131 12.478 29.674-.217 16.544-11.913 28.674L538.783-480l202.478 201.913q11.696 12.696 11.913 29.457.217 16.76-12.478 28.891-11.566 13.13-28.826 12.848-17.261-.283-29.392-12.413L480.435-421.652Z"/></svg></i>`,
                index: ddid
              });
            });
            this.sc.classList.remove('no-content');
          }
          else this.sc.classList.add('no-content');

          if (!items.filter((el) => !el.matches('.selected'))[0]) this.allItemSelected.set(true);

          this.value.next(Object.values(this.ip.luiData));
        }
      }
      else {
        let item = items.filter((item) => newVal === (item.getAttribute('data-value') || item.textContent))[0];
        
        items.forEach(item => item.classList.remove('active'));
          
        if (item) {
          item.classList.add('active');
          this.tmp.selectionContent = item.innerHTML;
          this.value.next(newVal);
        }
        else {
          this.tmp.selectionContent = undefined;
          this.value.next(undefined);
        }
      }
    }
  }

  ngOnInit() {
    let personalSettings = this.options || {};

    this.settings = {
      ...{
        pluginName: "dropdown",
        constrainWidth: false,
        fluidMinWidth: false,
        delay: 0,
        duration: 300,
        closeOnItemClick: true,
        directionPriority: {x: 'right', y: 'bottom'},
      },
      ...personalSettings
    }
    this.settings.view = ((this.classes.includes('sub') && this.settings.view !== 'vertical') || this.settings.view === 'horizontal') ? 'horizontal' : 'vertical';
    this.settings.hover = this.hoverable || this.classes.includes('sub');
    this.settings.page = ((this.settings.page && !this.classes.includes('sub')) && !this.settings.hover) || false;
    this.settings.browse = (this.classes.includes('browse')) || false;
    this.settings.menuId = (this.settings.browse) ? this.menuId : undefined;
    this.settings.selectable = (this.classes.includes('select') || this.classes.includes('selection')) || false;
    this.settings.multipleSelect = (this.settings.selectable && this.classes.includes('multiple')) || false;
    this.settings.searchable = (this.settings.selectable && this.classes.includes('search')) || false;
  };
  ngAfterViewInit() {
    // cache all concurrent elements and selectors
    this.dm = this.dd.querySelector(':scope > .drop.menu') || document.getElementById(this.settings.menuId);
    this.s = {
      it: ':scope > .item:not(.xhover):not(.disabled), :scope > .items > .item:not(.xhover):not(.disabled)', // select all element in dropMenu regardless of it statuses
      it_i: `:scope > .item:not(.xhover):not(.disabled)${!(this.dd.matches('.indicating.multiple')) ? ':not(.selected)': ''}, :scope > .items > .item:not(.xhover):not(.disabled)${!(this.dd.matches('.indicating.multiple')) ? ':not(.selected)': ''}`, // select all element in dropMenu regarding it statuses
      it_f: `:scope > .item:not(.xhover):not(.disabled):not(.filtered)${!(this.dd.matches('.indicating.multiple')) ? ':not(.selected)': ''}, :scope > .items > .item:not(.xhover):not(.disabled):not(.filtered)${!(this.dd.matches('.indicating.multiple')) ? ':not(.selected)': ''}`, // select all element in dropMenu regarding it statuses and also excluding filtered items
      ex: `:scope .exit-dd`, // exiter
    }

    // check if dropdown Menu exist
    if (!this.dm) {
      console.error("A dropdown menu is missing");
      return;
    }

    this.uniqueId = utils.getUniqueId();
    this.dm.setAttribute('data-view', this.settings.view);
    this.dm.setAttribute('data-dmid', this.uniqueId);
    if (this.settings.page) this.dm.classList.add('fixed');
    // open dropdown if the enter key or arrow down key is pressed while dropdown is focused-on
    document.addEventListener('keydown', this.m.dd_openWithKeyboard);
    
    if (this.settings.selectable) {
      // cache all concurrent elements for selectable dropdown
      this.sc = this.dd.querySelector(':scope .content');
      this.ph = this.dd.querySelector(':scope .placeholder');
      this.ip = this.dd.querySelector(':scope input[type="hidden"]');

      // Warn if select dropdown does not have a name prop
      if (!this.name) console.warn("It might be difficult to get the data of a selection-dropdown on this page because its name prop is invalid.");

      // configure search box and cache concurrent element for searchable dropdown
      if (this.settings.searchable) {
        this.sb = this.dd.querySelector(':scope .ssbox');
        this.sz = this.dd.querySelector(':scope .ddmss');
        
        if (this.dd.hasAttribute('tabindex')) {
          this.sb.setAttribute('tabindex', this.dd.getAttribute('tabindex'));
          this.dd.removeAttribute('tabindex');
        }

        /* open dropdown if user typed in the searchbox */
        this.sb.addEventListener('input', this.m.dd_openWithSearch);
      }

      if (this.settings.multipleSelect) {
        if (!this.ip.lui) this.ip.luiData = {};
        this.tmp.selectionContent = [];
        document.addEventListener('click', this.m.dd_mSClickFunc);
        document.addEventListener('keydown', this.m.dd_mSKBFunc);
      }

      /* set select dropdown value for preselected value */
      let items = [...this.dm.querySelectorAll(this.s.it)];
      if (this.settings.multipleSelect && items.filter((el) => el.matches('.selected'))[0]) items.filter((el) => el.matches('.selected')).forEach((el) => this.m.dd_setSelect(el));
      else if (!this.settings.multipleSelect && items.filter((el) => el.matches('.active'))[0]) this.m.dd_setSelect(items.filter((el) => el.matches('.active'))[0]);
    }
    else if (!this.dd.classList.contains('sub')) document.body.append(this.dm);

    /* checkerFill is a function to find all sub dropdownMenu
        that is linked to it dropdown by id and
        add it to tmp.asdm. */
    if (this.settings.menuId) this.tmp.asdm.push(this.dd, this.dm);
    else this.tmp.asdm.push(this.dd);
    this.m.dd_checkerFill(this.dm);

    let target = this.settings.findToggler && this.dd.querySelectorAll(':scope > .dd-toggler:not(".drop.menu")')[0] ? this.dd.querySelectorAll(':scope > .dd-toggler:not(".drop.menu")')[0] : this.dd;

    if (this.settings.hover) {
      target.addEventListener('mouseenter', this.m.dd_toggleDropdown);
      target.addEventListener('touchstart', this.m.dd_toggleDropdown);
    }
    else target.addEventListener('click', this.m.dd_toggleDropdown);

    this.dd.addEventListener('ddconsole', this.m.dd_console);

    if (this.settings.selectable) {
      this.value.subscribe(this.m.emit_model);
      this.modelValue.subscribe(this.m.absorb_model);
      // this.$watch('modelValue', this.m.absorb_model, { immediate: this.modelValue === undefined ? false : true });
    }
  };
  ngOnDestroy() {
    document.removeEventListener('click', this.m.dd_clickOnDom);
    document.removeEventListener('keyup', this.m.dd_EscTabFunc);
    document.removeEventListener('keydown', this.m.dd_KBFunc);
    document.removeEventListener('mousemove', this.m.dd_mouseMover);
    window.removeEventListener('resize', this.m.dd_CalcPosition);
    window.removeEventListener('scroll', this.m.dd_CalcPosition, true);

    if (this.settings.hover) document.removeEventListener('mousemove', this.m.dd_toggleDropdown);

    document.removeEventListener('keydown', this.m.dd_openWithKeyboard);
    
    if (this.settings.multipleSelect) {
      document.removeEventListener('click', this.m.dd_mSClickFunc);
      document.removeEventListener('keydown', this.m.dd_mSKBFunc);
    }
    if(this.dm) this.dd.append(this.dm); // return drop menu to the drop down to get it removed also.
  };
}
