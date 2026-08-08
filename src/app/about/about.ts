import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';
import { TimelineEntry } from '../models';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly data = inject(ContentService);

  iconFor(entry: TimelineEntry): string {
    switch (entry.type) {
      case 'job':
        return 'fa-briefcase';
      case 'internship':
        return 'fa-tools';
      case 'education':
        return 'fa-user-graduate';
      default:
        return 'fa-certificate';
    }
  }
}
