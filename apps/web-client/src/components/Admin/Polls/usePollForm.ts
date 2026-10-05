import { useState, useCallback } from 'react';
import { Poll } from './types';

export interface PollOptionItem {
  id: string;
  label: string;
  labelEn: string;
}

export interface UsePollFormProps {
  poll?: Poll | null;
  translatedValues: {
    title?: string;
    question?: string;
    option?: { idx: number; val: string };
  };
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    data: {
      title: string;
      titleEn: string;
      question: string;
      questionEn: string;
      options: { label: string; labelEn: string }[];
      daysDuration: number;
    },
  ) => void;
}

function initOptions(poll?: Poll | null): PollOptionItem[] {
  if (poll?.options && poll.options.length > 0) {
    const mapped = poll.options.map((o, i) => ({
      id: `opt-${o.id ?? i}`,
      label: o.label,
      labelEn: o.label_en || '',
    }));
    while (mapped.length < 2) {
      mapped.push({ id: `opt-init-${mapped.length}`, label: '', labelEn: '' });
    }
    return mapped;
  }
  return [
    { id: 'opt-0', label: '', labelEn: '' },
    { id: 'opt-1', label: '', labelEn: '' },
  ];
}

function usePollTranslationSync(
  translatedValues: UsePollFormProps['translatedValues'],
  setTitleEn: React.Dispatch<React.SetStateAction<string>>,
  setQuestionEn: React.Dispatch<React.SetStateAction<string>>,
  setOptions: React.Dispatch<React.SetStateAction<PollOptionItem[]>>,
) {
  const [prevTranslatedValues, setPrevTranslatedValues] = useState(translatedValues);
  if (translatedValues !== prevTranslatedValues) {
    setPrevTranslatedValues(translatedValues);
    if (translatedValues.title && translatedValues.title !== prevTranslatedValues.title) {
      setTitleEn(translatedValues.title);
    }
    if (translatedValues.question && translatedValues.question !== prevTranslatedValues.question) {
      setQuestionEn(translatedValues.question);
    }
    if (
      translatedValues.option &&
      (translatedValues.option.idx !== prevTranslatedValues.option?.idx ||
        translatedValues.option.val !== prevTranslatedValues.option?.val)
    ) {
      const { idx, val } = translatedValues.option;
      setOptions((prev) => {
        if (!prev[idx]) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], labelEn: val };
        return copy;
      });
    }
  }
}

function usePollOptions(poll?: Poll | null) {
  const [options, setOptions] = useState<PollOptionItem[]>(() => initOptions(poll));

  const updateOption = useCallback((idx: number, field: 'label' | 'labelEn', val: string) => {
    setOptions((prev) => {
      const newOpts = [...prev];
      newOpts[idx] = { ...newOpts[idx], [field]: val };
      return newOpts;
    });
  }, []);

  const removeOption = useCallback((idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const addOption = useCallback(() => {
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}-${prev.length}`, label: '', labelEn: '' },
    ]);
  }, []);

  return { options, setOptions, updateOption, removeOption, addOption };
}

export function usePollForm({ poll, translatedValues, onSubmit }: UsePollFormProps) {
  const [prevPoll, setPrevPoll] = useState(poll);
  const [title, setTitle] = useState(() => poll?.title || '');
  const [titleEn, setTitleEn] = useState(() => poll?.title_en || '');
  const [question, setQuestion] = useState(() => poll?.question || '');
  const [questionEn, setQuestionEn] = useState(() => poll?.question_en || '');
  const [daysDuration, setDaysDuration] = useState(7);
  const { options, setOptions, updateOption, removeOption, addOption } = usePollOptions(poll);

  // Sync state if poll prop changes
  if (poll !== prevPoll) {
    setPrevPoll(poll);
    setTitle(poll?.title || '');
    setTitleEn(poll?.title_en || '');
    setQuestion(poll?.question || '');
    setQuestionEn(poll?.question_en || '');
    setOptions(initOptions(poll));
  }

  // Translation sync during render
  usePollTranslationSync(translatedValues, setTitleEn, setQuestionEn, setOptions);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e, {
        title,
        titleEn,
        question,
        questionEn,
        options: options.map(({ label, labelEn }) => ({ label, labelEn })),
        daysDuration,
      });
    },
    [daysDuration, onSubmit, options, question, questionEn, title, titleEn],
  );

  return {
    title,
    setTitle,
    titleEn,
    setTitleEn,
    question,
    setQuestion,
    questionEn,
    setQuestionEn,
    options,
    daysDuration,
    setDaysDuration,
    updateOption,
    removeOption,
    addOption,
    handleSubmit,
  };
}
