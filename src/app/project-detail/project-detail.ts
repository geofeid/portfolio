import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content.service';
import { Project } from '../models';

const TYPE_LABEL: Record<Project['type'], string> = {
  corporate: 'Corporate project',
  personal: 'Built & maintained',
  academy: 'Academy project',
};

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail {
  /** Bound from the :slug route parameter. */
  readonly slug = input<string>('');

  protected readonly data = inject(ContentService);

  protected readonly project = computed(() =>
    this.data.content()?.projects.find((p) => p.slug === this.slug())
  );

  /** Other work at the same employer, so a reader can keep going. */
  protected readonly related = computed(() => {
    const current = this.project();
    if (!current) return [];
    return (this.data.content()?.projects ?? []).filter(
      (p) => p.slug && p.slug !== current.slug && p.org === current.org && p.org
    );
  });

  labelFor(project: Project): string {
    return TYPE_LABEL[project.type];
  }
}
