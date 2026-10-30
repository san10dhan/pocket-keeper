import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  it('does not render an alert when there is no message', () => {
    TestBed.configureTestingModule({
      imports: [ErrorMessage],
    });

    const fixture = TestBed.createComponent(ErrorMessage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('renders the supplied error message', () => {
    TestBed.configureTestingModule({
      imports: [ErrorMessage],
    });

    const fixture = TestBed.createComponent(ErrorMessage);
    fixture.componentRef.setInput('message', 'Upload failed.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Upload failed.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
});
