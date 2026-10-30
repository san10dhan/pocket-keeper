import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BelongingsService } from '../../core/belongings/belongings.service';
import { DocumentsService } from '../../core/documents/documents.service';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, FileSizePipe, EmptyState],
  template: `
    <main class="dashboard">
      <header class="welcome">
        <p class="eyebrow">YOUR PERSONAL INVENTORY</p>
        <h1>Pocket-Keeper Dashboard</h1>
        <p>Keep track of your belongings, important documents, and invoices.</p>
      </header>

      <section class="stats" aria-label="Inventory statistics">
        <article class="stat-card">
          <span class="stat-icon" aria-hidden="true">▣</span>
          <div>
            <p>Total belongings</p>
            <strong>{{ totalBelongings() }}</strong>
          </div>
          <a routerLink="/belongings">View belongings</a>
        </article>

        <article class="stat-card">
          <span class="stat-icon" aria-hidden="true">▤</span>
          <div>
            <p>Saved documents</p>
            <strong>{{ totalDocuments() }}</strong>
          </div>
          <a routerLink="/documents">View documents</a>
        </article>

        <article class="stat-card">
          <span class="stat-icon" aria-hidden="true">⌖</span>
          <div>
            <p>Tracked locations</p>
            <strong>{{ totalLocations() }}</strong>
          </div>
          <span class="stat-caption">Unique locations</span>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header class="panel-header">
            <div>
              <h2>Recently added belongings</h2>
              <p>Your latest inventory items</p>
            </div>

            <a routerLink="/belongings">View all</a>
          </header>

          @if (recentBelongings().length > 0) {
            <ul class="recent-list">
              @for (item of recentBelongings(); track item.id) {
                <li>
                  <div class="item-icon" aria-hidden="true">▣</div>

                  <div class="item-info">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.location }}</span>
                  </div>

                  <span class="badge">{{ item.category }}</span>
                </li>
              }
            </ul>
          } @else {
            <app-empty-state
              title="No belongings yet"
              description="Add your first item to start tracking your inventory."
              icon="▣"
            >
              <a routerLink="/belongings">Add your first belonging</a>
            </app-empty-state>
          }
        </article>

        <article class="panel">
          <header class="panel-header">
            <div>
              <h2>Recent documents</h2>
              <p>Your latest invoices and receipts</p>
            </div>

            <a routerLink="/documents">View all</a>
          </header>

          @if (recentDocuments().length > 0) {
            <ul class="recent-list">
              @for (document of recentDocuments(); track document.id) {
                <li>
                  <div class="item-icon" aria-hidden="true">▤</div>

                  <div class="item-info">
                    <strong>{{ document.name }}</strong>
                    <span>
                      {{ document.uploadedAt | date: 'mediumDate' }}
                      · {{ document.size | fileSize }}
                    </span>
                  </div>

                  <span class="badge">{{ document.category }}</span>
                </li>
              }
            </ul>
          } @else {
            <div class="empty-state">
              <p>No documents uploaded yet.</p>
              <a routerLink="/documents">Add your first document</a>
            </div>
          }
        </article>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .dashboard {
      max-width: 1150px;
      margin: 0 auto;
    }

    .welcome {
      margin-bottom: 28px;
    }

    .eyebrow {
      color: #315c45;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    h1 {
      margin: 12px 0;
      color: #20382a;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
    }

    .welcome > p:last-child,
    .panel-header p {
      color: #68746b;
      line-height: 1.7;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border: 1px solid #e0e8e1;
      border-radius: 14px;
      background: white;
    }

    .stat-icon,
    .item-icon {
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      border-radius: 10px;
      background: #eaf2ec;
      color: #315c45;
      font-size: 1.2rem;
    }

    .stat-card p {
      margin: 0 0 6px;
      color: #68746b;
      font-size: 0.85rem;
    }

    .stat-card strong {
      color: #20382a;
      font-size: 1.8rem;
    }

    .stat-card a,
    .stat-caption {
      grid-column: 1 / -1;
      color: #315c45;
      font-size: 0.85rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    .panel {
      min-width: 0;
      padding: 22px;
      border: 1px solid #e0e8e1;
      border-radius: 14px;
      background: white;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 18px;
    }

    .panel-header h2 {
      margin: 0;
      color: #20382a;
      font-size: 1.05rem;
    }

    .panel-header p {
      margin-bottom: 0;
      font-size: 0.85rem;
    }

    .panel-header a,
    .empty-state a {
      color: #315c45;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .recent-list {
      display: grid;
      gap: 14px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .recent-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .item-info {
      display: grid;
      flex: 1;
      min-width: 0;
      gap: 5px;
    }

    .item-info strong {
      overflow-wrap: anywhere;
      color: #20382a;
      font-size: 0.9rem;
    }

    .item-info span {
      color: #68746b;
      font-size: 0.8rem;
    }

    .badge {
      padding: 5px 8px;
      border-radius: 20px;
      background: #eaf2ec;
      color: #315c45;
      font-size: 0.7rem;
      white-space: nowrap;
    }

    .empty-state {
      padding: 24px 0;
      color: #68746b;
      text-align: center;
    }

    @media (max-width: 800px) {
      .stats {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 440px) {
      .panel {
        padding: 16px;
      }

      .badge {
        white-space: normal;
        text-align: center;
      }
    }
  `,
})
export class Dashboard {
  private readonly belongingsService = inject(BelongingsService);
  private readonly documentsService = inject(DocumentsService);

  protected readonly totalBelongings = computed(() => this.belongingsService.myItems().length);

  protected readonly totalDocuments = computed(() => this.documentsService.myDocuments().length);

  protected readonly totalLocations = computed(() => {
    const locations = this.belongingsService
      .myItems()
      .map((item) => item.location.trim().toLowerCase())
      .filter(Boolean);

    return new Set(locations).size;
  });

  protected readonly recentBelongings = computed(() =>
    [...this.belongingsService.myItems()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  );

  protected readonly recentDocuments = computed(() =>
    [...this.documentsService.myDocuments()]
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
      .slice(0, 5),
  );
}
