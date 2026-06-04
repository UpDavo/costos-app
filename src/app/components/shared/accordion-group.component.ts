import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-accordion-group',
  template: `<ng-content />`,
})
export class AccordionGroupComponent {
  openIndex = signal<number>(0);

  toggle(index: number) {
    this.openIndex.update((i) => (i === index ? -1 : index));
  }
}
