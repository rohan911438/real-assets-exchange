import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AssetCard } from '@/components/AssetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { mockAssets, RWAAsset } from '@/data/mockData';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Building2,
  Landmark,
  Receipt,
  Gem,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AssetType = 'All' | RWAAsset['type'];
type SortOption = 'apy-desc' | 'apy-asc' | 'price-desc' | 'price-asc' | 'volume-desc' | 'tvl-desc';

const assetTypes: { type: AssetType; icon: typeof Building2 }[] = [
  { type: 'All', icon: Grid3X3 },
  { type: 'Real Estate', icon: Building2 },
  { type: 'Bond', icon: Landmark },
  { type: 'Invoice', icon: Receipt },
  { type: 'Commodity', icon: Gem },
  { type: 'Equipment', icon: Box },
];

export const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType>('All');
  const [apyRange, setApyRange] = useState([0, 15]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('apy-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAssets = useMemo(() => {
    let result = [...mockAssets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.symbol.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedType !== 'All') {
      result = result.filter((asset) => asset.type === selectedType);
    }

    // APY filter
    result = result.filter(
      (asset) => asset.apy >= apyRange[0] && asset.apy <= apyRange[1]
    );

    // Price filter
    if (priceMin) {
      result = result.filter((asset) => asset.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter((asset) => asset.price <= parseFloat(priceMax));
    }

    // Sort
    switch (sortBy) {
      case 'apy-desc':
        result.sort((a, b) => b.apy - a.apy);
        break;
      case 'apy-asc':
        result.sort((a, b) => a.apy - b.apy);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'volume-desc':
        result.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case 'tvl-desc':
        result.sort((a, b) => b.tvl - a.tvl);
        break;
    }

    return result;
  }, [searchQuery, selectedType, apyRange, priceMin, priceMax, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setApyRange([0, 15]);
    setPriceMin('');
    setPriceMax('');
    setSortBy('apy-desc');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'All' ||
    apyRange[0] > 0 ||
    apyRange[1] < 15 ||
    priceMin ||
    priceMax;

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Discover and trade tokenized real-world assets</p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="lg:hidden gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-48 input-dark">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apy-desc">APY (High to Low)</SelectItem>
                <SelectItem value="apy-asc">APY (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="volume-desc">24h Volume</SelectItem>
                <SelectItem value="tvl-desc">TVL</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn('rounded-none', viewMode === 'grid' && 'bg-secondary')}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('rounded-none', viewMode === 'list' && 'bg-secondary')}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside
            className={cn(
              'lg:w-64 shrink-0 space-y-6',
              showFilters ? 'block' : 'hidden lg:block'
            )}
          >
            <div className="glass-card p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Asset Type */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Asset Type</Label>
                <div className="space-y-1">
                  {assetTypes.map(({ type, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedType === type
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* APY Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">APY Range</Label>
                  <span className="text-sm text-foreground">
                    {apyRange[0]}% - {apyRange[1]}%
                  </span>
                </div>
                <Slider
                  value={apyRange}
                  onValueChange={setApyRange}
                  min={0}
                  max={15}
                  step={0.5}
                  className="py-2"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Price Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="input-dark"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Assets Grid */}
          <div className="flex-1">
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedType !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedType}
                    <button onClick={() => setSelectedType('All')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(apyRange[0] > 0 || apyRange[1] < 15) && (
                  <Badge variant="secondary" className="gap-1">
                    APY: {apyRange[0]}% - {apyRange[1]}%
                    <button onClick={() => setApyRange([0, 15])}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {filteredAssets.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground">No assets found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {filteredAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AssetCard asset={asset} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {mockAssets.length} assets
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
