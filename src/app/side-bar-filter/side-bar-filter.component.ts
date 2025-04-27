import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-side-bar-filter',
  templateUrl: './side-bar-filter.component.html',
  styleUrl: './side-bar-filter.component.css'
})
export class SideBarFilterComponent {
  @Output() filterChanged = new EventEmitter<any>();

  // Filter criteria
  categories: string[] = ['Options culinaire', 'Service de divertissement', 'Soins personnels', 'Décoration', 'Matériel', 'Mariage', 'Services VIP'];                                            
  types: string[] = ['Achat', 'Location'];
  selectedCategories: Set<string> = new Set();
  selectedType: string = '';

  // Handle category selection
  onCategoryChange(category: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    
    if (isChecked) {
      this.selectedCategories.add(category);
    } else {
      this.selectedCategories.delete(category);
    }
    this.emitFilters();
  }

  // Emit selected filters to parent
  emitFilters() {
    this.filterChanged.emit({
      categories: Array.from(this.selectedCategories),
      type: this.selectedType
    });
  }
}
