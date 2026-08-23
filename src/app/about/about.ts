import { Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content.service';
import { Skill, TimelineEntry } from '../models';

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

type SkillFilterId = Skill['category'] | 'all';

interface SkillFilter {
  id: SkillFilterId;
  label: string;
  categories: Skill['category'][];
}

const SKILL_FILTERS: SkillFilter[] = [
  { id: 'frontend', label: 'Front end', categories: ['frontend'] },
  { id: 'backend', label: 'Back end', categories: ['backend'] },
  { id: 'devops', label: 'DevOps', categories: ['devops'] },
  { id: 'cms', label: 'CMS', categories: ['cms'] },
  { id: 'ai', label: 'AI', categories: ['ai'] },
  { id: 'all', label: 'All', categories: ['frontend', 'backend', 'devops', 'cms', 'ai'] },
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

  protected readonly skillFilters = SKILL_FILTERS;
  protected readonly activeSkillFilter = signal<SkillFilterId>('frontend');

  /** Strongest first within the selected category. */
  protected readonly visibleSkills = computed(() => {
    const skills = this.data.content()?.skills ?? [];
    const categories = SKILL_FILTERS.find((f) => f.id === this.activeSkillFilter())!.categories;
    return skills.filter((skill) => categories.includes(skill.category));
  });

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

  skillCountFor(filter: SkillFilter): number {
    const skills = this.data.content()?.skills ?? [];
    return skills.filter((skill) => filter.categories.includes(skill.category)).length;
  }

  selectSkillFilter(id: SkillFilterId): void {
    this.activeSkillFilter.set(id);
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
