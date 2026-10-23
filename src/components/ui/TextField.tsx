import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import styles from './TextField.module.css';

interface FieldFrameProps {
  label: string;
  hint?: string;
  error?: string | null;
  inputId: string;
  children: ReactNode;
}

function FieldFrame({ label, hint, error, inputId, children }: FieldFrameProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string | null;
}

export function TextField({ label, hint, error, className, ...rest }: TextFieldProps) {
  const inputId = useId();
  const invalid = Boolean(error);

  return (
    <FieldFrame label={label} hint={hint} error={error} inputId={inputId}>
      <input
        id={inputId}
        className={[styles.control, invalid ? styles.invalid : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </FieldFrame>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string | null;
}

export function TextAreaField({ label, hint, error, className, rows = 3, ...rest }: TextAreaFieldProps) {
  const inputId = useId();
  const invalid = Boolean(error);

  return (
    <FieldFrame label={label} hint={hint} error={error} inputId={inputId}>
      <textarea
        id={inputId}
        rows={rows}
        className={[styles.control, styles.textarea, invalid ? styles.invalid : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </FieldFrame>
  );
}
