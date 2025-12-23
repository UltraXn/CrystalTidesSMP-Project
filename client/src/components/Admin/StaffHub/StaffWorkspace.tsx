import KanbanBoard from './KanbanBoard';
import StaffNotes from './StaffNotes';

export default function StaffWorkspace() {
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', 
            gap: '1.5rem', 
            height: '100%',
            overflow: 'hidden' 
        }}>
            {/* Left: Kanban (Takes more space) */}
            <section style={{ height: '100%', overflow: 'hidden' }}>
                <KanbanBoard />
            </section>

            {/* Right: Notes (Takes less space) */}
            <section style={{ height: '100%', overflow: 'hidden' }}>
                <StaffNotes />
            </section>
        </div>
    );
}
