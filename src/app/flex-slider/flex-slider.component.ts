import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-flex-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flex-slider.component.html',
  styleUrls: ['./flex-slider.component.scss'],
})

export class FlexSliderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('carouselParent') carouselParent: ElementRef;
  flexCont: HTMLElement;
  slideItems: NodeListOf<HTMLElement>;
  prev: HTMLElement;
  next: HTMLElement;

  @Input() indicatorListener;
  @Input() slideResizeConfig;
  @Input() autoSlide = false;
  @Input() infiniteSlide = false;
  @Input() template;

  indicators: NodeListOf<HTMLElement>;
  @Output() onIndChng = new EventEmitter();
  @Output() onClick = new EventEmitter();

  autoSlideVar;
  ind = 0;

  draggable = false;

  initialSlidePos = 0;
  draggingPos = 0;
  initialXPos;
  minPos;
  showSlideNo;

  spaceBtwItem;
  slideExt;
  parW;
  flexW;

  dragEvHolder;
  stopDragEvHolder;

  mobs: MutationObserver;
  indSub;
  count = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.winResEv(false);
    }
    if (this.indSub) {
      this.indSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.flexCont =
          this.carouselParent.nativeElement.querySelector('.flexCont');
        this.slideItems = this.flexCont.querySelectorAll('.carouselItem');
        this.count = this.slideItems.length;
        this.next = this.carouselParent.nativeElement.querySelector('.next');
        this.prev = this.carouselParent.nativeElement.querySelector('.prev');
        this.indicators =
          this.carouselParent.nativeElement.querySelectorAll('.indicatorItem');
        if (this.indicators.length) {
          this.indicators.forEach((el, i) => {
            el.onclick = () => {
              this.indicatorSlide(i);
            };
          });
        }
        this.mobs = new MutationObserver(() => {
          let curitems = this.flexCont.querySelectorAll('.carouselItem');
          let preserve = curitems.length > this.slideItems.length;
          this.cloneCtrl(false);
          this.genSlideNo(this.showSlideNo, preserve);
        });
        this.responsive();
        this.winResEv(true);
        if (this.indicatorListener) {
          this.indSub = this.indicatorListener.subscribe((ind) => {
            this.indicatorSlide(ind, false);
          });
        }
      });
    }
  }

  indicatorSlide(n, transit = true) {
    this.ind = n;
    this.initialSlidePos = n * this.slideExt * -1;
    this.flexCont.style.transition = `${transit ? 0.6 : 0}s ease`;
    this.flexCont.style.left = `${this.initialSlidePos}px`;
    this.draggingPos = this.initialSlidePos;
    this.setIndicator();
  }

  private winResEv(add) {
    const me = this;
    function resize() {
      me.responsive();
    }
    if (add) {
      window.addEventListener('resize', resize);
    } else {
      window.removeEventListener('resize', resize);
    }
  }

  private responsive() {
    this.parW = +getComputedStyle(
      this.carouselParent.nativeElement
    ).width.replace('px', '');
    let pL = +getComputedStyle(
      this.carouselParent.nativeElement
    ).paddingLeft.replace('px', '');
    let pR = +getComputedStyle(
      this.carouselParent.nativeElement
    ).paddingRight.replace('px', '');
    this.stopAutoSlide();
    this.parW = this.parW - pL - pR;
    this.spaceBtwItem = +getComputedStyle(
      this.slideItems[0]
    ).marginRight.replace('px', '');
    for (let eachConf of this.slideResizeConfig) {
      if (!eachConf.maxW) {
        if (this.parW >= eachConf.minW) {
          this.genSlideNo(eachConf.slideNo);
        }
      } else if (!eachConf.minW) {
        if (this.parW < eachConf.maxW) {
          this.genSlideNo(eachConf.slideNo);
        }
      } else {
        if (this.parW >= eachConf.minW && this.parW < eachConf.maxW) {
          this.genSlideNo(eachConf.slideNo);
        }
      }
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideVar = setInterval(() => {
      this.slide(1);
    }, 5000);
  }

  stopAutoSlide() {
    clearInterval(this.autoSlideVar);
  }

  canClone = false;

  private async cloneCtrl(add) {
    if (add) {
      this.canClone = true;
      await new Promise((rsv) => {
        setTimeout(() => {
          let clones =
            this.carouselParent.nativeElement.querySelectorAll('.carouselItem');
          clones.forEach((e) => {
            this.flexCont.appendChild(e);
          });
          this.slideItems = this.flexCont.querySelectorAll('.carouselItem');
          rsv('done');
        });
      });
    } else {
      let cloneParent =
        this.carouselParent.nativeElement.querySelector('.cloneParent');
      for (let i = this.slideItems.length - 1; i >= this.count; i--) {
        cloneParent.appendChild(this.slideItems[i]);
      }
      this.slideItems = this.flexCont.querySelectorAll('.carouselItem');
      this.canClone = false;
    }
  }

  private async genSlideNo(no, preservePos = false) {
    this.mobs.disconnect();
    if (this.count > no) {
      this.eventBinding(true);
      if (this.slideItems.length == this.count && this.infiniteSlide) {
        await this.cloneCtrl(true);
      }
    } else {
      this.eventBinding(false);
      if (this.infiniteSlide) {
        await this.cloneCtrl(false);
      }
    }
    let eachW = (this.parW - (no - 1) * this.spaceBtwItem) / no;
    this.slideItems.forEach((each, i) => {
      each.style.width = `${eachW}px`;
      each.onclick = (e) => {
        this.onClick.emit({
          event: e,
          index: i % (this.slideItems.length / 2),
        });
      };
    });
    this.showSlideNo = no;
    this.slideExt = eachW + this.spaceBtwItem;
    this.flexW = this.slideExt * this.slideItems.length;
    this.flexCont.style.width = `${this.flexW}px`;
    this.initialSlidePos = preservePos
      ? this.initialSlidePos
      : this.count > no && this.infiniteSlide
      ? this.slideExt * (this.slideItems.length / 2) * -1
      : 0;
    this.setIndicator();
    this.flexCont.style.left = `${this.initialSlidePos}px`;
    this.draggingPos = this.initialSlidePos;
    this.minPos = (this.flexW - this.spaceBtwItem - this.parW) * -1;
    this.mobs.observe(this.flexCont, { subtree: true, childList: true });
  }

  private eventBinding(bind) {
    if (bind) {
      this.draggable = true;
      this.prev.onclick = () => {
        this.slide(-1);
      };
      if (!this.infiniteSlide) {
        this.prev.classList.add('d-none');
        this.next.classList.remove('d-none');
      }
      this.next.onclick = () => {
        this.slide(1);
      };
      if (this.autoSlide && this.infiniteSlide) {
        this.startAutoSlide();
      }
    } else {
      this.draggable = false;
      this.prev.onclick = null;
      this.next.onclick = null;
      this.prev.classList.add('d-none');
      this.next.classList.add('d-none');
    }
  }

  dragStart(e) {
    const me = this;
    let target = e.target;
    if (
      target.classList.contains('prev') ||
      target.classList.contains('next') ||
      target.parentElement.classList.contains('prev') ||
      target.parentElement.classList.contains('next')
    )
      return;
    if (e.type != 'touchstart') {
      e.preventDefault();
    }
    this.carouselParent.nativeElement.style.cursor = 'grab';
    this.initialXPos = e.type == 'mousedown' ? e.x : e.touches[0].clientX;
    this.flexCont.style.transition = '0s';
    this.dragEvHolder = drag;
    this.stopDragEvHolder = stopDrag;
    if (e.type == 'touchstart') {
      this.stopAutoSlide();
    }

    function drag(e) {
      me.drag(e);
    }
    function stopDrag(e) {
      me.dragEnd(e);
    }
    if (e.type == 'mousedown') {
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
    } else {
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', stopDrag);
    }
  }

  private drag(e) {
    let currPos = e.type == 'mousemove' ? e.x : e.touches[0].clientX;
    let diff = currPos - this.initialXPos;
    this.initialXPos = currPos;
    let finalPos = this.draggingPos + diff;
    if (!this.infiniteSlide) {
      if (
        (finalPos > 0 && diff > 0) ||
        (this.draggingPos < this.minPos && diff < 0)
      ) {
        finalPos = this.draggingPos + diff * 0.1;
      }
    } else {
      if (
        (finalPos > 0 && diff > 0) ||
        (this.draggingPos < this.minPos && diff < 0)
      ) {
        if (diff > 0) {
          finalPos = this.slideExt * (this.slideItems.length / 2) * -1;
        } else {
          finalPos =
            -1 *
            (this.slideExt * (this.slideItems.length / 2 - this.showSlideNo));
        }
        this.initialSlidePos = finalPos;
      }
    }
    this.draggingPos = finalPos;
    this.flexCont.style.left = `${finalPos}px`;
  }

  private dragEnd(e) {
    const me = this;
    if (e.type == 'mouseup') {
      document.removeEventListener('mousemove', me.dragEvHolder);
      document.removeEventListener('mouseup', me.stopDragEvHolder);
    } else {
      document.removeEventListener('touchmove', me.dragEvHolder);
      document.removeEventListener('touchend', me.stopDragEvHolder);
    }
    this.carouselParent.nativeElement.style.cursor = 'default';
    let isA = false;
    let path = e.path || e.composedPath();
    for (let i = 0; i < path.length - 2; i++) {
      if (path[i].tagName == 'A' && path[i].href != 'javascript:void(0)') {
        isA = true;
      }
    }
    if (!this.infiniteSlide) {
      if (this.draggingPos > 0) {
        if (isA) {
          e.target.onclick = (s) => {
            s.preventDefault();
            s.stopPropagation();
          };
        }
        this.flexCont.style.transition = '0.1s ease';
        this.flexCont.style.left = '0px';
        this.draggingPos = 0;
        this.initialSlidePos = 0;
        this.prev.classList.add('d-none');
        this.next.classList.remove('d-none');
        this.setIndicator();
        return;
      } else if (this.draggingPos < this.minPos) {
        if (isA) {
          e.target.onclick = (s) => {
            s.preventDefault();
            s.stopPropagation();
          };
        }
        this.flexCont.style.transition = '0.1s ease';
        this.flexCont.style.left = `${this.minPos}px`;
        this.draggingPos = this.minPos;
        this.initialSlidePos = this.minPos;
        this.next.classList.add('d-none');
        this.prev.classList.remove('d-none');
        this.setIndicator();
        return;
      }
    }
    let slideDiff, finalPos;
    this.flexCont.style.transition = '0.3s ease';
    if (this.draggingPos < this.initialSlidePos) {
      slideDiff = (this.initialSlidePos - this.draggingPos) % this.slideExt;
      if (slideDiff > 0.1 * this.slideExt) {
        finalPos = this.draggingPos - (this.slideExt - slideDiff);
      } else {
        this.flexCont.style.transition = '0.1s ease';
        finalPos = this.draggingPos + slideDiff;
      }
      if (!this.infiniteSlide) {
        if (+finalPos.toFixed(2) <= +this.minPos.toFixed(2)) {
          this.next.classList.add('d-none');
          this.prev.classList.remove('d-none');
        } else {
          this.next.classList.remove('d-none');
          this.prev.classList.remove('d-none');
        }
      }
    } else if (this.draggingPos > this.initialSlidePos) {
      slideDiff = (this.draggingPos - this.initialSlidePos) % this.slideExt;
      if (slideDiff > 0.1 * this.slideExt) {
        finalPos = this.draggingPos + (this.slideExt - slideDiff);
      } else {
        this.flexCont.style.transition = '0.1s ease';
        finalPos = this.draggingPos - slideDiff;
      }
      if (!this.infiniteSlide) {
        if (+finalPos.toFixed(0) >= 0) {
          this.prev.classList.add('d-none');
          this.next.classList.remove('d-none');
        } else {
          this.next.classList.remove('d-none');
          this.prev.classList.remove('d-none');
        }
      }
    } else {
      if (isA) {
        e.target.onclick = null;
      }
    }
    if (finalPos != undefined) {
      if (isA) {
        e.target.onclick = (s) => {
          s.preventDefault();
          s.stopPropagation();
        };
      }
      this.flexCont.style.left = `${finalPos}px`;
      this.draggingPos = finalPos;
      this.initialSlidePos = finalPos;
      this.setIndicator();
    }
    if (e.type == 'touchend' && this.autoSlide && this.infiniteSlide) {
      this.startAutoSlide();
    }
  }

  private slide(n) {
    if (!this.infiniteSlide) {
      if (
        (n == 1 &&
          +this.initialSlidePos.toFixed(2) <= +this.minPos.toFixed(2)) ||
        (n == -1 && +this.initialSlidePos.toFixed(0) >= 0)
      )
        return;
      if (n == 1) {
        this.prev.classList.remove('d-none');
      }
      if (n == -1) {
        this.next.classList.remove('d-none');
      }
    }
    let finalPos = this.initialSlidePos - n * this.slideExt;
    if (this.infiniteSlide) {
      let resetPos;
      if ((finalPos < this.minPos && n == 1) || (finalPos > 0 && n == -1)) {
        if (finalPos < this.minPos && n == 1) {
          resetPos =
            this.slideExt * (this.slideItems.length / 2 - this.showSlideNo);
        } else {
          resetPos = this.slideExt * (this.slideItems.length / 2);
        }
        this.flexCont.style.transition = '0s';
        this.flexCont.style.left = `-${resetPos}px`;
        finalPos = -resetPos - n * this.slideExt;
      }
    }
    setTimeout(() => {
      this.flexCont.style.transition = '0.6s ease';
      this.flexCont.style.left = `${finalPos}px`;
      this.initialSlidePos = finalPos;
      this.setIndicator();
      this.draggingPos = finalPos;
      if (!this.infiniteSlide) {
        if (
          n == 1 &&
          +this.initialSlidePos.toFixed(2) <= +this.minPos.toFixed(2)
        ) {
          this.next.classList.add('d-none');
        }
        if (n == -1 && this.initialSlidePos >= 0) {
          this.prev.classList.add('d-none');
        }
      }
    }, 10);
  }

  setIndicator() {
    this.ind =
      ((this.initialSlidePos * -1) / this.slideExt) %
      (this.slideItems.length / 2);
    this.ind = Math.round(this.ind);
    this.onIndChng.emit(this.ind);
    if (!this.indicators.length) return;
    this.indicators.forEach((el, i) => {
      if (i == this.ind) {
        el.classList.add('activeInd');
      } else {
        el.classList.remove('activeInd');
      }
    });
  }
}
