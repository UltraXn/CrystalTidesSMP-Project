import { Calendar, dateFnsLocalizer, View, ToolbarProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS, es } from 'date-fns/locale';
import { KanbanTask } from '@crystaltides/shared';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const GoogleIcon = ({ size = 16, style = {} }: { size?: number, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16" style={style}>
        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
    </svg>
);

const NotionIcon = ({ size = 16, style = {} }: { size?: number, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24" style={style}>
        <path d="M4.05 12.855l.855.285c.12.045.225-.015.225-.135V4.65c0-.135-.105-.24-.225-.285l-.855-.285a.21.21 0 0 1-.15-.21V3.45a.21.21 0 0 1 .21-.21h3a.24.24 0 0 1 .21.105l4.38 7.425V4.65c0-.135-.105-.24-.225-.285l-.855-.285a.21.21 0 0 1-.15-.21V3.45a.21.21 0 0 1 .21-.21h2.55a.21.21 0 0 1 .21.21v.42a.21.21 0 0 1-.15.21l-.855.285c-.12.045-.225.15-.225.285v8.355c0 .135.105.24.225.285l.855.285a.21.21 0 0 1 .15.21v.42a.21.21 0 0 1-.21.21h-3a.24.24 0 0 1-.21-.105l-4.38-7.425v6.075c0 .135.105.24.225.285l.855.285a.21.21 0 0 1 .15.21v.42a.21.21 0 0 1-.21.21H4.05a.21.21 0 0 1-.21-.21v-.42a.21.21 0 0 1 .15-.21z"/>
    </svg>
);

const locales = {
  'en-US': enUS,
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

export interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime: string; date?: string };
  end: { dateTime: string; date?: string };
  description?: string;
  htmlLink?: string;
}

interface CalendarViewProps {
  tasks: KanbanTask[];
  googleEvents?: GoogleEvent[];
  notionTasks?: Record<string, unknown>[];
  onEditTask: (task: KanbanTask) => void;
  onUpdateEventDate?: (id: number | string, newStart: Date) => void;
  onUpdateEventDuration?: (id: number | string, newStart: Date, newEnd: Date) => void;
}

interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  resource: unknown;
  hexColor?: string;
  isDraggable?: boolean;
  type?: 'task' | 'google' | 'notion';
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#1e40af',      // Deep Blue
  medium: '#92400e',   // Deep Amber/Brown
  high: '#9f1239',     // Deep Rose/Crimson
  critical: '#4c0519'  // Very Dark Red
};

// --- Custom Components for "Premium" Feel ---

