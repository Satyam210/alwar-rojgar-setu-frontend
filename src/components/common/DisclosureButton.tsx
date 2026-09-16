interface DisclosureButtonProps {
  open: boolean;
  onClick: () => void;
  showLabel: string;
  hideLabel: string;
}

/** Styled expand/collapse toggle with a rotating chevron. */
export function DisclosureButton({ open, onClick, showLabel, hideLabel }: DisclosureButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      >
        <path
          fillRule="evenodd"
          d="M7.21 5.23a.75.75 0 011.06.02l4 4.25a.75.75 0 010 1.03l-4 4.25a.75.75 0 11-1.09-1.03L10.69 10 7.23 6.29a.75.75 0 01-.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
      {open ? hideLabel : showLabel}
    </button>
  );
}
