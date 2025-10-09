import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Icon, type IconName } from './icon';

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
};

type MyTabsProps = {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  variant?: 'default' | 'pills' | 'underline' | 'vertical';
  className?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  onTabChange?: (tabId: string) => void;
  fullWidth?: boolean;
};

const MyTab = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  variant = 'default',
  className,
  tabListClassName,
  tabContentClassName,
  onTabChange,
  fullWidth = false
}: MyTabsProps) => {
  const isControlled = controlledActiveTab !== undefined;
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    if (!isControlled) setUncontrolledActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Check if scrolling is needed and update scroll button states
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container || variant === 'vertical') return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const needsScroll = scrollWidth > clientWidth;
    
    setShowScrollButtons(needsScroll);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Scroll active tab into view
  const scrollActiveTabIntoView = () => {
    const container = scrollContainerRef.current;
    if (!container || variant === 'vertical') return;

    const activeButton = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  useEffect(() => {
    checkScrollability();
    scrollActiveTabIntoView();
    
    const container = scrollContainerRef.current;
    if (container && variant !== 'vertical') {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [activeTab, tabs, variant]);

  useEffect(() => {
    const handleResize = () => {
      checkScrollability();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn(
      'w-full max-w-full overflow-hidden',
      variant === 'vertical' && 'flex flex-col sm:flex-row gap-4 sm:gap-6',
      className
    )}>
      {/* Tab List Container */}
      <div className={cn(
        'relative min-w-0 max-w-full overflow-hidden',
        variant === 'vertical' && 'sm:min-w-[200px] w-full sm:w-auto'
      )}>
        {/* Scroll Buttons - Only show on horizontal variants and larger screens */}
        {showScrollButtons && variant !== 'vertical' && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full',
                'bg-background/80 backdrop-blur-sm border shadow-sm',
                'hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed',
                'hidden sm:flex items-center justify-center transition-all',
                'hover:scale-105 active:scale-95'
              )}
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full',
                'bg-background/80 backdrop-blur-sm border shadow-sm',
                'hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed',
                'hidden sm:flex items-center justify-center transition-all',
                'hover:scale-105 active:scale-95'
              )}
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Tab List */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex min-w-0 max-w-full',
            {
              // Default variant
              'border-b border-border bg-muted/50 p-1 rounded-lg overflow-x-auto': variant === 'default',
              
              // Pills variant
              'bg-muted p-1  gap-1 overflow-x-auto': variant === 'pills',
              
              // Underline variant
              'border-b border-border overflow-x-auto': variant === 'underline',
              
              // Vertical variant - responsive stacking
              'flex-col space-y-1 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] overflow-x-hidden': variant === 'vertical',
              'sm:flex-col flex-row sm:space-y-1 sm:space-x-0 space-x-1 space-y-0 sm:overflow-x-hidden overflow-x-auto': variant === 'vertical',
            },
            fullWidth && variant !== 'vertical' && 'w-full',
            // Add padding for scroll buttons on larger screens
            showScrollButtons && variant !== 'vertical' && 'sm:px-10',
            // Hide scrollbar - enhanced approach
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
            'scrollbar-hide',
            tabListClassName
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-50',
                  // Mobile-first responsive sizing and prevent text wrapping
                  'flex-shrink-0 whitespace-nowrap min-w-0',
                  // Better responsive handling for many tabs
                  tabs.length > 4 ? 'max-w-[120px] sm:max-w-[140px] md:max-w-none' : 'max-w-[150px] sm:max-w-none',
                  'sm:px-4',
                  // Full width behavior
                  fullWidth && variant !== 'vertical' && 'flex-1 justify-center max-w-none',
                  // Variant-specific styles
                  {
                    // Default variant
                    'rounded-md': variant === 'default',
                    'text-muted-foreground hover:text-foreground': variant === 'default' && !isActive,
                    
                    // Pills variant
                    'rounded-full': variant === 'pills',
                    'text-muted-foreground bg-secondary hover:text-foreground hover:bg-muted-foreground/10': variant === 'pills' && !isActive,
                    
                    // Shared active state for default and pills
                    'bg-background text-foreground shadow-sm': (variant === 'default' || variant === 'pills') && isActive,
                    
                    // Underline variant
                    'border-b-2 rounded-none px-4 py-3': variant === 'underline',
                    'sm:px-6': variant === 'underline',
                    'border-primary text-primary': variant === 'underline' && isActive,
                    'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground': variant === 'underline' && !isActive,
                    
                    // Vertical variant
                    'justify-start rounded-lg': variant === 'vertical',
                    'bg-primary text-primary-foreground': variant === 'vertical' && isActive,
                    'text-muted-foreground hover:text-foreground hover:bg-muted': variant === 'vertical' && !isActive,
                  }
                )}
              >
                {tab.icon && <Icon name={tab.icon} className="h-4 w-4 flex-shrink-0" />}
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-2 text-xs flex-shrink-0',
                    (() => {
                      if (!isActive) return 'bg-muted-foreground/20 text-muted-foreground';
                      return variant === 'vertical' 
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/20 text-primary';
                    })()
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn(
        'mt-4 sm:mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variant === 'vertical' && 'sm:mt-0 flex-1',
        tabContentClassName
      )}>
        {activeTabContent}
      </div>
    </div>
  );
};

export default MyTab;
