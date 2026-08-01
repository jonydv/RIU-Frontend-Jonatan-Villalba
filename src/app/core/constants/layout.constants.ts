export const BREAKPOINT_QUERIES = {
  handset: '(max-width: 599.98px)',
} as const;

export const DIALOG_SIZES = {
  handset: {
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    maxHeight: '100vh',
  },
  form: {
    width: '560px',
    maxWidth: '90vw',
  },
  confirm: {
    width: '400px',
    maxWidth: '90vw',
  },
} as const;
