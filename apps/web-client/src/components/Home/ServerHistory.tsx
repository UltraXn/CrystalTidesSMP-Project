import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { History } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import { StageSelectionTabs } from './ServerHistory/StageSelectionTabs';
import { Stage1Card } from './ServerHistory/Stage1Card';
import { Stage2Card } from './ServerHistory/Stage2Card';
import { Stage3Card } from './ServerHistory/Stage3Card';
import { Stage4Card } from './ServerHistory/Stage4Card';
import { StageSkeletonFallback } from './ServerHistory/StageSkeletons';
import { getServerHistoryStages, STAGE_FLOATING_ITEMS } from './ServerHistory/serverHistoryData';

export default function ServerHistory() {
  const { t } = useTranslation();
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [showWitherVideo, setShowWitherVideo] = useState<boolean>(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  const handleStageSelect = (stageId: number) => {
    if (stageId === activeStageId) return;
    setIsTabLoading(true);
    setActiveStageId(stageId);
    setTimeout(() => setIsTabLoading(false), 600);
  };

  const stages = getServerHistoryStages(t);
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];
  const currentFloatingItems = STAGE_FLOATING_ITEMS[activeStageId] || [];

  return (
    <Section id="history" className="relative overflow-x-clip pb-16 pt-12">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="bg-linear-to-b via-[#00e5ff]/8 h-[800px] w-[1100px] rounded-full from-[#89d9d1]/15 to-transparent blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#00e5ff] backdrop-blur-md">
            <History className="size-3.5" />
            <span>{t('history_section.badge', 'NUESTRA HISTORIA')}</span>
          </div>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('history_section.title', 'Historia de CrystalTides SMP')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-gray-400 sm:text-base">
            {t(
              'history_section.desc',
              'De una pequeña pecerita entre amigos a una red comunitaria dedicada.',
            )}
          </p>
        </div>

        {/* Stage Selection Navigation */}
        <StageSelectionTabs
          stages={stages}
          activeStageId={activeStageId}
          onSelectStage={handleStageSelect}
        />

        {/* Content Skeleton & Animated Stage Cards */}
        <Skeleton
          name={`server-history-stage-${activeStageId}`}
          loading={isTabLoading}
          fallback={<StageSkeletonFallback stageId={activeStageId} />}
          animate="shimmer"
          color="#1a1a2e"
          darkColor="#0f0f1a"
          transition={300}
        >
          <AnimatePresence mode="wait">
            {activeStageId === 1 && (
              <motion.div
                key={1}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage1Card stage={activeStage} floatingItems={currentFloatingItems} />
              </motion.div>
            )}
            {activeStageId === 2 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage2Card stage={activeStage} floatingItems={currentFloatingItems} />
              </motion.div>
            )}
            {activeStageId === 3 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage3Card
                  stage={activeStage}
                  floatingItems={currentFloatingItems}
                  setShowWitherVideo={setShowWitherVideo}
                  setSelectedPhotoModal={setSelectedPhotoModal}
                  showWitherVideo={showWitherVideo}
                  selectedPhotoModal={selectedPhotoModal}
                />
              </motion.div>
            )}
            {activeStageId === 4 && (
              <motion.div
                key={4}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage4Card stage={activeStage} floatingItems={currentFloatingItems} />
              </motion.div>
            )}
          </AnimatePresence>
        </Skeleton>
      </div>
    </Section>
  );
}
