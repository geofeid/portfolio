import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content.service';
import { Project } from '../models';
import { Reveal } from '../reveal.directive';

const TYPE_LABEL: Record<Project['type'], string> = {
  corporate: 'Corporate project',
  personal: 'Built & maintained',
  academy: 'Academy project',
};

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Reveal],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail {
  /** Bound from the :slug route parameter. */
  readonly slug = input<string>('');

  protected readonly data = inject(ContentService);
  protected readonly activeSection = signal('');

  protected readonly project = computed(() =>
    this.data.content()?.projects.find((p) => p.slug === this.slug())
  );

  /** Section links for the sticky rail, built from what this case study actually has. */
  protected readonly sections = computed(() => {
    const cs = this.project()?.caseStudy;
    if (!cs) return [];
    return [
      { id: 'context', label: 'Context' },
      { id: 'goal', label: 'Goal' },
      ...(cs.challenges?.length ? [{ id: 'challenges', label: 'Challenges' }] : []),
      { id: 'approach', label: 'Approach' },
      ...(cs.results.length ? [{ id: 'results', label: 'Results' }] : []),
      { id: 'stack', label: 'Stack' },
    ];
  });

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

  scrollTo(id: string): void {
    const target = document.getElementById(id);
    if (!target) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    this.activeSection.set(id);
  }
}
