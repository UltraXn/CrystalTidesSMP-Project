import type { CSSProperties } from 'react';

const baseInput: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  padding: '0.6rem 0.8rem',
  color: '#fff',
  fontSize: '0.85rem',
};

export const BOSS_FORM_STYLES = {
  input: {
    ...baseInput,
    width: '100%',
  } as CSSProperties,
  inputFlex: {
    ...baseInput,
    flex: 1,
  } as CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#aaa',
    marginBottom: '0.3rem',
  } as CSSProperties,
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fca5a5',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  } as CSSProperties,
} as const;
