import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content.service';
import { Project } from '../models';

type ProjectFilterId = 'corporate' | 'personal' | 'academy' | 'all';

interface ProjectFilter {
  id: ProjectFilterId;
  label: string;
  types: Project['type'][];
}

const PROJECT_FILTERS: ProjectFilter[] = [
  { id: 'corporate', label: 'Corporate', types: ['corporate'] },
  { id: 'personal', label: 'Personal', types: ['personal'] },
  { id: 'academy', label: 'Academy', types: ['academy'] },
  { id: 'all', label: 'All', types: ['corporate', 'personal', 'academy'] },
];

const TYPE_LABEL: Record<Project['type'], string> = {
  corporate: 'Corporate project',
  personal: 'Built & maintained',
  academy: 'Academy project',
};

const TYPE_ICON: Record<Project['type'], string> = {
  corporate: 'fa-building',
  personal: 'fa-rocket',
  academy: 'fa-graduation-cap',
};

@Component({
  selector: 'app-portfolio',
  imports: [RouterLink],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  protected readonly data = inject(ContentService);
  protected readonly filters = PROJECT_FILTERS;
  protected readonly activeFilter = signal<ProjectFilterId>('corporate');

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
