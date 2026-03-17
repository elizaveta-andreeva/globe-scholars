import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RepositoryService} from '../../services/repository/repository-service';
import {WorkSummary} from '../../services/repository/work.model';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {Scholar} from '../../services/scholars/scholar.model';
import {AuthService} from '../../services/auth/auth-service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {BoldSearchTermPipe} from './bold-search-term.pipe';
import {ModalComponent} from '../../shared/modal-component/modal-component';

@Component({
  selector: 'app-repository-component',
  imports: [CommonModule, DatePipe, RouterLink, FormsModule, BoldSearchTermPipe, ModalComponent],
  templateUrl: './repository-component.html',
  styleUrl: './repository-component.scss',
})
export class RepositoryComponent implements OnInit {
  works: WorkSummary[] = [];
  scholars: Scholar[] = [];
  isLoading = true;
  error: string | null = null;
  showLoginModal = false;
  currentPage = 1;
  hasNext = false;
  hasPrev = false;

  authorFilterId: number | null = null;

  scholarPage = 1;
  scholarHasNext = false;
  scholarHasPrev = false;

  buttons = [
    {id: 'last-year', text: 'Last Year'},
    {id: 'last-5-years', text: 'Last 5 Years'},
    {id: 'last-10-years', text: 'Last 10 Years'},
    {id: 'all-time', text: 'All Time'},
  ];

  activeFilter = 'all-time';
  authorFilter = '';
  searchQuery = '';

  constructor(
    private repositoryService: RepositoryService,
    private scholarsService: ScholarsService,
    protected authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.loadWorks(this.currentPage);
    this.loadScholars();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadWorks(this.currentPage);
  }

  loadScholars(page: number = 1) {
    this.scholarsService.getScholars(page).subscribe({
      next: (res) => {
        this.scholars = res.results;
        this.scholarHasNext = !!res.next;
        this.scholarHasPrev = !!res.previous;
        this.scholarPage = page;
      },
      error: () => {
      }
    });
  }

  nextScholarPage() {
    if (this.scholarHasNext) {
      this.loadScholars(this.scholarPage + 1);
    }
  }

  prevScholarPage() {
    if (this.scholarHasPrev) {
      this.loadScholars(this.scholarPage - 1);
    }
  }

  downloadWork(work: WorkSummary) {
    this.repositoryService.downloadWork(work.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = work.title;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Download failed. Please try again.')
    });
  }

  openWork(workId: number) {
    if (!this.authService.isLoggedIn) {
      this.showLoginModal = true;
      return;
    }
    this.router.navigate(['/repository', workId]);
  }

  get filteredWorks(): WorkSummary[] {
    const now = new Date().getFullYear();
    return this.works
      .filter(work => {
        const matchesYear = (() => {
          switch (this.activeFilter) {
            case 'last-year':
              return work.publication_year >= now - 1;
            case 'last-5-years':
              return work.publication_year >= now - 5;
            case 'last-10-years':
              return work.publication_year >= now - 10;
            default:
              return true;
          }
        })();
        return matchesYear;
      })
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }

  setFilter(id: string) {
    this.activeFilter = id;
  }

  setAuthorFilter(id: number) {
    this.authorFilterId = id;
    this.currentPage = 1;
    this.loadWorks(1);
  }

  resetAuthorFilter() {
    this.authorFilterId = null;
    this.currentPage = 1;
    this.loadWorks(1);
  }

  loadWorks(page: number) {
    this.isLoading = true;
    this.repositoryService.getWorks(page, this.searchQuery, this.authorFilterId ?? undefined).subscribe({
      next: (res) => {
        this.works = res.results;
        this.hasNext = !!res.next;
        this.hasPrev = !!res.previous;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load works.';
        this.isLoading = false;
      }
    });
  }

  prevPage() {
    if (this.hasPrev) {
      this.currentPage--;
      this.loadWorks(this.currentPage);
    }
  }

  nextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadWorks(this.currentPage);
    }
  }
}
