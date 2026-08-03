import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { DIALOG_ACTION } from '../../constants/dialog.constants';
import type { ConfirmDialogData, ConfirmDialogResult } from '../../models/confirm-dialog.model';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  protected readonly dialogAction = DIALOG_ACTION;

  private readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult>>(
    MatDialogRef,
  );

  protected close(action: ConfirmDialogResult): void {
    this.dialogRef.close(action);
  }
}
