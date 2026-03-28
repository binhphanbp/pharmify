import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FlashSaleService,
  FlashSaleItem,
} from '../../../core/services/flash-sale.service';

interface SlotTab {
  id: string;
  label: string;
  timeRange: string;
  status: 'active' | 'upcoming' | 'ended';
  endTime: Date;
}

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './flash-sale.component.html',
  styleUrls: ['./flash-sale.component.scss'],
})
export class FlashSaleComponent implements OnInit, OnDestroy {
  private timerInterval: any;

  allItems = signal<FlashSaleItem[]>([]);
  loading = signal(true);
  selectedSlotId = signal<string | null>(null);
  selectedCategoryId = signal<string | null>(null);

  // Countdown state
  countdownHours = signal('00');
  countdownMinutes = signal('00');
  countdownSeconds = signal('00');

  // Derived: time slot tabs
  slotTabs = computed<SlotTab[]>(() => {
    const items = this.allItems();
    const map = new Map<string, SlotTab>();
    for (const item of items) {
      if (!map.has(item.time_slot_id)) {
        const start = new Date(item.start_time);
        const end = new Date(item.end_time);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timeRange = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}, ${item.slot_label}`;
        map.set(item.time_slot_id, {
          id: item.time_slot_id,
          label: item.slot_label,
          timeRange,
          status: item.slot_status,
          endTime: end,
        });
      }
    }
    return Array.from(map.values());
  });

  // Derived: category filter pills for selected slot
  categories = computed(() => {
    const slotId = this.selectedSlotId();
    const items = this.allItems().filter((i) => i.time_slot_id === slotId);
    const map = new Map<string, { id: string; name: string }>();
    for (const item of items) {
      if (!map.has(item.category_id)) {
        map.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
        });
      }
    }
    return Array.from(map.values());
  });

  // Derived: filtered products for display
  filteredItems = computed(() => {
    const slotId = this.selectedSlotId();
    const catId = this.selectedCategoryId();
    let items = this.allItems().filter((i) => i.time_slot_id === slotId);
    if (catId) {
      items = items.filter((i) => i.category_id === catId);
    }
    return items;
  });

  // Current active slot's end time for countdown
  activeSlotEnd = computed<Date | null>(() => {
    const tabs = this.slotTabs();
    const activeTab = tabs.find((t) => t.status === 'active');
    return activeTab ? activeTab.endTime : null;
  });

  // Campaign banner
  campaignBanner = computed(() => {
    const items = this.allItems();
    return items.length > 0 ? items[0].campaign_banner : null;
  });

  constructor(private flashSaleService: FlashSaleService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  async loadData() {
    this.loading.set(true);
    const items = await this.flashSaleService.getActiveFlashSale();
    this.allItems.set(items);

    // Auto-select the active slot (or first available)
    const tabs = this.slotTabs();
    const active = tabs.find((t) => t.status === 'active') || tabs[0];
    if (active) {
      this.selectedSlotId.set(active.id);
    }

    this.loading.set(false);
    this.startCountdown();
  }

  selectSlot(slotId: string) {
    this.selectedSlotId.set(slotId);
    this.selectedCategoryId.set(null); // reset category filter
  }

  selectCategory(catId: string | null) {
    this.selectedCategoryId.set(catId);
  }

  getSlotStatus(tab: SlotTab): string {
    return tab.status === 'active' ? 'Đang diễn ra' : 'Sắp diễn ra';
  }

  getSoldPercent(item: FlashSaleItem): number {
    if (item.stock_limit <= 0) return 0;
    return Math.round((item.sold_count / item.stock_limit) * 100);
  }

  scrollCarousel(el: HTMLElement, dir: 'left' | 'right') {
    const scrollAmount = 240;
    el.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  private startCountdown() {
    this.updateCountdown();
    this.timerInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const endTime = this.activeSlotEnd();
    if (!endTime) {
      this.countdownHours.set('00');
      this.countdownMinutes.set('00');
      this.countdownSeconds.set('00');
      return;
    }

    const now = new Date().getTime();
    const diff = endTime.getTime() - now;

    if (diff <= 0) {
      this.countdownHours.set('00');
      this.countdownMinutes.set('00');
      this.countdownSeconds.set('00');
      if (this.timerInterval) clearInterval(this.timerInterval);
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    this.countdownHours.set(h.toString().padStart(2, '0'));
    this.countdownMinutes.set(m.toString().padStart(2, '0'));
    this.countdownSeconds.set(s.toString().padStart(2, '0'));
  }
}
