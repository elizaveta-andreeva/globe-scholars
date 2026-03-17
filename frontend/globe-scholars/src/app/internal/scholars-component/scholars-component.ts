import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {Scholar} from '../../services/scholars/scholar.model';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-scholars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scholars-component.html',
  styleUrl: './scholars-component.scss',
})
export class ScholarsComponent implements OnInit {
  searchQuery = '';
  sortAsc = true;
  currentPage = 1;
  hasNext = false;
  hasPrev = false;

  scholars: Scholar[] = [];
  isLoading = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private scholarsService: ScholarsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.loadScholars();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadScholars();
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  toggleSort() {
    this.sortAsc = !this.sortAsc;
    this.currentPage = 1;
    this.loadScholars();
  }

  getYear(date: Date): number {
    return new Date(date).getFullYear();
  }

  goToProfile(id: number) {
    this.router.navigate(['/scholars', id]);
  }

  prevPage() {
    if (this.hasPrev) {
      this.currentPage--;
      this.loadScholars();
    }
  }

  nextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadScholars();
    }
  }

  get ordering(): string {
    return this.sortAsc ? 'full_name' : '-full_name';
  }

  loadScholars() {
    this.isLoading = true;
    this.error = null;
    this.scholarsService.getScholars(this.currentPage, this.searchQuery, this.ordering).subscribe({
      next: (res) => {
        this.scholars = res.results;
        this.hasNext = !!res.next;
        this.hasPrev = !!res.previous;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load scholars. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredScholars(): Scholar[] {
    return this.scholars;
  }
}
