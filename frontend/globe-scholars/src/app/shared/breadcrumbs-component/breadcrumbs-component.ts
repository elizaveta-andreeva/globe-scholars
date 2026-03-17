import {Component, OnDestroy, signal, WritableSignal} from '@angular/core';
import {filter, Subscription} from 'rxjs';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/auth-service';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {RepositoryService} from '../../services/repository/repository-service';

@Component({
  selector: 'app-breadcrumbs-component',
  imports: [
    RouterLink
  ],
  templateUrl: './breadcrumbs-component.html',
  styleUrl: './breadcrumbs-component.scss',
})
export class BreadcrumbsComponent implements OnDestroy {
  public readonly pathParts: WritableSignal<Array<{ path: string, label: string }>> = signal([]);
  private subs: Array<Subscription> = [];

  private hiddenRoutes = ['login', 'register', ''];

  constructor(
    private router: Router,
    protected authService: AuthService,
    private scholarsService: ScholarsService,
    private repositoryService: RepositoryService,
  ) {
    this.subs.push(this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const parts = event.urlAfterRedirects
        .split('/')
        .filter(p => p.length > 0);

      if (parts.length === 0 || this.hiddenRoutes.includes(parts[0])) {
        this.pathParts.update(() => []);
        return;
      }

      const breadcrumbs: Array<{ path: string, label: string }> = [{ path: '/', label: 'Home' }];
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath += `/${part}`;
        const isId = /^\d+$/.test(part);

        if (isId) {
          const prevPart = parts[i - 1];
          breadcrumbs.push({ path: currentPath, label: '...' });
          const index = breadcrumbs.length - 1;

          if (prevPart === 'scholars') {
            this.scholarsService.getScholarById(Number(part)).subscribe({
              next: (scholar) => {
                this.pathParts.update(parts => {
                  const updated = [...parts];
                  updated[index] = { ...updated[index], label: scholar.fullName };
                  return updated;
                });
              }
            });
          } else if (prevPart === 'repository') {
            this.repositoryService.getWorkDetail(Number(part)).subscribe({
              next: (work) => {
                this.pathParts.update(parts => {
                  const updated = [...parts];
                  updated[index] = { ...updated[index], label: work.title };
                  return updated;
                });
              }
            });
          }
        } else {
          breadcrumbs.push({
            path: currentPath,
            label: part.charAt(0).toUpperCase() + part.slice(1)
          });
        }
      }

      this.pathParts.update(() => breadcrumbs);
    }));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
  }
}
