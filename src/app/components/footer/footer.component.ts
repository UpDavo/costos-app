import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly version = '1.0.0';
  readonly aboutItems = [
    'Herramienta 100% gratuita',
    'Datos de referencia 2026',
  ];
}
