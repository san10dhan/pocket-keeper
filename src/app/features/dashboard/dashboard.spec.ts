import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { Dashboard } from './dashboard';
import { BelongingsService } from '../../core/belongings/belongings.service';
import { DocumentsService } from '../../core/documents/documents.service';

describe('Dashboard', () => {
  it('renders the dashboard heading', async () => {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: BelongingsService,
          useValue: {
            myItems: () => [],
          },
        },
        {
          provide: DocumentsService,
          useValue: {
            myDocuments: () => [],
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pocket-Keeper Dashboard');
  });

  it('renders empty states when there is no data', async () => {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: BelongingsService,
          useValue: {
            myItems: () => [],
          },
        },
        {
          provide: DocumentsService,
          useValue: {
            myDocuments: () => [],
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No belongings yet.');

    expect(fixture.nativeElement.textContent).toContain('No documents uploaded yet.');
  });
});
