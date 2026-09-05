import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import SocialSidebar from '@/components/Layout/SocialSidebar';
import { renderWithProviders } from '@/utils/test-utils';

describe('SocialSidebar', () => {
    it('renders all external social links with secure attributes', () => {
        renderWithProviders(<SocialSidebar />);

        const twitterLink = screen.getByRole('link', { name: /twitter/i });
        expect(twitterLink).toBeInTheDocument();
        expect(twitterLink).toHaveAttribute('href', 'https://x.com/KilluBysmali');
        expect(twitterLink).toHaveAttribute('target', '_blank');
        expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');

        const discordLink = screen.getByRole('link', { name: /discord/i });
        expect(discordLink).toBeInTheDocument();
        expect(discordLink).toHaveAttribute('href', 'https://discord.com/invite/TDmwYNnvyT');
        expect(discordLink).toHaveAttribute('target', '_blank');
        expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');

        const twitchLink = screen.getByRole('link', { name: /twitch/i });
        expect(twitchLink).toBeInTheDocument();
        expect(twitchLink).toHaveAttribute('href', 'https://www.twitch.tv/killubysmalivt');
        expect(twitchLink).toHaveAttribute('target', '_blank');
        expect(twitchLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
