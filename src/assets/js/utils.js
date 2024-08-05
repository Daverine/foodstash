export const utils = {
	getEscTrack() {
		if (typeof(window.lui_EscTracker) !== 'number') window.lui_EscTracker = 0; 
		window.lui_EscTracker++;
		return window.lui_EscTracker;
	},
	checkEscStatus(trackNo) {
		let status = trackNo === window.lui_EscTracker;
		if (status) { window.lui_EscTracker--; }
		return status;
	},
	getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	},
	lockWindowScroll(lockerId) {
		if (!window.lui_ScrollLockers) window.lui_ScrollLockers = [];
		if (!window.lui_ScrollLockers.length) {
			// we guess it abnormal to add margin to the html unless on circumstance like this
			let scrollBarWidth = `${this.getScrollbarWidth()}px`;
			document.documentElement.classList.add('scroll-locked');
			document.documentElement.style.marginRight = scrollBarWidth;
			document.documentElement.style.overflow = 'hidden';
			[...document.querySelectorAll('.respect-lock')].forEach(el => {
				if (!el.lui) el.lui = {};
            	el.lui.styleBeforeLock = el.getAttribute('style');
				el.style.maxWidth = `calc(100% - ${scrollBarWidth})`;
				el.style.marginRight = scrollBarWidth; 
			});
		}
		if (!window.lui_ScrollLockers.includes(lockerId)) window.lui_ScrollLockers.push(lockerId);
	},
	unlockWindowScroll(lockerId) {
		if (window.lui_ScrollLockers && window.lui_ScrollLockers.includes(lockerId)) {
			window.lui_ScrollLockers = window.lui_ScrollLockers.filter(el => el !== lockerId);
			
			if (!window.lui_ScrollLockers.length) {
				document.documentElement.style.marginRight = null;
				document.documentElement.style.overflow = null;
				document.documentElement.classList.remove('scroll-locked');
				[...document.querySelectorAll('.respect-lock')].forEach(el => {
					el.setAttribute('style', ((el.lui && el.lui.styleBeforeLock) ? el.lui.styleBeforeLock : null));
					if (el.lui && el.lui.styleBeforeLock) el.lui.styleBeforeLock = null;
				});
			}
		}
	},
	getUniqueId(nameSpace) {
		if (typeof(window.lui_uuid) !== 'number') window.lui_uuid = 0; 
		window.lui_uuid++;
		nameSpace = (nameSpace != undefined && typeof(nameSpace) === 'string')
			? nameSpace
			: 'unique-id'

		return nameSpace + window.lui_uuid;
	},
	getCssVal(el, prop) {
		return window.getComputedStyle(el).getPropertyValue(prop);
	},
	contentSize(el) {
		let styleList = window.getComputedStyle(el), box = el.getBoundingClientRect();
		return {
			height: box.height - parseFloat(styleList.paddingTop) - parseFloat(styleList.paddingBottom) - parseFloat(styleList.borderTopWidth) - parseFloat(styleList.borderBottomWidth),
			width: box.width - parseFloat(styleList.paddingLeft) - parseFloat(styleList.paddingRight) - parseFloat(styleList.borderLeftWidth) - parseFloat(styleList.borderRightWidth)
		}
	},
	offsetPos(el) {
		let box = el.getBoundingClientRect(), docElem = document.documentElement;
		return {
		  top: box.top + window.scrollY - docElem.clientTop,
		  left: box.left + window.scrollX - docElem.clientLeft
		};
	},
	getParents(el, selector, until) {
		if (until) {
			if (typeof(until) == 'string') {
				until = [...document.querySelectorAll(until)].filter((elem) => elem.contains(el));
				if (!until.length) return;
				else until = until[0];
			}
			else if (!until.contains(el)) until = document;
		}
		else until = document;
		
		let parents = [];

		while ((el = el.parentNode) && el !== until) {
			if (selector) {
				if (el.matches(selector)) parents.push(el);
				continue;
			}
			parents.push(el);
		}
	
		return parents;
	},
	nextAll(el) {
		const nextElements = []
		let nextElement = el
		
		while(nextElement.nextElementSibling) {
			nextElements.push(nextElement.nextElementSibling)
			nextElement = nextElement.nextElementSibling
		}
		
		return nextElements
	},
	triggerEvent(el, eventType) {
		if (typeof eventType === 'string' && typeof el[eventType] === 'function') {
			el[eventType]();
		} else {
			const event = typeof eventType === 'string' ? new Event(eventType, {bubbles: true}) : eventType;
			el.dispatchEvent(event);
		}
	},
	isObject(value) {
		return (
			typeof value === 'object' &&
			value !== null &&
			!Array.isArray(value)
		);
	},
	isClose(elem, selectors) {
		function checkElem(elem) {
			return typeof(elem) != 'undefined' && elem != null
		}

		if (typeof(selectors) === 'string') {
			return checkElem(elem.closest(selectors));
		}

		let isClose = false;

		// check if node is close to at-least one of the selector
		selectors.forEach(function(node) {
			isClose = checkElem(elem.closest(node));
		});

		return isClose;
	},
	focusRangeOnTab(range, e) {
		let focusableElements = []; 
		range.querySelectorAll('[href], button, input, textarea, select, details, object, [tabindex]:not([tabindex="-1"])')
			.forEach(function(a) {
				if (!a.hasAttribute('disabled') && !a.getAttribute('aria-hidden')) {
					focusableElements.push(a);
				}
			});

		if (focusableElements.length < 1) {
			e.preventDefault();
			return;
		}

		let first = focusableElements[0],
			last = focusableElements[focusableElements.length - 1];

		if (document.activeElement === last && (!e.shiftKey && e.keyCode === 9)) {
			e.preventDefault();
			first.focus();
		}
		else if (document.activeElement === first && (e.shiftKey && e.keyCode === 9)) {
			e.preventDefault();
			last.focus()
		}
	},
	setHighlightRange(el) {
		let range, selection;
	
		if (document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
		else if (window.getSelection) {
			selection = window.getSelection();
			range = document.createRange();
			range.selectNodeContents(el);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	},
}