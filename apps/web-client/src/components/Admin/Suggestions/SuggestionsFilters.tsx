import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaInbox, FaLightbulb, FaBug, FaCube, FaExclamationTriangle, FaPoll } from 'react-icons/fa';
import { getTypeColor, getStatusColor } from './types';

interface SuggestionsFiltersProps {
    filterType: string;
    setFilterType: (type: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
}

const FilterButton = ({ type, icon, label, isActive, onClick }: { type: string, icon?: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
    const colors = type === 'All' ? { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' } : getTypeColor(type);
    
    return (
        <button 
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                borderRadius: '50px',
                border: `1px solid ${isActive ? colors.border : 'transparent'}`,
                background: isActive ? colors.bg : 'rgba(0,0,0,0.2)',
                color: isActive ? '#fff' : '#aaa',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400
            }}
        >
            {icon}
            {label}
        </button>
    )
}

const StatusFilterButton = ({ status, label, activeStatus, setStatus }: { status: string, label: string, activeStatus: string, setStatus: (s: string) => void }) => {
    const isActive = activeStatus === status;
    const colors = status === 'All' 
        ? { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)', text: '#aaa' } 
        : getStatusColor(status.toLowerCase());

    return (
        <button 
            onClick={() => setStatus(status)}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? colors.border : 'transparent'}`,
                background: isActive ? colors.bg : 'rgba(0,0,0,0.2)',
                color: isActive ? colors.text : '#888',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400
            }}
        >
            {label}
        </button>
    )
}

export default function SuggestionsFilters({ filterType, setFilterType, filterStatus, setFilterStatus }: SuggestionsFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className="suggestions-sidebar" style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, display:'flex', alignItems:'center', gap:'12px', fontSize: '1.8rem', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <FaInbox style={{ color: 'var(--accent)' }} /> 
                    {t('admin.suggestions.title')}
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                    {t('admin.suggestions.subtitle', 'Gestione el feedback de la comunidad')}
                </p>
            </div>

            {/* Filters Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Type Filters */}
                <div style={{ 
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ color: '#888', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {t('admin.suggestions.filter_by_type', 'Tipo:')}
                    </div>
                    <FilterButton type="All" label={t('admin.suggestions.filter_all')} isActive={filterType === 'All'} onClick={() => setFilterType('All')} />
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                    <FilterButton type="General" icon={<FaLightbulb />} label={t('admin.suggestions.types.general')} isActive={filterType === 'General'} onClick={() => setFilterType('General')} />
                    <FilterButton type="Bug" icon={<FaBug />} label={t('admin.suggestions.types.bug')} isActive={filterType === 'Bug'} onClick={() => setFilterType('Bug')} />
                    <FilterButton type="Mod" icon={<FaCube />} label={t('admin.suggestions.types.mod')} isActive={filterType === 'Mod'} onClick={() => setFilterType('Mod')} />
                    <FilterButton type="Complaint" icon={<FaExclamationTriangle />} label={t('admin.suggestions.types.complaint')} isActive={filterType === 'Complaint'} onClick={() => setFilterType('Complaint')} />
                    <FilterButton type="Poll" icon={<FaPoll />} label={t('admin.suggestions.types.poll')} isActive={filterType === 'Poll'} onClick={() => setFilterType('Poll')} />
                </div>

                {/* Status Filters */}
                <div style={{ 
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.03)'
                }}>
                    <div style={{ color: '#888', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {t('admin.suggestions.filter_by_status', 'Estado:')}
                    </div>
                    <StatusFilterButton status="All" label={t('admin.suggestions.status.all')} activeStatus={filterStatus} setStatus={setFilterStatus} />
                    <StatusFilterButton status="pending" label={t('admin.suggestions.status.pending')} activeStatus={filterStatus} setStatus={setFilterStatus} />
                    <StatusFilterButton status="approved" label={t('admin.suggestions.status.approved')} activeStatus={filterStatus} setStatus={setFilterStatus} />
                    <StatusFilterButton status="rejected" label={t('admin.suggestions.status.rejected')} activeStatus={filterStatus} setStatus={setFilterStatus} />
                </div>
            </div>
        </div>
    );
}
