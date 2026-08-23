import { Injectable, signal } from '@angular/core';
import { PortfolioContent } from './models';

// Content lives in the Online_CV repo and is published at /Online_CV/content.json
// (same origin on geofeid.github.io; proxied to localhost:5500 in dev).
const CONTENT_URL = '/Online_CV/content.json';

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly content = signal<PortfolioContent | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    // Revalidate every load: content changes in the Online_CV repo should show up
    // here without waiting for an HTTP cache to expire.
    fetch(CONTENT_URL, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => this.content.set(data.portfolio))
      .catch((err) => this.error.set(`Could not load content: ${err.message}`));
  }

  downloadVCard(): void {
    const v = this.content()?.contact.vcard;
    if (!v) return;
    const [d, m, y] = v.bday.split('/');
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${v.name}`,
      `ORG:${v.org}`,
      `TITLE:${v.title}`,
      `TEL;TYPE=CELL:${v.phone}`,
      `EMAIL:${v.email}`,
      `BDAY:${y}${m}${d}`,
      `URL:${v.url}`,
      'END:VCARD',
    ].join('\r\n');
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${v.name.replaceAll(' ', '_')}.vcf`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
