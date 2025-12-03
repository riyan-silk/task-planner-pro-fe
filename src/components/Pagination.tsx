interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const go = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-wrap justify-center space-x-2 py-8">
      <button
        onClick={() => go(prevPage)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-lg bg-card border-border text-foreground disabled:opacity-40"
      >
        Prev
      </button>

      <div className="flex md:hidden items-center space-x-1">
        <button
          onClick={() => go(1)}
          className={`${
            currentPage == 1
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground"
          } px-4 py-2 rounded-lg border border-border`}
        >
          1
        </button>

        {currentPage != 1 && (
          <>
            {currentPage != 2 && <span className="px-2">..</span>}

            <button
              onClick={() => go(currentPage)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow"
            >
              {currentPage}
            </button>
          </>
        )}

        {currentPage != totalPages && (
          <>
            {currentPage + 1 != totalPages && <span className="px-2">..</span>}
            <button
              onClick={() => go(totalPages)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
            >
              {totalPages}
            </button>{" "}
          </>
        )}
      </div>

      <div className="hidden md:flex space-x-1">
        {totalPages <= 10 ? (
          <>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => go(page)}
                className={`px-4 py-2 rounded-lg transition ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
          </>
        ) : (
          <>
            {currentPage != 1 && (
              <button
                onClick={() => go(1)}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted"
              >
                1
              </button>
            )}

            {currentPage > 3 && <span className="px-2">...</span>}

            {currentPage > 1 && prevPage != 1 && (
              <button
                onClick={() => go(prevPage)}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted"
              >
                {prevPage}
              </button>
            )}

            <button
              onClick={() => go(currentPage)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow"
            >
              {currentPage}
            </button>

            {currentPage < totalPages && (
              <button
                onClick={() => go(nextPage)}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted"
              >
                {nextPage}
              </button>
            )}

            {currentPage < totalPages - 2 && <span className="px-2">...</span>}

            {currentPage + 1 != totalPages && currentPage != totalPages && (
              <button
                onClick={() => go(totalPages)}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted"
              >
                {totalPages}
              </button>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => go(nextPage)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-lg bg-card border-border text-foreground disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
