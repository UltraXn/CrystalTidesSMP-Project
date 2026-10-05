import React from 'react';
import type { User } from '@supabase/supabase-js';
import Loader from '../../components/UI/Loader';
import './GachaStyles.css';

import { GachaUnauthorized } from './GachaUnauthorized';
import { GachaHeader } from './GachaHeader';
import { GachaRewardsOverlay } from './GachaRewardsOverlay';
import { GachaHistory } from './GachaHistory';
import { GachaTierSelector } from './GachaTierSelector';
import { GachaHeroStage } from './GachaHeroStage';
import { GachaRatesCard } from './GachaRatesCard';
import { useGachaGame } from './useGachaGame';
import { TIER_CLASS_MAP } from './types';
import { DISPLAY_GACHA_TIERS } from './gachaDisplayUtils';
import { RARITY_COLORS, RARITY_ICONS } from './gachaGameUtils';

export const Gacha = () => {
  const {
    authLoading,
    activeUser,
    setMockUser,
    userIsAdmin,
    selectedTier,
    setSelectedTier,
    killuBalance,
    isOpening,
    isCelebrating,
    tierStatus,
    unlockedTiers,
    isDevMode,
    setIsDevMode,
    testForceResult,
    setTestForceResult,
    forceDeduction,
    setForceDeduction,
    showBulkRewards,
    setShowBulkRewards,
    bulkRewards,
    history,
    historyLoading,
    showHistory,
    setShowHistory,
    containerRef,
    devBarRef,
    reelRefs,
    reelItemsSet,
    spinSync,
    rarityRates,
    hasFreeRollForTier,
    handleAddFunds,
    handleOpen,
    fetchHistory,
  } = useGachaGame();

  if (authLoading) {
    return (
      <div className="gacha-page">
        <Loader />
      </div>
    );
  }

  if (!activeUser) {
    return (
      <GachaUnauthorized
        userRole="Guest"
        onMockLogin={(role) => {
          const appMetadata = { role };
          const userMetadata = { role };
          setMockUser({
            id: `mock-${role}-${Date.now()}`,
            email: `mock-${role}@crystaltides.local`,
            app_metadata: appMetadata,
            user_metadata: userMetadata,
          } as unknown as User);
        }}
      />
    );
  }

  return (
    <div
      id="gacha_viewport"
      className={`gacha-page ${TIER_CLASS_MAP[selectedTier.id] || 'tier-1'}`}
      ref={containerRef}
      style={{ '--tier-color': selectedTier.color } as React.CSSProperties}
    >
      <div className="gacha-background">
        <div className="gradient-sphere sphere-1" />
        <div className="gradient-sphere sphere-2" />
      </div>

      <div className="gacha-container">
        <GachaHeader
          canAccessDev={userIsAdmin}
          isDevMode={isDevMode}
          setIsDevMode={setIsDevMode}
          testForceResult={testForceResult}
          setTestForceResult={setTestForceResult}
          forceDeduction={forceDeduction}
          setForceDeduction={setForceDeduction}
          addFunds={handleAddFunds}
          devBarRef={devBarRef}
          GACHA_TIERS={DISPLAY_GACHA_TIERS}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          isOpening={isOpening}
        />

        <GachaTierSelector
          tiers={DISPLAY_GACHA_TIERS}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          isOpening={isOpening}
          userIsAdmin={userIsAdmin}
          unlockedTiers={unlockedTiers}
          tierStatus={tierStatus}
        />

        <div className="gacha-main">
          <GachaHeroStage
            selectedTier={selectedTier}
            isOpening={isOpening}
            isCelebrating={isCelebrating}
            spinSync={spinSync}
            reelItemsSet={reelItemsSet}
            reelRefs={reelRefs}
            killuBalance={killuBalance}
            hasFreeRollForTier={hasFreeRollForTier}
            handleAddFunds={handleAddFunds}
            handleOpen={handleOpen}
          />

          <GachaRatesCard rarityRates={rarityRates} />
        </div>
      </div>

      <GachaRewardsOverlay
        showBulkRewards={showBulkRewards}
        bulkRewards={bulkRewards}
        selectedTier={selectedTier}
        setShowBulkRewards={setShowBulkRewards}
      />

      <GachaHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onOpen={() => {
          setShowHistory(true);
          fetchHistory();
        }}
        history={history}
        loading={historyLoading}
        RARITY_ICONS={RARITY_ICONS}
        RARITY_COLORS={RARITY_COLORS}
        tierColor={selectedTier.color}
      />
    </div>
  );
};

export default Gacha;
