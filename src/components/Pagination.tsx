interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-lg bg-card border-border text-foreground 
          disabled:opacity-40"
      >
        Prev
      </button>
      <div className="hidden md:flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg transition
              ${page === currentPage
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-card border border-border text-foreground hover:bg-muted'}`}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="md:hidden flex space-x-1">
    
        <button
          onClick={() => onPageChange(currentPage)}
          className={`px-4 py-2 rounded-lg transition
            ${currentPage === currentPage
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-card border border-border text-foreground hover:bg-muted'}`}
        >
          {currentPage}
        </button>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-lg bg-card border-border text-foreground 
          disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
