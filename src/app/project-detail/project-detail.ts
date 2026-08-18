import { Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content.service';
import { Project, Skill } from '../models';
import { Reveal } from '../reveal.directive';

const TYPE_LABEL: Record<Project['type'], string> = {
  corporate: 'Corporate project',
  freelance: 'Freelance client',
  personal: 'Built & maintained',
  academy: 'Academy project',
};

/** Buckets a stack entry into a discipline, for the donut. */
const STACK_GROUPS: { label: string; match: RegExp }[] = [
  // Checked in order: tooling first, so "node:test" and "Headless Chrome" do not
  // get claimed by the backend or frontend patterns.
  { label: 'DevOps', match: /jenkins|docker|kubernetes|github action|github pages|azure|ci\/cd|bash|shell|pipeline|headless chrome|node:test|npm/i },
  { label: 'Backend', match: /\.net|\bbff\b|asp\.net|entity framework|\bsql\b|c#|rest|\bapi|node\.js|express|php|laravel|mongo/i },
  { label: 'Frontend', match: /angular|typescript|javascript|rxjs|signal|ngrx|redux|axios|\bscss\b|\bless\b|css|html|bootstrap|primeng|material|tailwind|react|jquery|flexbox|grid|vite/i },
  { label: 'Design', match: /figma|sketch|adobe/i },
];

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

  /** Stack composition by discipline — a count of what the project actually used. */
  protected readonly stackMix = computed(() => {
    const tech = this.project()?.tech ?? [];
    if (tech.length < 2) return [];
    const counts = new Map<string, number>();
    for (const entry of tech) {
      const group = STACK_GROUPS.find((g) => g.match.test(entry))?.label ?? 'Other';
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    const total = tech.length;
    let offset = 0;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], index) => {
        const share = (count / total) * 100;
        const segment = { label, count, share, offset: 100 - offset + 25, tint: index };
        offset += share;
        return segment;
      });
  });

  /** "8-10 people" -> ten markers, the last two outlined to show it is a range. */
  protected readonly teamMarkers = computed(() => {
    const team = this.project()?.caseStudy?.facts?.team ?? '';
    const numbers = team.match(/\d+/g)?.map(Number) ?? [];
    // "Solo" carries no digits but is still a team size worth drawing.
    if (!numbers.length) return /solo/i.test(team)
      ? { solid: [0], outlined: [], extra: 0, label: team }
      : null;
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

  /** Somewhere to go next: same employer, or failing that, same kind of project. */
  protected readonly related = computed(() => {
    const current = this.project();
    if (!current) return [];
    const others = (this.data.content()?.projects ?? []).filter(
      (p) => p.slug && p.slug !== current.slug
    );
    const sameOrg = current.org ? others.filter((p) => p.org === current.org) : [];
    return sameOrg.length ? sameOrg : others.filter((p) => p.type === current.type).slice(0, 3);
  });

  protected readonly relatedHeading = computed(() => {
    const current = this.project();
    if (!current) return '';
    const sameOrg = (this.data.content()?.projects ?? []).some(
      (p) => p.slug && p.slug !== current.slug && p.org && p.org === current.org
    );
    return sameOrg ? `More from ${current.org}` : 'More projects';
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
