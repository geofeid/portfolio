import { Component, inject, signal } from '@angular/core';
import { ContentService } from '../content.service';
import { TimelineEntry } from '../models';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly data = inject(ContentService);
  private readonly expanded = signal<ReadonlySet<number>>(new Set());

  isExpanded(index: number): boolean {
    return this.expanded().has(index);
  }

  toggle(index: number): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  detailCount(entry: TimelineEntry): number {
    return entry.sections.reduce((total, section) => total + section.items.length, 0);
  }

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
