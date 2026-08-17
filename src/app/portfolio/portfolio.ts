import { Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content.service';
import { Project } from '../models';

type ProjectFilterId = 'featured' | 'academy' | 'all';

interface ProjectFilter {
  id: ProjectFilterId;
  label: string;
  types: Project['type'][];
}

const PROJECT_FILTERS: ProjectFilter[] = [
  { id: 'featured', label: 'Featured', types: ['product', 'professional'] },
  { id: 'academy', label: 'Academy projects', types: ['academy'] },
  { id: 'all', label: 'All', types: ['product', 'professional', 'academy'] },
];

const TYPE_LABEL: Record<Project['type'], string> = {
  product: 'Built & maintained',
  professional: 'Client work',
  academy: 'Academy project',
};

const TYPE_ICON: Record<Project['type'], string> = {
  product: 'fa-rocket',
  professional: 'fa-building',
  academy: 'fa-graduation-cap',
};

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  protected readonly data = inject(ContentService);
  protected readonly filters = PROJECT_FILTERS;
  protected readonly activeFilter = signal<ProjectFilterId>('featured');

  protected readonly visibleProjects = computed(() => {
    const projects = this.data.content()?.projects ?? [];
    const types = PROJECT_FILTERS.find((f) => f.id === this.activeFilter())!.types;
    return projects.filter((project) => types.includes(project.type));
  });

  countFor(filter: ProjectFilter): number {
    const projects = this.data.content()?.projects ?? [];
    return projects.filter((project) => filter.types.includes(project.type)).length;
  }

  selectFilter(id: ProjectFilterId): void {
    this.activeFilter.set(id);
  }

  labelFor(project: Project): string {
    return TYPE_LABEL[project.type];
  }

  iconFor(project: Project): string {
    return TYPE_ICON[project.type];
  }
}
