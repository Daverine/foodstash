import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	selector: '[appCollapsible]',
	standalone: true,
})
export class CollapsibleDirective implements AfterViewInit {
	constructor(private el: ElementRef) {}

	ngAfterViewInit(): void {
		let el = this.el.nativeElement;

		this.toggler = el.classList.contains('collapsible-cont')
			? el.querySelector('header')
			: el;
		this.collapsible = this.toggler.nextElementSibling.matches(
			el.classList.contains('collapsible-cont') ? '.body' : '.collapsible'
		)
			? this.toggler.nextElementSibling
			: null;
		this.accordion = el.getAttribute('data-collapsible');
	}

	@HostListener('click', ['$event']) onClick(e) {
		this.toggleCollapsible(e);
	}

	toggler;
	collapsible;
	accordion;

	toggleCollapsible(e) {
		const el = e.currentTarget;
	
		el.classList.toggle('active');

		if (this.collapsible) {
			if (el.classList.contains('active')) {
				this.toggler.classList.add('active');
				this.collapsible.style.maxHeight = this.collapsible.scrollHeight + 'px';

				if (this.accordion) {
					let activeElems = [
						...el.parentNode.querySelectorAll(
							`:scope > [data-collapsible='${this.accordion}']`
						),
					].filter((elem) => elem.classList.contains('active') && elem !== el);
					if (activeElems[0]) {
						activeElems.forEach((el) => el.dispatchEvent(new Event('click')));
					}
				}
			} else {
				this.toggler.classList.remove('active');
				this.collapsible.style.maxHeight = null;
			}
		}
	}
}
