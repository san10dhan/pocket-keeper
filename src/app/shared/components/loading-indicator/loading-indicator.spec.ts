import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LoadingIndicator } from './loading-indicator';

describe('LoadingIndicator', () => {
  it('shows the default loading label', () => {
    TestBed.configureTestingModule({
      imports: [LoadingIndicator],
    });

    const fixture = TestBed.createComponent(LoadingIndicator);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });

  it('supports a custom label', () => {
    TestBed.configureTestingModule({
      imports: [LoadingIndicator],
    });

    const fixture = TestBed.createComponent(LoadingIndicator);

    fixture.componentRef.setInput('label', 'Loading invoices...');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading invoices...');
  });
  it('exposes an accessible status role', () => {
    TestBed.configureTestingModule({
      imports: [LoadingIndicator],
    });

    const fixture = TestBed.createComponent(LoadingIndicator);
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('[role="status"]');

    expect(status).not.toBeNull();
    expect(status.getAttribute('aria-label')).toBe('Loading...');
  });
});