const CustomToolbar = (props: ToolbarProps<CalendarEvent, object>) => {
  const { label, onNavigate, onView, view } = props;
  const { t } = useTranslation();

  return (
    <div className="calendar-toolbar-custom">
      <div className="toolbar-left">
        <button className="nav-btn-round" onClick={() => onNavigate('PREV')}><ChevronLeft /></button>
        <button className="today-btn-premium" onClick={() => onNavigate('TODAY')}>{t('status.today', 'Hoy')}</button>
        <button className="nav-btn-round" onClick={() => onNavigate('NEXT')}><ChevronRight /></button>
      </div>
      
      <div className="toolbar-center">
        <h2>{label}</h2>
      </div>

      <div className="toolbar-right">
        <div className="view-switcher-pill">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button 
              key={v}
              className={`switcher-btn ${view === v ? 'active' : ''}`}
              onClick={() => onView(v as View)}
            >
              {t(`admin.staff_hub.kanban.calendar_views.${v}`, v.charAt(0).toUpperCase() + v.slice(1))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};



const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const isTask = event.type === 'task';
  const isGoogle = event.type === 'google';
  const isNotion = event.type === 'notion';
  
  return (
    <div className="custom-calendar-event" title={event.title}>
      <div className="event-inner" style={{ borderLeftColor: event.hexColor }}>
        <div className="event-dot" style={{ backgroundColor: event.hexColor }}></div>
        {isGoogle && <GoogleIcon size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        {isTask && <CalendarIcon size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        {isNotion && <NotionIcon size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        <span className="event-title-text">{event.title}</span>
      </div>
    </div>
  );
};

export default function CalendarView({ tasks, googleEvents, notionTasks, onUpdateEventDate, onUpdateEventDuration }: CalendarViewProps) {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Map KanbanTasks
  const taskEvents: CalendarEvent[] = useMemo(() => tasks
    .filter(t => t.columnId !== 'idea') // Exclude Backlog tasks from calendar
    .map(task => {
      const startDate = new Date(task.due_date || task.created_at);
      // If we have end_date use it, otherwise 1 hour if it's a specific time
      let endDate;
      if (task.end_date) {
        endDate = new Date(task.end_date);
      } else {
        const hasTime = task.due_date?.includes('T');
        endDate = new Date(startDate.getTime() + (hasTime ? 60 * 60 * 1000 : 0));
      }
      
      return {
        id: task.id,
        title: task.title,
        start: startDate,
        end: endDate,
        resource: task,
        hexColor: task.priority ? (PRIORITY_COLORS[task.priority.toLowerCase()] || '#4338ca') : '#4338ca',
        isDraggable: true,
        type: 'task'
      };
    }), [tasks]);

  // Map GoogleEvents
  const googleCalendarEvents: CalendarEvent[] = useMemo(() => (googleEvents || []).map(event => ({
    id: event.id,
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date || ''),
    end: new Date(event.end.dateTime || event.end.date || ''),
    resource: { id: -1, title: event.summary, columnId: 'google', url: event.htmlLink },
    hexColor: '#1e3a8a', // Deeper Google Blue
    isDraggable: false,
    type: 'google'
  })), [googleEvents]);

  // Map NotionTasks
  const notionCalendarEvents: CalendarEvent[] = useMemo(() => (notionTasks || []).map(task => ({
    id: (task.id as string | number) || 'unknown-id',
    title: (task.title as string) || 'Untitled Notion Task',
    start: new Date((task.created_at as string) || new Date()),
    end: new Date((task.created_at as string) || new Date()),
    resource: { id: -2, ...task, columnId: 'notion' },
    hexColor: '#111827', // Deep Notion Black
    isDraggable: false,
    type: 'notion'
  })), [notionTasks]);

  const events = useMemo(() => [...taskEvents, ...googleCalendarEvents, ...notionCalendarEvents], 
    [taskEvents, googleCalendarEvents, notionCalendarEvents]);

  const onEventDrop = ({ event, start }: { event: CalendarEvent, start: string | Date }) => {
     if (event.resource && typeof event.id === 'number' && event.id > 0 && onUpdateEventDate) {
        onUpdateEventDate(event.id, new Date(start));
     }
  };

  const onEventResize = ({ event, start, end }: { event: CalendarEvent, start: string | Date, end: string | Date }) => {
    if (event.resource && typeof event.id === 'number' && event.id > 0 && onUpdateEventDuration) {
       onUpdateEventDuration(event.id, new Date(start), new Date(end));
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      className: `calendar-event-${event.type || 'default'}`,
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0',
        zIndex: 10
      }
    };
  };

  const components = useMemo(() => ({
    toolbar: CustomToolbar,
    event: CustomEvent
  }), []);

  return (
    <div className="premium-calendar-container">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: CalendarEvent) => event.start}
        endAccessor={(event: CalendarEvent) => event.end}
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        draggableAccessor={(event: CalendarEvent) => !!event.isDraggable}
        resizable={true} 
        views={['month', 'week', 'day', 'agenda']}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={components}
        culture={i18n.language === 'es' ? 'es' : 'en-US'}
        messages={{
          next: t('admin.staff_hub.kanban.calendar_views.next', "Siguiente"),
          previous: t('admin.staff_hub.kanban.calendar_views.prev', "Anterior"),
          today: t('admin.staff_hub.kanban.calendar_views.today', "Hoy"),
          month: t('admin.staff_hub.kanban.calendar_views.month', "Mes"),
          week: t('admin.staff_hub.kanban.calendar_views.week', "Semana"),
          day: t('admin.staff_hub.kanban.calendar_views.day', "Día"),
          agenda: t('admin.staff_hub.kanban.calendar_views.agenda', "Agenda"),
          date: t('admin.staff_hub.kanban.calendar_views.date', "Fecha"),
          time: t('admin.staff_hub.kanban.calendar_views.time', "Hora"),
          event: t('admin.staff_hub.kanban.calendar_views.event', "Evento"),
          allDay: t('admin.staff_hub.kanban.calendar_views.all_day', "Todo el día"),
          noEventsInRange: t('admin.staff_hub.kanban.calendar_views.no_events', "No hay tareas en este rango")
        }}
      />
    </div>
  );
}
