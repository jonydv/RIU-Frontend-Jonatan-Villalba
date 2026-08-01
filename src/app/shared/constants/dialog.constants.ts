export const DIALOG_ACTION = {
  confirm: 'confirm',
  cancel: 'cancel',
} as const;

export type DialogAction = (typeof DIALOG_ACTION)[keyof typeof DIALOG_ACTION];
