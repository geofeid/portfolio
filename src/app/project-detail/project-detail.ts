import { Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content.service';
import { Project, Skill } from '../models';
import { Reveal } from '../reveal.directive';

const TYPE_LABEL: Record<Project['type'], string> = {
  corporate: 'Corporate project',
  personal: 'Built & maintained',
  academy: 'Academy project',
};

/** Loose match between a project's stack entry and a rated skill ("Angular 18" -> "Angular 2+"). */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchSkill(tech: string, skills: Skill[]): Skill | undefined {
  const target = normalise(tech);
  return skills.find((skill) => {
    const name = normalise(skill.name);
    if (name === target) return true;
    // "angular18" / "angularsignals" / "angularmaterial" all count as Angular
    if (target.startsWith('angular') && name.startsWith('angular')) return true;
    return name.includes(target) || target.includes(name);
  });
}

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
  protected readonly readingProgress = signal(0);

  protected readonly project = computed(() =>
    this.data.content()?.projects.find((p) => p.slug === this.slug())
  );

  /** Rated skills this project actually used — real percentages, no invented data. */
  protected readonly appliedSkills = computed(() => {
    const p = this.project();
    const skills = this.data.content()?.skills ?? [];
    if (!p) return [];
    const seen = new Set<string>();
    return p.tech
      .map((tech) => matchSkill(tech, skills))
      .filter((skill): skill is Skill => {
        if (!skill || seen.has(skill.name)) return false;
        seen.add(skill.name);
        return true;
      })
      .sort((a, b) => parseInt(b.percent) - parseInt(a.percent));
  });

  /** "8-10 people" -> ten markers, the last two outlined to show it is a range. */
  protected readonly teamMarkers = computed(() => {
    const team = this.project()?.caseStudy?.facts?.team ?? '';
    const numbers = team.match(/\d+/g)?.map(Number) ?? [];
    if (!numbers.length) return null;
    const min = numbers[0];
    const max = numbers[1] ?? numbers[0];
    const capped = Math.min(max, 12);
    return {
      solid: Array.from({ length: Math.min(min, capped) }, (_, i) => i),
      outlined: Array.from({ length: Math.max(capped - min, 0) }, (_, i) => i),
      extra: max > capped ? max - capped : 0,
      label: team,
    };
  });

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
      ...(this.appliedSkills().length ? [{ id: 'skills', label: 'Skills' }] : []),
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

  @HostListener('window:scroll')
  onScroll(): void {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    this.readingProgress.set(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0);
    this.trackActiveSection();
  }

  private trackActiveSection(): void {
    let current = '';
    for (const section of this.sections()) {
      const element = document.getElementById(section.id);
      if (element && element.getBoundingClientRect().top <= 140) current = section.id;
    }
    if (current) this.activeSection.set(current);
  }

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
