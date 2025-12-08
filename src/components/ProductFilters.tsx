import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  search: string;
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSizes: string[];
  availableColors: string[];
  maxPrice: number;
}

const ProductFilters = ({
  filters,
  onFiltersChange,
  availableSizes,
  availableColors,
  maxPrice,
}: ProductFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    updateFilter('sizes', newSizes);
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    updateFilter('colors', newColors);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priceRange: [0, maxPrice],
      sizes: [],
      colors: [],
      sortBy: 'newest',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  return (
    <div className="space-y-6 mb-12 fade-in">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <div className="flex gap-3">
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-[180px] bg-background border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-charcoal text-cream' : ''}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-stone/30 border border-border animate-fade-in">
          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Price Range</h4>
            <Slider
              value={filters.priceRange}
              min={0}
              max={maxPrice}
              step={10}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              className="mt-6"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs tracking-wide border transition-colors ${
                      filters.sizes.includes(size)
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-background border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`px-3 py-1.5 text-xs tracking-wide border transition-colors ${
                      filters.colors.includes(color)
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-background border-border hover:border-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-stone border border-border">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilter('search', '')}
              />
            </span>
          )}
          {filters.sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-stone border border-border"
            >
              {size}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => toggleSize(size)}
              />
            </span>
          ))}
          {filters.colors.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-stone border border-border"
            >
              {color}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => toggleColor(color)}
              />
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
