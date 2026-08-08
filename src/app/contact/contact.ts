import { Component, inject, signal } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly data = inject(ContentService);
  protected readonly showQr = signal(false);

  addToContacts(): void {
    // ponytail: mobile gets the .vcf download, desktop toggles the QR image
    const isMobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
    if (isMobile) {
      this.data.downloadVCard();
    } else {
      this.showQr.update((v) => !v);
    }
  }
}
