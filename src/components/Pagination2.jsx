import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination2 = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50],
  className = "",
  compact = false,
}) => {
  if (totalPages <= 1 && (!onLimitChange || total <= Math.min(...limitOptions)))
    return null;

  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const rangeStart =
    total === 0 ? 0 : Math.min((currentPage - 1) * limit + 1, total);
  const rangeEnd = Math.min(currentPage * limit, total);

  const base =
    "inline-flex items-center justify-center h-7 min-w-[1.75rem] px-1.5 rounded-md text-xs font-semibold transition-colors select-none";
  const active = "bg-theme_color text-white shadow-sm";
  const inactive =
    "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800";
  const disabled =
    "text-gray-300 dark:text-gray-700 cursor-not-allowed pointer-events-none";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {onLimitChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              Rows
            </span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 pl-2 pr-5 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-theme_color transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M1 3l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
        {!compact && total > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {total}
            </span>
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`${base} ${currentPage === 1 ? disabled : inactive}`}
            aria-label="First page"
          >
            <ChevronsLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${base} ${currentPage === 1 ? disabled : inactive}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {getPages().map((p, i) =>
            p === "..." ? (
              <span
                key={`e-${i}`}
                className="inline-flex items-center justify-center h-7 w-7 text-xs text-gray-400 dark:text-gray-600"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`${base} ${p === currentPage ? active : inactive}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${base} ${currentPage === totalPages ? disabled : inactive}`}
            aria-label="Next page"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`${base} ${currentPage === totalPages ? disabled : inactive}`}
            aria-label="Last page"
          >
            <ChevronsRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
export default Pagination2