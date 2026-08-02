import type { DialogAction } from '../constants/dialog.constants';

export interface ConfirmDialogData {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
}

export type ConfirmDialogResult = DialogAction;
