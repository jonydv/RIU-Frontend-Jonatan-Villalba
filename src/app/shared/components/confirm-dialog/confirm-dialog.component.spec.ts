import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DIALOG_ACTION } from '../../constants/dialog.constants';
import type { ConfirmDialogData } from '../../models/confirm-dialog.model';

const DATA: ConfirmDialogData = {
  title: 'Eliminar héroe',
  message: '¿Seguro que querés eliminar a SUPERMAN?',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
};

function setup(): {
  fixture: ComponentFixture<ConfirmDialogComponent>;
  close: ReturnType<typeof vi.fn>;
} {
  const close = vi.fn();

  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: DATA },
      { provide: MatDialogRef, useValue: { close } },
    ],
  });

  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();

  return { fixture, close };
}

function buttonWithText(
  fixture: ComponentFixture<ConfirmDialogComponent>,
  text: string,
): HTMLButtonElement {
  const buttons: HTMLButtonElement[] = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  );
  const button = buttons.find((candidate) => candidate.textContent?.trim() === text);

  if (!button) {
    throw new Error(`Button "${text}" not found`);
  }

  return button;
}

describe('ConfirmDialogComponent', () => {
  it('should render the injected title, message and labels', () => {
    const { fixture } = setup();
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain(DATA.title);
    expect(text).toContain(DATA.message);
    expect(text).toContain(DATA.confirmLabel);
    expect(text).toContain(DATA.cancelLabel);
  });

  it('should close with the confirm action', () => {
    const { fixture, close } = setup();

    buttonWithText(fixture, DATA.confirmLabel).click();

    expect(close).toHaveBeenCalledWith(DIALOG_ACTION.confirm);
  });

  it('should close with the cancel action', () => {
    const { fixture, close } = setup();

    buttonWithText(fixture, DATA.cancelLabel).click();

    expect(close).toHaveBeenCalledWith(DIALOG_ACTION.cancel);
  });
});
