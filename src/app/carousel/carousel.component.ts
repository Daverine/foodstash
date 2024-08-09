import { AfterViewInit, OnDestroy, Component, ElementRef, Input } from '@angular/core';
import { utils } from '../../assets/js/utils';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  host: {
    class: 'carousel',
  }
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  constructor(private el: ElementRef) {
    Object.keys(this.m).forEach(el => this.m[el] = this.m[el].bind(this));
  }

  carousel;
  viewbox;
  slider;
  slides;
  currSlide;
  prevSlide;
  tracker;
  prevBtn;
  nextBtn;
  settings;
  uniqueId;
  initialized;

  factory = {
    namespace: 'carousel',
    continuous: true, // can also be set to string 'rewind'
    slidesPerView: 1,
    sliderMove: 'slide', // can also be page to move all the slide in a view out on next or prev
    spaceBetween: '0.5rem',
    breakpoints: [],
    // breakpoints: [
    // 	{	
    // 		minWidth: 500,
    // 		// maxWidth: 1700,
    // 		slidesPerView: 3,
    // 		spaceBetween: 20,
    // 	},
    // 	{	
    // 		// minWidth: 400,
    // 		minWidth: 800,
    // 		slidesPerView: 2,
    // 		spaceBetween: 50,
    // 	}
    // ],
    animation: 'slide',
    direction: 'horizontal',
    track: 'default', // can also be the following: 'thumbnails', 'scroll'.
    trackView: 'slide',
    slidesHeight: 'auto', // can also be 'inherit'
    transitionDuration: 500,
    autoslide: true,
    autoslideInterval: 15000,
    pauseOnHover: true,
    imageZoom: true,
    videoAutoPlay: false,
    videoMute: true,
    controllable: true
  };
        
  tmp = {
    newCoord: 0,
    startCoord: 0,
    endCoord: 0,
    initCoord: 0,
    gsmScale: 0,
    coordChange: false,
    gsDir: 0,
    autoslider: undefined,
    autosliding: false,
    slidesNo: null,
    slideNo: null,
    slidesPerView: undefined,
    slideExt: undefined,
    minExt: undefined,
    maxExt: undefined,
    gT: undefined,
    updateSet: undefined,

    sizeResponse: undefined,
    gestureMove: undefined,
    gestureEnd: undefined,
    stopAutoslider: undefined,
  };

  m = {
    sizeResponse() {
      this.changeInSlides.disconnect();
      this.m.stopAutoslider();
      let mediaWidth = window.innerWidth;
      let matchedBreakpoints = this.settings.breakpoints.filter(el => (el.minWidth || el.maxWidth) && (!el.minWidth || el.minWidth <= mediaWidth) && (!el.maxWidth || el.maxWidth >= mediaWidth));
      // sort breakpoints by maxWidth and then select the first breakpoint or sort breakpoints by minWidth and then select the first breakpoint
      let breakpoint = matchedBreakpoints.filter(el => el.maxWidth).sort((a, b) => Number(a.maxWidth) - Number(b.maxWidth))[0] || matchedBreakpoints.filter(el => el.minWidth).sort((a, b) => Number(b.minWidth) - Number(a.minWidth))[0];
      if (breakpoint) this.init(breakpoint);
      else this.init();
      this.changeInSlides.observe(this.carousel, {subtree: true, childList: true,});
    },
    gestureStart(e) {
      if (this.tmp.slidesNo <= 1) return; // stop gesture if total number of slides is one or less;
  
      if (this.settings.autoslide) this.m.stopAutoslider();
  
      // save gesture time start to know gesture duration
      this.tmp.gT = new Date().getTime();
  
      // save the initial value of bb.newCoord to have it accessable when the move-gesture event is triggered. (That's because the newCoord value might change during the event)
      this.tmp.initCoord = this.tmp.newCoord;
      this.tmp.startCoord = this.dist(e);
      this.tmp.coordChange = false;
      this.tmp.endCoord = this.tmp.startCoord; // set the initial endCoord to the startpoint coord;
  
      // Swiping
      this.slider.classList.add('swiping');
  
      if (e.type === 'touchstart') {
        document.addEventListener('touchmove', this.m.gestureMove);
        document.addEventListener('touchend', this.m.gestureEnd);
      }
      else if (e.type === 'mousedown') {
        document.addEventListener('mousemove', this.m.gestureMove);
        document.addEventListener('mouseup', this.m.gestureEnd);
      }
    },
    gestureMove(e) {
      this.tmp.gsDir = this.tmp.endCoord > this.dist(e) ? 1 : this.tmp.endCoord < this.dist(e) ? -1 : this.tmp.gsDir;
      this.tmp.endCoord = this.dist(e);
      if (Math.abs(this.tmp.endCoord - this.tmp.startCoord) > 5 && !this.tmp.coordChange) this.tmp.coordChange = true;
  
      // Swipping in action
      if (this.tmp.coordChange) {
        this.tmp.newCoord = this.tmp.initCoord + this.tmp.endCoord - this.tmp.startCoord + (this.tmp.gsmScale * Math.abs(this.tmp.minExt));
  
        if (this.settings.continuous && this.settings.continuous !== 'rewind') {
          if (this.tmp.gsDir === 1 && this.tmp.newCoord < this.tmp.maxExt) this.tmp.gsmScale += 1;
          else if (this.tmp.gsDir === -1 && this.tmp.newCoord > this.tmp.minExt) this.tmp.gsmScale -= 1;
          this.tmp.newCoord = this.tmp.initCoord + this.tmp.endCoord - this.tmp.startCoord + (this.tmp.gsmScale * Math.abs(this.tmp.minExt));
        }
  
        this.slider.style.transform = `translateX(${this.tmp.newCoord}px)`;
      }
    },
    gestureEnd(e) {
      if (e.type === 'touchend') {
        document.removeEventListener('touchmove', this.m.gestureMove);
        document.removeEventListener('touchend', this.m.gestureEnd);
      }
      else {
        document.removeEventListener('mousemove', this.m.gestureMove);
        document.removeEventListener('mouseup', this.m.gestureEnd);
      }
  
      this.tmp.gsDir = 0; // reset gesture move direction
      this.tmp.gsmScale = 0; // reset gesture move scale offset calculation
  
      if (this.slider.classList.contains('swiping') && this.tmp.coordChange) {
        let
          xChange = this.tmp.endCoord - this.tmp.startCoord,
          sChange = Math.abs(xChange / this.tmp.slideExt);
  
        if (Math.abs(xChange) > this.tmp.slideExt / 3 || (Math.abs(xChange) > this.tmp.slideExt / 20 && new Date().getTime() - this.tmp.gT < 300)) {
          this.slider.classList.remove('swiping');
          sChange = (this.settings.continuous)
            ? Math.ceil(sChange) > this.tmp.slidesNo
              ? Math.ceil(sChange) % this.tmp.slidesNo
              : Math.ceil(sChange)
            : Math.ceil(sChange);
          this.update(this.tmp.slideNo + ((xChange > 0) ? -sChange : sChange));
        }
        else {
          this.tmp.newCoord = this.tmp.initCoord + this.tmp.endCoord - this.tmp.startCoord;
          this.slider.style.transform = `translateX(${this.tmp.newCoord}px)`;
          setTimeout(() => {
            this.slider.classList.remove('swiping');
            this.update(this.tmp.slideNo);
          }, 20);
        }
      }
      else {
        this.slider.classList.remove('swiping'); // Do this to ensure the swiping class is removed if added by event emulation
        this.update(this.tmp.slideNo);
      }
  
      if (this.settings.pauseOnHover && this.slider.contains(e.target) && e.type !== 'touchend') return;
      if (this.settings.autoslide) this.m.startAutoslider();
    },
    prevSlides() {
      let newI = this.tmp.slideNo - (this.settings.sliderMove === 'page' ? this.tmp.slidesPerView : 1);
  
      if ((this.settings.continuous && this.settings.continuous !== 'rewind') && newI < 1) {
        this.slider.classList.add('ghost-walk');
        this.slider.style.transform = `translateX(${this.tmp.newCoord + this.tmp.minExt}px)`;
        setTimeout(() => { this.slider.classList.remove('ghost-walk'); }, 10);
      }
      setTimeout(() => this.update(newI), 20);
      this.m.startAutoslider();
    },
    nextSlides() {
      let newI = this.tmp.slideNo + (this.settings.sliderMove === 'page' ? this.tmp.slidesPerView : 1);
  
      if ((this.settings.continuous && this.settings.continuous !== 'rewind') && newI > this.tmp.slidesNo) {
        this.slider.classList.add('ghost-walk');
        this.slider.style.transform = `translateX(${this.tmp.newCoord - this.tmp.minExt}px)`;
        setTimeout(() => { this.slider.classList.remove('ghost-walk'); }, 10);
      }
      setTimeout(() => this.update(newI), 20);
      this.m.startAutoslider();
    },
    trackControl(e) {
      let track = e.target.closest('button.track');
      if (track) this.update(Number(track.getAttribute('data-trackid')));
    },
    startAutoslider() {
      if (this.slider.classList.contains('swiping')) return;
      this.m.stopAutoslider();
      this.tmp.autoslider = setInterval(() => {
        let newI = this.tmp.slideNo + (this.settings.sliderMove === 'page' ? this.tmp.slidesPerView : 1);
  
        if ((this.settings.continuous && this.settings.continuous !== 'rewind') && newI > this.tmp.slidesNo) {
          this.slider.classList.add('ghost-walk');
          this.slider.style.transform = `translateX(${this.tmp.newCoord - this.tmp.minExt}px)`;
          setTimeout(() => { this.slider.classList.remove('ghost-walk'); }, 10);
        }
        setTimeout(() => this.update(newI), 20);
      }, this.settings.autoslideInterval);
    },
    stopAutoslider() {
      clearInterval(this.tmp.autoslider);
    },
  }; // method used for events

  @Input() options;

  ngAfterViewInit() {
    this.settings = {
			...this.factory,
			...this.options || {}
		};
		this.uniqueId = utils.getUniqueId(this.settings.namespace);

    this.carousel = this.el.nativeElement;
    this.viewbox = this.carousel.querySelector(':scope > .cs-viewbox');
    this.slider = this.viewbox.querySelector(':scope > .cs-slider');

    this.prevBtn = this.carousel.querySelector('.cs-prev');
    this.nextBtn = this.carousel.querySelector('.cs-next');
    this.tracker = this.carousel.querySelector('.cs-tracker');

		this.slider.style.transitionDuration = `${this.settings.transitionDuration}ms`;
		this.slider.setAttribute('data-anim', this.settings.animation);

    if (!this.slider) {
      console.error("An important element is missing in a carousel.");
      return;
    }

    // Use mouse wheel to zoom image
		// this.slider.addEventListener('wheel', this.mouseWheel);

		this.slider.ondragstart = () => false; // prevent browser from hijacking swiping process
		this.slider.addEventListener('mousedown', this.m.gestureStart);
		this.slider.addEventListener('touchstart', this.m.gestureStart);

		if (this.settings.autoslide && this.settings.pauseOnHover) {
			this.slider.addEventListener('mouseenter', this.m.stopAutoslider);
			this.slider.addEventListener('mouseleave', this.m.startAutoslider);
		}

    // navigator control on carousel
		if (this.prevBtn) this.prevBtn.addEventListener('click', this.m.prevSlides);
		if (this.nextBtn) this.nextBtn.addEventListener('click', this.m.nextSlides);

    // slide track control on carousel
		if (this.tracker) this.tracker.addEventListener('click', this.m.trackControl);

		// responsiveness
		window.addEventListener('resize', this.m.sizeResponse);
    this.m.sizeResponse();
  }

  changeInSlides = new MutationObserver(() => {
    console.log('i got here');
    this.m.sizeResponse();
  });

  ngOnDestroy() {
    window.removeEventListener('resize', this.m.sizeResponse);
  }

  init(aBreakpoint = {}) {
    let breakpoint = {
      ...{
        slidesPerView: this.settings.slidesPerView,
        spaceBetween: this.settings.spaceBetween,
        slidesHeight: this.settings.slidesHeight
      },
      ...aBreakpoint
    };
    breakpoint.spaceBetween = typeof (breakpoint.spaceBetween) === 'number' ? `${breakpoint.spaceBetween}px` : breakpoint.spaceBetween;
    this.slides = [...this.slider.querySelectorAll(`:scope > .cs-slide`)].filter(el => !el.matches(`[data-creator='${this.uniqueId}']`));
    if (!this.slides[0]) return;

    // Initialize carousel
    if (!this.initialized || this.tmp.slidesNo !== this.slides.length) {
      [...this.carousel.querySelectorAll(`:scope [data-creator='${this.uniqueId}']`)].forEach(el => el.remove());
      this.slides.forEach((el, index) => {
        el.setAttribute('data-csId', index + 1);
        let track = document.createElement('button');
        track.classList.add('track');
        track.setAttribute('data-trackId', index + 1);
        track.setAttribute('data-creator', this.uniqueId);
        this.tracker.append(track);

        if (this.settings.continuous && this.settings.continuous !== 'rewind') {
          let eC = el.cloneNode(true);
          eC.setAttribute('data-creator', this.uniqueId);
          eC.classList.remove('active');
          this.slider.append(eC);
          if (!index) this.slider.prepend(eC.cloneNode(true));
          else this.slider.insertBefore(eC.cloneNode(true), this.slider.children[index]);
        }
      });
      this.initialized = true;
    }

    this.tmp.slidesNo = this.slides.length; // number of slides in the carousel
    // the 1-based index of the current slide
    this.tmp.slideNo = this.slides.filter(el => el.classList.contains('active'))[0]
      ? Number(this.slides.filter(el => el.classList.contains('active'))[0].getAttribute('data-csId'))
      : 1;
    this.currSlide = this.slides[this.tmp.slideNo - 1];

    // ensure the slidePerPage is not more than the number of slides in the carousel in a continuous carousel
    this.tmp.slidesPerView = (this.settings.continuous && this.settings.continuous !== 'rewind') && breakpoint.slidesPerView > this.tmp.slidesNo ? this.tmp.slidesNo : breakpoint.slidesPerView;
    [...this.slider.querySelectorAll(`:scope > .cs-slide`)].forEach((el) => {
      el.style.width = `calc(((100% + ${breakpoint.spaceBetween}) / ${this.tmp.slidesPerView}) - ${breakpoint.spaceBetween})`;
      el.style.marginRight = breakpoint.spaceBetween;
      if (breakpoint.slidesHeight === 'inherit') el.style.height = 'inherit';
    });
    // cache slide extent
    this.tmp.slideExt = this.currSlide.offsetWidth + parseFloat(window.getComputedStyle(this.currSlide).getPropertyValue('margin-right'));

    if (this.settings.continuous && this.settings.continuous !== 'rewind') {
      this.tmp.minExt = -(this.tmp.slideExt * this.tmp.slidesNo);
      this.tmp.maxExt = -(this.tmp.slideExt * this.tmp.slidesNo * 2) + this.tmp.slideExt;
    }

    this.update();
    if (this.settings.autoslide) this.m.startAutoslider();
  }
  dist(e) {
    return e.type.indexOf("touch") > -1 ? e.touches[0].pageX : e.clientX;
  }
  update(newI = this.tmp.slideNo) {
    let sBleed = (this.settings.continuous && this.settings.continuous !== 'rewind') ? this.tmp.slidesNo * this.tmp.slideExt : 0;
    clearTimeout(this.tmp.updateSet);

    newI = (!this.settings.continuous)
      ? (newI < 1)
        ? 1
        : (newI > this.tmp.slidesNo)
          ? this.tmp.slidesNo
          : newI
      : (newI < 1)
        ? this.tmp.slidesNo + newI
        : (newI > this.tmp.slidesNo)
          ? newI - this.tmp.slidesNo
          : newI;
    ;
    // pause html5 video when current slide change
    // stop youtube video when current slide change

    this.prevSlide = this.currSlide;
    this.tmp.slideNo = newI;
    this.currSlide = this.slides[this.tmp.slideNo - 1];
    this.tmp.newCoord = -sBleed + Math.min(Math.max((newI - 1) * -this.tmp.slideExt, -(this.tmp.slideExt * this.tmp.slidesNo - this.tmp.slideExt)), 0);
    this.slider.style.transform = `translateX(${this.tmp.newCoord}px)`;
    this.tmp.updateSet = setTimeout(() => {
      [...this.slider.querySelectorAll(`:scope > .cs-slide`)].forEach((el) => el.classList.remove('active'));
      [...this.slider.querySelectorAll(`:scope > .cs-slide[data-csid='${newI}']`)].forEach((el) => el.classList.add('active'));
    }, this.settings.transitionDuration);


    // determine controls
    if (!this.settings.continuous && this.tmp.slidesNo > 1) {
      if (this.tmp.slideNo === 1) {
        this.prevBtn.classList.add('disabled');
        this.nextBtn.classList.remove('disabled');
      }
      else if (this.tmp.slideNo === this.tmp.slidesNo) {
        this.nextBtn.classList.add('disabled');
        this.prevBtn.classList.remove('disabled');
      }
      else {
        this.prevBtn.classList.remove('disabled');
        this.nextBtn.classList.remove('disabled');
      }
    }

    if (this.tmp.slidesNo === 1) {
      this.prevBtn.classList.add('disabled');
      this.nextBtn.classList.add('disabled');
    }

    let track = this.tracker.querySelector(`:scope [data-trackid="${newI}"]`);
    track.classList.add('active');
    [...this.tracker.children].filter((el) => el != track).forEach((el) => el.classList.remove('active'));
    this.tmp.coordChange = false;
  }
}
