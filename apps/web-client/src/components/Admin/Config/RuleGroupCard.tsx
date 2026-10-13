import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Rule } from '../../../hooks/useAdminData';

const JUSTIFY_SPACE_BETWEEN = 'space-between';

interface RuleGroupCardProps {
  category: string;
  categoryRules: Rule[];
  onEdit: (rule: Rule) => void;
  onDelete: (id: number) => void;
}

export function RuleGroupCard({
  category,
  categoryRules,
  onEdit,
  onDelete,
}: Readonly<RuleGroupCardProps>) {
  const { t } = useTranslation();

  return (
    <div>
      <h4
        style={{
          margin: '0 0 1rem',
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {category}
      </h4>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {categoryRules
          .toSorted((a: Rule, b: Rule) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((rule: Rule) => (
            <div
              key={rule.id}
              className="admin-card"
              style={{
                background: 'rgba(15, 15, 20, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: JUSTIFY_SPACE_BETWEEN,
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      background: `${rule.color ?? 'var(--accent)'}20`,
                      color: rule.color ?? 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      border: `1px solid ${rule.color ?? 'var(--accent)'}40`,
                    }}
                  >
                    #{rule.sort_order}
                  </span>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {rule.title}
                  </h5>
                  {rule.title_en && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.4)',
                        fontStyle: 'italic',
                        marginLeft: '0.5rem',
                      }}
                    >
                      ({rule.title_en})
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: '1.5',
                  }}
                >
                  {rule.content}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  aria-label={t('admin.settings.rules.edit_rule', `Editar regla: ${rule.title}`)}
                  type="button"
                  onClick={() => onEdit(rule)}
                  className="hover-lift"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={18} aria-hidden="true" />
                </button>
                <button
                  aria-label={t(
                    'admin.settings.rules.delete_rule',
                    `Eliminar regla: ${rule.title}`,
                  )}
                  type="button"
                  onClick={() => onDelete(rule.id)}
                  className="hover-lift"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
