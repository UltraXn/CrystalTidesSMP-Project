import { useState, useId } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { BarChart3, X, Plus, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { uploadImage } from '../services/uploadService';
import Section from '../components/Layout/Section';
import { useTranslation } from 'react-i18next';

interface PendingImage {
  blob: Blob;
  preview: string;
  name: string;
}

interface PollOptionItem {
  id: string;
  text: string;
}

interface CategoryOption {
  value: string;
  labelKey: string;
}

interface AuthUserData {
  id?: string;
  email?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
    role?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL;
const MAX_IMAGE_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const WEBP_QUALITY = 0.8;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const UI_COLORS = {
  darkBg: '#222',
  lightText: '#fff',
  mutedText: '#ccc',
  subtleMuted: '#aaa',
  borderMuted: '1px solid #444',
  borderInput: '1px solid #555',
  inputBg: 'rgba(255,255,255,0.05)',
  accent: 'var(--accent)',
  danger: '#ef4444',
} as const;

const CATEGORIES: readonly CategoryOption[] = [
  { value: '2', labelKey: 'forum_page.categories.general.title' },
  { value: '3', labelKey: 'forum_page.categories.support.title' },
  { value: '4', labelKey: 'forum_page.categories.offtopic.title' },
] as const;

const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxSize: number,
): { width: number; height: number } => {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round((originalHeight * maxSize) / originalWidth),
    };
  }

  return {
    width: Math.round((originalWidth * maxSize) / originalHeight),
    height: maxSize,
  };
};

const compressImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = calculateScaledDimensions(
      bitmap.width,
      bitmap.height,
      MAX_IMAGE_DIMENSION,
    );

    canvas.width = width;
    canvas.height = height;

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/webp',
        WEBP_QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
};

interface BuildPollParams {
  showPoll: boolean;
  isDiscordPoll: boolean;
  pollQuestion: string;
  pollOptions: PollOptionItem[];
  discordLink: string;
}

const buildPollPayload = ({
  showPoll,
  isDiscordPoll,
  pollQuestion,
  pollOptions,
  discordLink,
}: BuildPollParams) => {
  if (!showPoll) return null;

  const closesAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

  if (isDiscordPoll) {
    return {
      enabled: true,
      question: 'Encuesta de Discord',
      options: [] as string[],
      discord_link: discordLink,
      closes_at: closesAt,
    };
  }

  return {
    enabled: true,
    question: pollQuestion,
    options: pollOptions.map((o) => o.text).filter((t) => t.trim() !== ''),
    discord_link: null,
    closes_at: closesAt,
  };
};

const createThreadPayload = (
  categoryId: string,
  title: string,
  content: string,
  _user: AuthUserData | null,
  pollData: ReturnType<typeof buildPollPayload>,
) => {
  return {
    category_id: Number.parseInt(categoryId, 10),
    title,
    content,
    poll_data: pollData,
  };
};

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface CategoryPickerProps {
  value: string;
  onChange: (val: string) => void;
}

function CategoryPicker({ value, onChange }: Readonly<CategoryPickerProps>) {
  const { t } = useTranslation();

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="thread-category"
        className="form-label"
        style={{ display: 'block', marginBottom: '0.5rem', color: UI_COLORS.mutedText }}
      >
        {t('create_thread.form.category')}
      </label>
      <select
        id="thread-category"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.8rem',
          background: UI_COLORS.darkBg,
          color: UI_COLORS.lightText,
          border: UI_COLORS.borderMuted,
          borderRadius: '6px',
        }}
      >
        {CATEGORIES.map((cat) => (
          <option
            key={cat.value}
            value={cat.value}
            style={{ background: UI_COLORS.darkBg, color: UI_COLORS.lightText }}
          >
            {t(cat.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ImagePreviewProps {
  pendingImage: PendingImage;
  onRemove: () => void;
}

function ImagePreview({ pendingImage, onRemove }: Readonly<ImagePreviewProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${UI_COLORS.accent}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={pendingImage.preview}
          alt="Preview"
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
        />
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: UI_COLORS.lightText,
            }}
          >
            {t('create_thread.form.image_attached')}
          </span>
          <span style={{ fontSize: '0.8rem', color: UI_COLORS.mutedText }}>
            {t('create_thread.form.upload_preview_hint')}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          color: UI_COLORS.danger,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <X size={16} /> {t('create_thread.form.remove_image')}
      </button>
    </div>
  );
}

interface MarkdownContentEditorProps {
  content: string;
  onChangeContent: (val: string) => void;
  pendingImage: PendingImage | null;
  onSelectImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

function MarkdownContentEditor({
  content,
  onChangeContent,
  pendingImage,
  onSelectImage,
  onRemoveImage,
}: Readonly<MarkdownContentEditorProps>) {
  const { t } = useTranslation();

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <div
        className="form-label"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          color: UI_COLORS.mutedText,
        }}
      >
        <label htmlFor="create-thread-content">{t('create_thread.form.content')}</label>
        {!pendingImage && (
          <label
            className="btn-secondary"
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ImageIcon size={14} /> {t('create_thread.form.attach_image')}
            <input
              aria-label={t('create_thread.form.attach_image', 'Adjuntar imagen')}
              type="file"
              accept="image/*"
              onChange={onSelectImage}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>
      <textarea
        id="create-thread-content"
        className="form-input"
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder={t('create_thread.form.content_placeholder')}
        required
        rows={8}
        style={{
          width: '100%',
          padding: '0.8rem',
          background: UI_COLORS.inputBg,
          color: UI_COLORS.lightText,
          border: UI_COLORS.borderMuted,
          borderRadius: '6px',
          resize: 'vertical',
        }}
      />
      {pendingImage && <ImagePreview pendingImage={pendingImage} onRemove={onRemoveImage} />}
    </div>
  );
}

interface DiscordPollInputProps {
  discordLink: string;
  onChangeDiscordLink: (val: string) => void;
}

function DiscordPollInput({ discordLink, onChangeDiscordLink }: Readonly<DiscordPollInputProps>) {
  const { t } = useTranslation();

  return (
    <div>
      <label
        htmlFor="thread-discord-link"
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          color: UI_COLORS.subtleMuted,
        }}
      >
        {t('create_thread.form.discord_link_label')}
      </label>
      <input
        id="thread-discord-link"
        value={discordLink}
        onChange={(e) => onChangeDiscordLink(e.target.value)}
        placeholder="https://discord.com/channels/..."
        style={{
          width: '100%',
          padding: '0.7rem',
          background: UI_COLORS.darkBg,
          border: UI_COLORS.borderInput,
          color: UI_COLORS.lightText,
          borderRadius: '4px',
        }}
      />
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
        {t('create_thread.form.discord_hint')}
      </p>
    </div>
  );
}

