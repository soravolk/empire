import React, { useRef, useEffect, useCallback, useState } from "react";

type TaskViewModel = {
  id: number;
  contentName: string;
  subcategoryId: number;
  categoryId: number;
  finishedDate?: string | null;
  timeSpent?: number;
};

type SubcategoryGroup = {
  id: number;
  name: string;
  tasks: TaskViewModel[];
};

type CategoryCardData = {
  categoryId: number;
  categoryName: string;
  groups: SubcategoryGroup[];
};

interface CategoryCardsCarouselProps {
  categories: CategoryCardData[];
  onSelectTask: (taskId: number) => void;
}

export default function CategoryCardsCarousel({
  categories,
  onSelectTask,
}: CategoryCardsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Optional: snap to first card on mount for consistent UX
    const node = scrollerRef.current;
    if (node && node.firstElementChild) {
      (node.firstElementChild as HTMLElement).scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    }
  }, [categories?.length]);
  // Track current card index for disabling arrows and active dot styling
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollToIndex = useCallback((idx: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const child = node.children?.[idx] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", inline: "center" });
      setActiveIdx(idx);
    }
  }, []);

  // Update active index on manual scroll (approximate by measuring nearest child)
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const handler = () => {
      const children = Array.from(node.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      const center = node.scrollLeft + node.clientWidth / 2;
      children.forEach((el, i) => {
        const boxCenter = el.offsetLeft + el.clientWidth / 2;
        const dist = Math.abs(center - boxCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIdx(closest);
    };
    node.addEventListener("scroll", handler, { passive: true });
    return () => node.removeEventListener("scroll", handler);
  }, []);

  const handlePrev = () => scrollToIndex(Math.max(0, activeIdx - 1));
  const handleNext = () =>
    scrollToIndex(Math.min(categories.length - 1, activeIdx + 1));

  return (
    <div className="w-full">
      {!categories || categories.length === 0 ? (
        <div className="text-sm text-gray-500 p-4">No tasks available.</div>
      ) : (
        <div className="relative">
          {/* Arrow buttons */}
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/80 shadow border text-gray-700 hover:bg-white disabled:opacity-40"
            aria-label="Previous category"
            disabled={activeIdx === 0}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/80 shadow border text-gray-700 hover:bg-white disabled:opacity-40"
            aria-label="Next category"
            disabled={activeIdx === categories.length - 1}
          >
            ›
          </button>
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto snap-x snap-mandatory px-2 pb-2 scroll-smooth space-x-4"
            aria-label="Category cards carousel"
          >
            {categories.map((cat, idx) => (
              <div
                key={String(cat.categoryId)}
                className="w-full sm:w-[90%] md:w-[70%] lg:w-[55%] xl:w-[45%] shrink-0 snap-center bg-white rounded-lg shadow border"
                aria-current={activeIdx === idx ? "true" : undefined}
              >
                <div className="p-4 border-b">
                  <h3 className="text-base font-semibold truncate">
                    {cat.categoryName}
                  </h3>
                </div>
                <div className="p-2">
                  {cat.groups.map((group, gidx) => (
                    <div key={String(group.id)}>
                      <div className="px-2 py-1 text-xs font-medium text-gray-600">
                        {group.name}
                      </div>
                      <ul className="divide-y">
                        {group.tasks.map((t) => (
                          <li
                            key={t.id}
                            className="py-2 px-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => onSelectTask(t.id)}
                          >
                            <span className="text-sm truncate inline-block max-w-full">
                              {t.contentName}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {gidx < cat.groups.length - 1 && (
                        <hr className="my-2 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className="flex justify-center gap-2 mt-2"
        role="tablist"
        aria-label="Category navigation dots"
      >
        {(categories ?? []).map((cat, idx) => (
          <button
            key={String(cat.categoryId)}
            onClick={() => scrollToIndex(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              activeIdx === idx ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label={`Go to ${cat.categoryName}`}
            aria-selected={activeIdx === idx}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}
