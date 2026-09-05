import type { Meta, StoryObj } from '@storybook/react';
import AboutRolesSkeleton from '../../components/Home/skeletons/AboutRolesSkeleton';
import BlogSkeleton from '../../components/Home/skeletons/BlogSkeleton';
import ContestsSkeleton from '../../components/Home/skeletons/ContestsSkeleton';
import DonorsSkeleton from '../../components/Home/skeletons/DonorsSkeleton';
import RulesSkeleton from '../../components/Home/skeletons/RulesSkeleton';
import ServerHistorySkeleton from '../../components/Home/skeletons/ServerHistorySkeleton';
import StaffShowcaseSkeleton from '../../components/Home/skeletons/StaffShowcaseSkeleton';
import StatusSkeleton from '../../components/Home/skeletons/StatusSkeleton';
import StoriesSkeleton from '../../components/Home/skeletons/StoriesSkeleton';
import SuggestionsSkeleton from '../../components/Home/skeletons/SuggestionsSkeleton';

const meta: Meta = {
  title: 'Home/Skeletons',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

export const AllSkeletonsShowcase: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Staff Showcase Skeleton</h3>
        <StaffShowcaseSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>About Roles Skeleton</h3>
        <AboutRolesSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Server History Skeleton</h3>
        <ServerHistorySkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Status & Stats Skeleton</h3>
        <StatusSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Donors Skeleton</h3>
        <DonorsSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Blog News Skeleton</h3>
        <BlogSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Contests Skeleton</h3>
        <ContestsSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Suggestions Skeleton</h3>
        <SuggestionsSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Community Stories Skeleton</h3>
        <StoriesSkeleton />
      </div>
      <div>
        <h3 style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Rules Skeleton</h3>
        <RulesSkeleton />
      </div>
    </div>
  )
};

export const StaffShowcaseOnly: StoryObj = {
  render: () => <StaffShowcaseSkeleton />
};

export const AboutRolesOnly: StoryObj = {
  render: () => <AboutRolesSkeleton />
};

export const ServerHistoryOnly: StoryObj = {
  render: () => <ServerHistorySkeleton />
};
