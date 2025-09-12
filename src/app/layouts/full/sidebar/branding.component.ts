import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <div class="branding d-none d-lg-flex align-items-center">
      <a href="/" class="d-flex">
        <img
          src="./assets/images/logos/bot-logo-3.png"
          class="align-middle m-2"
          alt="HR Chatbot Connect" height="50"
        />
      </a>
    </div>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
