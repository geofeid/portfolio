import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Reveals an element the first time it scrolls into view.
 * Adds `.is-revealed`; the animation itself lives in CSS, so this costs no runtime
 * animation library. Honours prefers-reduced-motion by revealing immediately.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class Reveal implements OnInit, OnDestroy {
  /** Stagger position within a group; drives the CSS delay. Accepts a bound number
   *  or a static attribute string, so `appReveal="2"` and `[appReveal]="i"` both work. */
  readonly appReveal = input<number | string>('');

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.host.nativeElement as HTMLElement;
    // Only now is it safe for CSS to hide un-revealed elements.
    document.documentElement.classList.add('js-reveal');

    const index = Number(this.appReveal());
    if (this.appReveal() !== '' && !Number.isNaN(index)) {
      element.style.setProperty('--reveal-index', String(index));
    }

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      element.classList.add('is-revealed');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          this.observer?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
