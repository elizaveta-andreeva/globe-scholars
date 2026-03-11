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

@Component({
  selector: 'app-repository-component',
  imports: [CommonModule, DatePipe, RouterLink, FormsModule, BoldSearchTermPipe],
  templateUrl: './repository-component.html',
  styleUrl: './repository-component.scss',
})
export class RepositoryComponent implements OnInit {
  works: WorkSummary[] = [];
  scholars: Scholar[] = [];
  isLoading = true;
  error: string | null = null;
  showLoginModal = false;

  buttons = [
    {id: 'last-year', text: 'Last Year'},
    {id: 'last-5-years', text: 'Last 5 Years'},
    {id: 'last-10-years', text: 'Last 10 Years'},
    {id: 'all-time', text: 'All Time'},
  ];

  constructor(
    private repositoryService: RepositoryService,
    private scholarsService: ScholarsService,
    protected authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.loadWorks();
    this.loadScholars();
  }

  loadWorks() {
    this.isLoading = true;
    this.repositoryService.getWorks().subscribe({
      next: (data) => {
        this.works = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load works.';
        this.isLoading = false;
      }
    });
  }

  loadScholars() {
    this.scholarsService.getScholars().subscribe({
      next: (data) => {
        this.scholars = data.slice(0, 4);
      },
      error: () => {
      }
    });
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
    this.router.navigate(['/home/repository', workId]);
  }

  activeFilter = 'all-time';
  authorFilter = '';

  searchQuery = '';

  get filteredWorks(): WorkSummary[] {
    const now = new Date().getFullYear();
    return this.works
      .filter(work => {
        const matchesSearch = !this.searchQuery ||
          work.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          work.authors.toLowerCase().includes(this.searchQuery.toLowerCase());

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

        const matchesAuthor = (() => {
          if (this.authorFilter) {
            return work.authors.toLowerCase().includes(this.authorFilter.toLowerCase());
          }
          return true;
        })();

        return matchesSearch && matchesYear && matchesAuthor;
      })
      // RS6 - default sorting by upload date
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }

  setFilter(id: string) {
    this.activeFilter = id;
  }

  setAuthorFilter(id: number) {
    this.scholarsService.getScholarById(id).subscribe({
      next: (scholar) => {
        this.authorFilter = scholar.fullName;
      }
    });
  }

  resetAuthorFilter() {
    this.authorFilter = '';
  }
}
