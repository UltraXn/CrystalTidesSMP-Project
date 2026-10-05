import { Globe, Gamepad2, Shield, User, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LogEntry } from './types';

const getSourceIcon = (source: string) => {
  if (source === 'game') return <Gamepad2 size={16} aria-hidden="true" />;
  if (source === 'security-auditor' || source === 'security')
    return <Shield size={16} aria-hidden="true" />;
  return <Globe size={16} aria-hidden="true" />;
};

const formatDate = (date: number | string) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

interface AuditTableProps {
  logs: LogEntry[];
}

export function AuditTable({ logs }: AuditTableProps) {
  const { t } = useTranslation();

  return (
    <div className="audit-table-wrapper">
      <table
        className="audit-table"
        aria-label={t('admin.audit.table_accessible_name', 'Tabla de registros de auditoría')}
      >
        <thead>
          <tr>
            <th scope="col">{t('admin.audit.table_date')}</th>
            <th scope="col">{t('admin.audit.table_user')}</th>
            <th scope="col">{t('admin.audit.table_source')}</th>
            <th scope="col">{t('admin.audit.table_action')}</th>
            <th scope="col">{t('admin.audit.table_details')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: LogEntry) => (
            <tr key={log.id} className="audit-row">
              <td className="cell-date">
                <div className="date-main" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <Calendar size={14} aria-hidden="true" />
                  {formatDate(log.created_at)}
                </div>
              </td>
              <td className="cell-user">
                <div className="user-info">
                  <User size={14} aria-hidden="true" />
                  <span>{log.username}</span>
                </div>
              </td>
              <td className="cell-source">
                <span className={`source-badge ${log.source}`}>
                  {getSourceIcon(log.source)}
                  {t(`admin.audit.source_${log.source}`)}
                </span>
              </td>
              <td className="cell-action">
                <span className="action-tag">{log.action}</span>
              </td>
              <td className="cell-details">
                <div className="details-text" title={log.details}>
                  {log.details}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
