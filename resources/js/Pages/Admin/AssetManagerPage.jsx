import { 
  Image, 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Trash2, 
  Download, 
  Eye, 
  Edit3,
  FileImage,
  FileText,
  File,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AssetManagerPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // New: dynamic assets and loading
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async (q = '', type = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (type && type !== 'all') params.append('type', type);
      const res = await fetch(`/admin/assets?${params.toString()}`, { credentials: 'same-origin' });
      const json = await res.json();
      if (json?.data) setAssets(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    // apply client-side filtering/search for quick UX (server search also supported)
    const t = setTimeout(() => fetchAssets(searchQuery, filterType), 300);
    return () => clearTimeout(t);
  }, [searchQuery, filterType]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return FileImage;
      case 'document': return FileText;
      default: return File;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedAssets.length) return;
    if (!confirm(`Delete ${selectedAssets.length} assets?`)) return;
    try {
      const res = await fetch('/admin/assets/bulk-delete', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ asset_ids: selectedAssets })
      });
      const json = await res.json();
      if (json.success) {
        setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
        setSelectedAssets([]);
      } else {
        console.error('Bulk delete failed', json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle file drop logic here - keep stub for now
    console.log('Files dropped:', e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[var(--fs-xl)] font-semibold mb-2 flex items-center gap-3">
          <Image size={24} className="text-[var(--color-primary)]" /> 
          Asset Manager
        </h1>
        <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
          Manage your website assets, images, documents, and media files
        </p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Left side - Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-[var(--transition)]"
              />
            </div>
            
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-[var(--transition)]"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="archive">Archives</option>
              </select>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-[var(--radius-sm)] transition-all duration-[var(--transition)] ${
                  viewMode === 'grid' 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-[var(--radius-sm)] transition-all duration-[var(--transition)] ${
                  viewMode === 'list' 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Delete Selected */}
            {selectedAssets.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-[var(--radius-sm)] hover:bg-red-600 transition-all duration-[var(--transition)] text-[var(--fs-sm)]"
              >
                <Trash2 size={16} />
                Delete ({selectedAssets.length})
              </button>
            )}

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] transition-all duration-[var(--transition)] text-[var(--fs-sm)] font-medium"
            >
              <Upload size={16} />
              Upload Assets
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-sm p-6">
        {loading ? (
          <div className="text-center py-16">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-16">
            <Image size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
            <h3 className="text-[var(--fs-lg)] font-medium mb-2">No assets found</h3>
            <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Upload your first asset to get started'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
              : 'space-y-3'
          }>
            {filteredAssets.map((asset) => {
              const IconComponent = getFileIcon(asset.type);
              const isSelected = selectedAssets.includes(asset.id);
              
              return viewMode === 'grid' ? (
                // Grid View
                <div
                  key={asset.id}
                  className={`relative group border rounded-[var(--radius-sm)] p-3 cursor-pointer transition-all duration-[var(--transition)] hover:shadow-md ${
                    isSelected 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                  onClick={() => handleSelectAsset(asset.id)}
                >
                  {/* Selection Checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-[var(--transition)] ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                      : 'border-[var(--color-border)] group-hover:border-[var(--color-primary)]'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>

                  {/* Asset Preview */}
                  <div className="aspect-square bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] mb-3 flex items-center justify-center overflow-hidden">
                    {asset.type === 'image' && asset.url ? (
                      <img 
                        src={asset.url} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className={`flex items-center justify-center ${asset.type === 'image' ? 'hidden' : ''}`}>
                      <IconComponent size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="text-center">
                    <h4 className="text-[var(--fs-sm)] font-medium truncate mb-1" title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className="text-[var(--color-text-muted)] text-xs">
                      {asset.formatted_size ?? asset.size}
                    </p>
                    {asset.dimensions && (
                      <p className="text-[var(--color-text-muted)] text-xs">
                        {asset.dimensions.width}x{asset.dimensions.height}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition)]">
                    <a href={asset.url} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex items-center justify-center hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Eye size={12} />
                    </a>
                    <a href={asset.url} download className="w-7 h-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex items-center justify-center hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Download size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={asset.id}
                  className={`flex items-center gap-4 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-all duration-[var(--transition)] hover:shadow-sm ${
                    isSelected 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                  onClick={() => handleSelectAsset(asset.id)}
                >
                  {/* Selection Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-[var(--transition)] ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                      : 'border-[var(--color-border)]'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>

                  {/* Asset Icon/Preview */}
                  <div className="w-12 h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {asset.type === 'image' && asset.url ? (
                      <img 
                        src={asset.url} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className={`flex items-center justify-center ${asset.type === 'image' ? 'hidden' : ''}`}>
                      <IconComponent size={20} className="text-[var(--color-text-muted)]" />
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{asset.name}</h4>
                    <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-[var(--fs-sm)] mt-1">
                      <span>{asset.formatted_size ?? asset.size}</span>
                      {asset.dimensions && <span>{asset.dimensions.width}x{asset.dimensions.height}</span>}
                      <span>Uploaded {asset.uploadDate ?? (asset.created_at ? new Date(asset.created_at).toLocaleDateString() : '-')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a href={asset.url} target="_blank" rel="noreferrer" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded transition-all">
                      <Eye size={16} />
                    </a>
                    <a href={asset.url} download className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded transition-all">
                      <Download size={16} />
                    </a>
                    <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded transition-all">
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[var(--fs-lg)] font-semibold">Upload Assets</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-[var(--radius-md)] p-8 text-center transition-all duration-[var(--transition)] ${
                isDragOver
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
              <p className="text-[var(--fs-sm)] mb-2">Drop files here or click to browse</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Supports: PNG, JPG, PDF, ZIP (Max 10MB each)
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] cursor-pointer transition-colors text-[var(--fs-sm)]"
              >
                Browse Files
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-muted)] transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}