interface StandardPollInputProps {
  pollQuestion: string;
  onChangePollQuestion: (val: string) => void;
  pollOptions: PollOptionItem[];
  onUpdateOption: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
}

function StandardPollInput({
  pollQuestion,
  onChangePollQuestion,
  pollOptions,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}: Readonly<StandardPollInputProps>) {
  const { t } = useTranslation();

  return (
    <div>
      <label
        htmlFor="thread-poll-question"
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          color: UI_COLORS.subtleMuted,
        }}
      >
        {t('create_thread.form.poll_question')}
      </label>
      <input
        id="thread-poll-question"
        value={pollQuestion}
        onChange={(e) => onChangePollQuestion(e.target.value)}
        placeholder="¿Pregunta?"
        style={{
          width: '100%',
          padding: '0.7rem',
          background: UI_COLORS.darkBg,
          border: UI_COLORS.borderInput,
          color: UI_COLORS.lightText,
          borderRadius: '4px',
          marginBottom: '1rem',
        }}
      />

      <div
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          color: UI_COLORS.subtleMuted,
        }}
      >
        {t('create_thread.form.options')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {pollOptions.map((opt, idx) => (
          <div key={opt.id} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              aria-label={`Opción ${idx + 1}`}
              value={opt.text}
              onChange={(e) => onUpdateOption(opt.id, e.target.value)}
              placeholder={`Opción ${idx + 1}`}
              style={{
                flexGrow: 1,
                padding: '0.6rem',
                background: UI_COLORS.darkBg,
                border: UI_COLORS.borderInput,
                color: UI_COLORS.lightText,
                borderRadius: '4px',
              }}
            />
            {pollOptions.length > 2 && (
              <button
                aria-label={t('common.delete', 'Eliminar')}
                type="button"
                onClick={() => onRemoveOption(opt.id)}
                className="btn-icon delete"
                style={{
                  background: '#333',
                  border: 'none',
                  color: UI_COLORS.danger,
                  cursor: 'pointer',
                  padding: '0 1rem',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddOption}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
        >
          <Plus size={14} /> {t('create_thread.form.add_option')}
        </button>
      </div>
    </div>
  );
}

interface PollManagerProps {
  showPoll: boolean;
  onToggleShowPoll: () => void;
  isDiscordPoll: boolean;
  onToggleDiscordPoll: (checked: boolean) => void;
  discordLink: string;
  onChangeDiscordLink: (val: string) => void;
  pollQuestion: string;
  onChangePollQuestion: (val: string) => void;
  pollOptions: PollOptionItem[];
  onUpdateOption: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
}

function PollManager({
  showPoll,
  onToggleShowPoll,
  isDiscordPoll,
  onToggleDiscordPoll,
  discordLink,
  onChangeDiscordLink,
  pollQuestion,
  onChangePollQuestion,
  pollOptions,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}: Readonly<PollManagerProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        border: showPoll ? `1px solid ${UI_COLORS.accent}` : '1px dashed #444',
      }}
    >
      <button
        type="button"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'inherit',
          font: 'inherit',
          color: 'inherit',
        }}
        onClick={onToggleShowPoll}
      >
        <h4
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: showPoll ? UI_COLORS.accent : UI_COLORS.subtleMuted,
          }}
        >
          <BarChart3 size={18} /> {t('create_thread.form.add_poll')}
        </h4>
        <div
          className={`checkbox ${showPoll ? 'active' : ''}`}
          style={{
            width: '20px',
            height: '20px',
            border: '1px solid #666',
            borderRadius: '4px',
            background: showPoll ? UI_COLORS.accent : 'transparent',
          }}
        >
          {showPoll && <CheckCircle2 size={14} color="#000" style={{ margin: '2px' }} />}
        </div>
      </button>

      {showPoll && (
        <div
          style={{ marginTop: '1.5rem', borderTop: UI_COLORS.borderMuted, paddingTop: '1.5rem' }}
        >
          <div
            style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type="checkbox"
              checked={isDiscordPoll}
              onChange={(e) => onToggleDiscordPoll(e.target.checked)}
              id="discordCheck"
            />
            <label
              htmlFor="discordCheck"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: isDiscordPoll ? '#5865F2' : UI_COLORS.mutedText,
              }}
            >
              <DiscordIcon /> {t('create_thread.form.discord_poll')}
            </label>
          </div>

          {isDiscordPoll ? (
            <DiscordPollInput discordLink={discordLink} onChangeDiscordLink={onChangeDiscordLink} />
          ) : (
            <StandardPollInput
              pollQuestion={pollQuestion}
              onChangePollQuestion={onChangePollQuestion}
              pollOptions={pollOptions}
              onUpdateOption={onUpdateOption}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function CreateThread() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const baseOptId = useId();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('2');

  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOptionItem[]>([
    { id: `${baseOptId}-opt-1`, text: 'Si' },
    { id: `${baseOptId}-opt-2`, text: 'No' },
  ]);
  const [discordLink, setDiscordLink] = useState('');
  const [isDiscordPoll, setIsDiscordPoll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);

  const handleImageSelection = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      alert('La imagen es demasiado pesada. Máximo 20MB.');
      return;
    }

    try {
      const compressedBlob = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressedBlob);

      setPendingImage({
        blob: compressedBlob,
        preview: previewUrl,
        name: file.name,
      });
      e.target.value = '';
    } catch (error) {
      console.error('Compression Error:', error);
      alert('Error al procesar la imagen.');
    }
  };

  const clearPendingImage = () => {
    if (pendingImage?.preview) {
      URL.revokeObjectURL(pendingImage.preview);
    }
    setPendingImage(null);
  };

  const uploadPendingImage = async (): Promise<string | null> => {
    if (!pendingImage) return null;
    return await uploadImage(pendingImage.blob, 'forum-uploads');
  };

  const updateOption = (id: string, text: string) => {
    setPollOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const addOption = () => {
    setPollOptions((prev) => [
      ...prev,
      { id: `${baseOptId}-opt-${Date.now()}-${prev.length}`, text: '' },
    ]);
  };

  const removeOption = (id: string) => {
    setPollOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  const executeThreadCreation = async () => {
    let finalContent = content;

    if (pendingImage) {
      const imageUrl = await uploadPendingImage();
      if (imageUrl) {
        finalContent += `\n\n![Imagen](${imageUrl})`;
      }
    }

    const pollData = buildPollPayload({
      showPoll,
      isDiscordPoll,
      pollQuestion,
      pollOptions,
      discordLink,
    });

    const body = createThreadPayload(categoryId, title, finalContent, user, pollData);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(`${API_URL}/forum/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data: { id: string | number } = await res.json();
      navigate(`/forum/thread/topic/${data.id}`);
    } else {
      alert(t('create_thread.form.error_create'));
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!user) {
      alert(t('create_thread.form.error_login'));
      return;
    }

    setSubmitting(true);
    try {
      await executeThreadCreation();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Error al crear el tema o subir la imagen: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section title={t('create_thread.title')}>
      <Section>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(0,0,0,0.4)',
            padding: '2rem',
            borderRadius: '12px',
          }}
        >
          <CategoryPicker value={categoryId} onChange={setCategoryId} />

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="thread-title"
              className="form-label"
              style={{ display: 'block', marginBottom: '0.5rem', color: UI_COLORS.mutedText }}
            >
              {t('create_thread.form.title')}
            </label>
            <input
              id="thread-title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('create_thread.form.title_placeholder')}
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                background: UI_COLORS.inputBg,
                color: UI_COLORS.lightText,
                border: UI_COLORS.borderMuted,
                borderRadius: '6px',
              }}
            />
          </div>

          <MarkdownContentEditor
            content={content}
            onChangeContent={setContent}
            pendingImage={pendingImage}
            onSelectImage={handleImageSelection}
            onRemoveImage={clearPendingImage}
          />

          <PollManager
            showPoll={showPoll}
            onToggleShowPoll={() => setShowPoll(!showPoll)}
            isDiscordPoll={isDiscordPoll}
            onToggleDiscordPoll={setIsDiscordPoll}
            discordLink={discordLink}
            onChangeDiscordLink={setDiscordLink}
            pollQuestion={pollQuestion}
            onChangePollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            onUpdateOption={updateOption}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={submitting}
          >
            {submitting ? t('create_thread.form.submitting') : t('create_thread.form.submit')}
          </button>
        </form>
      </Section>
    </Section>
  );
}
