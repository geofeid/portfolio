import { Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content.service';
import { TimelineEntry } from '../models';

type FilterId = 'work' | 'learning' | 'all';

interface TimelineFilter {
  id: FilterId;
  label: string;
  types: TimelineEntry['type'][];
}

const FILTERS: TimelineFilter[] = [
  { id: 'work', label: 'Work experience', types: ['job', 'internship'] },
  { id: 'learning', label: 'Certifications & education', types: ['cert', 'education'] },
  { id: 'all', label: 'Chronologically', types: ['job', 'internship', 'cert', 'education'] },
];

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly data = inject(ContentService);
  protected readonly filters = FILTERS;
  protected readonly activeFilter = signal<FilterId>('work');

  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  /** Newest first, whichever filter is on. */
  protected readonly visibleEntries = computed(() => {
    const timeline = this.data.content()?.timeline ?? [];
    const types = FILTERS.find((f) => f.id === this.activeFilter())!.types;
    return timeline
      .filter((entry) => types.includes(entry.type))
      .sort((a, b) => b.start.localeCompare(a.start));
  });

  countFor(filter: TimelineFilter): number {
    const timeline = this.data.content()?.timeline ?? [];
    return timeline.filter((entry) => filter.types.includes(entry.type)).length;
  }

  selectFilter(id: FilterId): void {
    this.activeFilter.set(id);
  }

  // Keyed by entry, not index, so expansion survives filter changes.
  private keyOf(entry: TimelineEntry): string {
    return `${entry.org}|${entry.title}`;
  }

  isExpanded(entry: TimelineEntry): boolean {
    return this.expanded().has(this.keyOf(entry));
  }

  toggle(entry: TimelineEntry): void {
    const key = this.keyOf(entry);
    this.expanded.update((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
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
