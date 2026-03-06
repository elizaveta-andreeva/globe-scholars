import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Scholar } from '../../services/scholars/scholar.model';
import { ScholarsService } from '../../services/scholars/scholars-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-repository-component',
  imports: [DatePipe],
  templateUrl: './repository-component.html',
  styleUrl: './repository-component.scss',
})
export class RepositoryComponent implements OnInit {
  constructor(
    private scholarsService: ScholarsService,
    private cdr: ChangeDetectorRef
  ){}
  filteredFiles = [
    {id: 1, title: "Understanding AI", author: "Jon Doe"},
    {id: 2, title: "Understanding AI", author: "Jon Doe"},
    {id: 3, title: "Understanding AI", author: "Jon Doe"},
    {id: 4, title: "Understanding AI", author: "Jon Doe"},
  ]

  buttons = [
    {id: 'last-year', text: 'Last Year' },
    {id: 'last-5-years', text: 'Last 5 Years' },
    {id: 'last-10-years', text: 'Last 10 Years' },
    {id: 'all-time', text: 'All Time' },
  ]

  scholars: Scholar[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.getScholars();
  }

  getScholars() {
    this.scholarsService.getScholars().subscribe({
      next: (data: Scholar[]) => {
        this.scholars = data.slice(0, 4);
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
}
