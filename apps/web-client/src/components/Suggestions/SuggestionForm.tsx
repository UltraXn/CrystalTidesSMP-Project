import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createSuggestionSchema, type CreateSuggestionFormValues } from '../../schemas/suggestion';
import NicknameAvatar from './NicknameAvatar';
import { API_URL, JSON_HEADERS, SELECT_OPTION_CLASS } from './constants';
import { nextTempSuggestionId } from './utils';
import type { FormStatus, SuggestionApiResponse, SuggestionItem } from './types';

interface SuggestionFormProps {
  onSuggestionCreated: (newSuggestion: SuggestionItem) => void;
}

function SuggestionSuccessCard({
  onReset,
  receivedText,
  successMsgText,
  sendAnotherText,
}: Readonly<{
  onReset: () => void;
  receivedText: string;
  successMsgText: string;
  sendAnotherText: string;
}>) {
  return (
    <div className="py-10 text-center">
      <CheckCircle size={60} className="mx-auto mb-6 animate-bounce text-emerald-400" />
      <h4 className="mb-3 text-3xl font-black uppercase tracking-tight text-white">
        {receivedText}
      </h4>
      <p className="mx-auto mb-8 max-w-md font-medium leading-relaxed text-gray-400">
        {successMsgText}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="hover:bg-(--accent) rounded-full bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-105 active:scale-95"
      >
        {sendAnotherText}
      </button>
    </div>
  );
}

export default function SuggestionForm({ onSuggestionCreated }: Readonly<SuggestionFormProps>) {
  const { t } = useTranslation();
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rewardSuccessMsg, setRewardSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateSuggestionFormValues>({
    resolver: zodResolver(createSuggestionSchema),
    defaultValues: {
      nickname: '',
      type: 'General',
      message: '',
    },
  });

  const watchNickname = useWatch({ control, name: 'nickname', defaultValue: '' });

  const handleResetForm = () => {
    setFormStatus('idle');
    setValidationError(null);
    setRewardSuccessMsg(null);
  };

  const onSubmit = async (data: CreateSuggestionFormValues) => {
    setFormStatus('sending');
    setValidationError(null);
    setRewardSuccessMsg(null);

    try {
      const res = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data),
      });

      const json: SuggestionApiResponse = await res.json();

      if (res.ok && !json.error) {
        setFormStatus('success');
        setRewardSuccessMsg(
          json.kc_awarded
            ? `🤖 ¡Propuesta validada por la IA! Recompensado con +${json.kc_awarded} KilluCoins 🎉`
            : '¡Sugerencia enviada con éxito!',
        );

        const newSuggestion: SuggestionItem = {
          id: json.id || nextTempSuggestionId(),
          nickname: data.nickname || 'Anónimo',
          type: data.type,
          message: data.message,
          created_at: new Date().toISOString(),
          upvotes: 1,
          downvotes: 0,
        };

        onSuggestionCreated(newSuggestion);
        reset();
      } else {
        setFormStatus('error');
        setValidationError(json.error || 'No se pudo enviar la sugerencia.');
      }
    } catch {
      setFormStatus('error');
      setValidationError('Error de conexión al servidor.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex size-12 items-center justify-center rounded-2xl border text-xl">
          <Send />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
          {t('suggestions.form_title')}
        </h3>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
        {formStatus === 'success' ? (
          <SuggestionSuccessCard
            onReset={handleResetForm}
            receivedText={t('suggestions.form.received')}
            successMsgText={t('suggestions.form.success_msg')}
            sendAnotherText={t('suggestions.form.send_another')}
          />
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="focus-within:border-(--accent) flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <NicknameAvatar nickname={watchNickname} />
                </div>
                <div className="flex grow flex-col">
                  <label
                    htmlFor="suggestion-nickname"
                    className="text-[9px] font-black uppercase tracking-widest text-gray-500"
                  >
                    {t('suggestions.form.nick')}
                  </label>
                  <input
                    id="suggestion-nickname"
                    type="text"
                    className="mt-0.5 w-full bg-transparent text-sm font-bold text-white placeholder:text-white/20 focus:outline-none"
                    placeholder={t('suggestions.form.nick_placeholder')}
                    {...register('nickname')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="suggestion-type"
                  className="mb-1 ml-4 text-[9px] font-black uppercase tracking-widest text-gray-500"
                >
                  {t('suggestions.form.type')}
                </label>
                <select
                  id="suggestion-type"
                  className="focus:border-(--accent) h-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-sm font-bold text-white transition-colors focus:outline-none"
                  {...register('type')}
                >
                  <option value="General" className={SELECT_OPTION_CLASS}>
                    {t('suggestions.form.options.general')}
                  </option>
                  <option value="Bug" className={SELECT_OPTION_CLASS}>
                    {t('suggestions.form.options.bug')}
                  </option>
                  <option value="Mod" className={SELECT_OPTION_CLASS}>
                    {t('suggestions.form.options.mod')}
                  </option>
                  <option value="Complaint" className={SELECT_OPTION_CLASS}>
                    {t('suggestions.form.options.complaint')}
                  </option>
                  <option value="Poll" className={SELECT_OPTION_CLASS}>
                    {t('suggestions.form.options.poll')}
                  </option>
                </select>
              </div>
            </div>

            {errors.nickname && (
              <span className="-mt-3 ml-4 text-[10px] font-bold uppercase text-red-500">
                {errors.nickname.message}
              </span>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="suggestion-message"
                className="ml-4 text-[9px] font-black uppercase tracking-widest text-gray-500"
              >
                {t('suggestions.form.msg')}
              </label>
              <textarea
                id="suggestion-message"
                className="focus:border-(--accent) min-h-37.5 resize-none rounded-3xl border border-white/10 bg-black/20 px-6 py-4 text-sm/relaxed font-medium text-white transition-colors placeholder:text-white/10 focus:outline-none"
                placeholder={t('suggestions.form.msg_placeholder')}
                {...register('message')}
              />
              {errors.message && (
                <span className="ml-4 text-[10px] font-bold uppercase text-red-500">
                  {errors.message.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="hover:bg-(--accent) mt-2 rounded-2xl bg-white py-5 font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              disabled={isSubmitting || formStatus === 'sending'}
            >
              {isSubmitting || formStatus === 'sending' ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" /> Validando propuesta por IA...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Send className="text-xs" /> {t('suggestions.form.submit')}
                </span>
              )}
            </button>

            {rewardSuccessMsg && (
              <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-emerald-400">
                {rewardSuccessMsg}
              </p>
            )}

            {formStatus === 'error' && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-red-400">
                {validationError || t('suggestions.form.error_msg')}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
