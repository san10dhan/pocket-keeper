import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <app-empty-state
      title="No documents"
      description="Upload your first document."
    >
      <button type="button">Upload document</button>
    </app-empty-state>
  `,
})
class TestHost {}

describe('EmptyState', () => {
  it('renders its title and description', () => {
    TestBed.configureTestingModule({
      imports: [TestHost],
    });

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No documents');
    expect(fixture.nativeElement.textContent).toContain(
      'Upload your first document.',
    );
  });

  it('renders projected content', () => {
    TestBed.configureTestingModule({
      imports: [TestHost],
    });

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');

    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Upload document');
  });
});
