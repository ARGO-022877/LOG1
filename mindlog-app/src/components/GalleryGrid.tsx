'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Filter, Search } from 'lucide-react';

export interface GridItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: 'emotion' | 'insight' | 'knowledge' | 'memory';
  timestamp: Date;
  metadata?: Record<string, unknown>;
  color?: string;
}

interface GalleryGridProps {
  items: GridItem[];
  onItemClick: (item: GridItem) => void;
  className?: string;
  enableFilters?: boolean;
  enableSearch?: boolean;
}

type ViewMode = 'grid' | 'list' | 'masonry';
type SortMode = 'recent' | 'oldest' | 'alphabetical' | 'type';
type FilterMode = 'all' | 'emotion' | 'insight' | 'knowledge' | 'memory';

export default function GalleryGrid({ 
  items, 
  onItemClick, 
  className = '',
  enableFilters = true,
  enableSearch = true 
}: GalleryGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // 필터링 및 정렬 로직
  const filteredAndSortedItems = items
    .filter(item => {
      if (filterMode !== 'all' && item.type !== filterMode) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // 갤러리 카드 컴포넌트
  const GalleryCard = ({ item, index }: { item: GridItem; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          y: -8,
          transition: { duration: 0.2 }
        }}
        className={`
          relative cursor-pointer group
          ${viewMode === 'grid' ? 'aspect-square' : 'aspect-[4/3]'}
          ${viewMode === 'list' ? 'w-full flex' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onItemClick(item)}
      >
        <div className={`
          h-full w-full rounded-2xl overflow-hidden
          bg-gradient-to-br from-white via-gray-50 to-gray-100
          border border-gray-200/50
          shadow-sm hover:shadow-xl
          transition-all duration-500 ease-out
          ${isHovered ? 'shadow-2xl border-gray-300/70' : ''}
        `}>
          {/* 카드 헤더 - 타입별 컬러 */}
          <div className={`
            h-2 w-full
            ${item.type === 'emotion' ? 'bg-gradient-to-r from-pink-400 to-rose-400' : ''}
            ${item.type === 'insight' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : ''}
            ${item.type === 'knowledge' ? 'bg-gradient-to-r from-green-400 to-emerald-400' : ''}
            ${item.type === 'memory' ? 'bg-gradient-to-r from-purple-400 to-violet-400' : ''}
          `} />

          {viewMode === 'list' ? (
            // 리스트 뷰 레이아웃
            <div className="p-6 flex items-center gap-4 h-full">
              <div className={`
                w-16 h-16 rounded-full flex-shrink-0
                flex items-center justify-center text-2xl
                ${item.type === 'emotion' ? 'bg-pink-100 text-pink-600' : ''}
                ${item.type === 'insight' ? 'bg-blue-100 text-blue-600' : ''}
                ${item.type === 'knowledge' ? 'bg-green-100 text-green-600' : ''}
                ${item.type === 'memory' ? 'bg-purple-100 text-purple-600' : ''}
              `}>
                {getTypeIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {item.subtitle}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatTimeAgo(item.timestamp)}
                </p>
              </div>

              <div className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${item.type === 'emotion' ? 'bg-pink-100 text-pink-700' : ''}
                ${item.type === 'insight' ? 'bg-blue-100 text-blue-700' : ''}
                ${item.type === 'knowledge' ? 'bg-green-100 text-green-700' : ''}
                ${item.type === 'memory' ? 'bg-purple-100 text-purple-700' : ''}
              `}>
                {getTypeLabel(item.type)}
              </div>
            </div>
          ) : (
            // 그리드 뷰 레이아웃
            <div className="p-6 h-full flex flex-col">
              {/* 아이콘 영역 */}
              <div className={`
                w-12 h-12 rounded-xl mb-4 mx-auto
                flex items-center justify-center text-xl
                transition-all duration-300
                ${item.type === 'emotion' ? 'bg-pink-100 text-pink-600' : ''}
                ${item.type === 'insight' ? 'bg-blue-100 text-blue-600' : ''}
                ${item.type === 'knowledge' ? 'bg-green-100 text-green-600' : ''}
                ${item.type === 'memory' ? 'bg-purple-100 text-purple-600' : ''}
                ${isHovered ? 'transform scale-110' : ''}
              `}>
                {getTypeIcon(item.type)}
              </div>

              {/* 콘텐츠 영역 */}
              <div className="flex-1 text-center">
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* 푸터 */}
              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <span className={`
                    px-2 py-1 rounded-lg text-xs font-medium
                    ${item.type === 'emotion' ? 'bg-pink-50 text-pink-600' : ''}
                    ${item.type === 'insight' ? 'bg-blue-50 text-blue-600' : ''}
                    ${item.type === 'knowledge' ? 'bg-green-50 text-green-600' : ''}
                    ${item.type === 'memory' ? 'bg-purple-50 text-purple-600' : ''}
                  `}>
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 호버 오버레이 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 갤러리 컨트롤 바 */}
      {(enableFilters || enableSearch) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* 검색 */}
          {enableSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 뷰 모드 토글 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* 필터 버튼 */}
            {enableFilters && (
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg transition-all ${
                  isFilterOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* 정렬 버튼 */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="recent">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="alphabetical">가나다순</option>
              <option value="type">타입별</option>
            </select>
          </div>
        </div>
      )}

      {/* 필터 패널 */}
      <AnimatePresence>
        {isFilterOpen && enableFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex flex-wrap gap-2">
              {(['all', 'emotion', 'insight', 'knowledge', 'memory'] as FilterMode[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterMode(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterMode === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  {filter === 'all' ? '전체' : getTypeLabel(filter)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 갤러리 그리드 */}
      <div
        ref={gridRef}
        className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-3'
          }
        `}
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedItems.map((item, index) => (
            <GalleryCard key={item.id} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* 빈 상태 */}
      {filteredAndSortedItems.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 표시할 항목이 없습니다</h3>
          <p className="text-gray-600">첫 번째 감정 체크인을 해보세요!</p>
        </motion.div>
      )}
    </div>
  );
}

// 헬퍼 함수들
function getTypeIcon(type: string): string {
  switch (type) {
    case 'emotion': return '💝';
    case 'insight': return '💡';
    case 'knowledge': return '🧠';
    case 'memory': return '📝';
    default: return '✨';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'emotion': return '감정';
    case 'insight': return '인사이트';
    case 'knowledge': return '지식';
    case 'memory': return '기억';
    default: return '기타';
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}