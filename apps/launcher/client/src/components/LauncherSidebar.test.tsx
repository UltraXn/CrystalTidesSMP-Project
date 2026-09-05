import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LauncherSidebar } from './LauncherSidebar';
import { House, User, Bell, MessageSquare, Layers, Globe, Crop, ShoppingCart, Settings, UserCog } from 'lucide';

describe('LauncherSidebar', () => {
  const mockOnSelectNav = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the logo correctly', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const logo = screen.getByAltText('Crystal Tides');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
    expect(logo).toHaveStyle('width: 42px; height: 42px; object-fit: contain;');
  });

  it('renders the correct number of buttons', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('calls onSelectNav with "home" when home button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('home');
  });

  it('calls onSelectNav with "locker" when locker button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const lockerButton = screen.getByTitle('Locker');
    fireEvent.click(lockerButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('locker');
  });

  it('calls onSelectNav with "notifications" when notifications button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const notificationsButton = screen.getByTitle('Notifications');
    fireEvent.click(notificationsButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('notifications');
  });

  it('calls onSelectNav with "chat" when chat button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const chatButton = screen.getByTitle('Messages');
    fireEvent.click(chatButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('chat');
  });

  it('calls onSelectNav with "versions" when versions button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const versionsButton = screen.getByTitle('Versions');
    fireEvent.click(versionsButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('versions');
  });

  it('calls onSelectNav with "servers" when servers button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const serversButton = screen.getByTitle('Servers');
    fireEvent.click(serversButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('servers');
  });

  it('calls onSelectNav with "gallery" when gallery button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const galleryButton = screen.getByTitle('Gallery');
    fireEvent.click(galleryButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('gallery');
  });

  it('calls onSelectNav with "store" when store button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const storeButton = screen.getByTitle('Store');
    fireEvent.click(storeButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('store');
  });

  it('calls onSelectNav with "profiles" when profiles button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const profilesButton = screen.getByTitle('Cuentas & Sesión');
    fireEvent.click(profilesButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('profiles');
  });

  it('calls onSelectNav with "settings" when settings button is clicked', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);
    expect(mockOnSelectNav).toHaveBeenCalledWith('settings');
  });

  it('renders home button with active styles when activeNav is "home"', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={mockOnSelectNav} />);
    const homeButton = screen.getByTitle('Home');
    expect(homeButton).toHaveStyle('border: 1px solid #121620; background-color: #0D1017; color: #2DD4BF; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);');
  });

  it('renders home button with inactive styles when activeNav is not "home"', () => {
    render(<LauncherSidebar activeNav="locker" onSelectNav={mockOnSelectNav} />);
    const homeButton = screen.getByTitle('Home');
    expect(homeButton).toHaveStyle('border: 1px solid transparent; background-color: transparent; color: #94A3B8; box-shadow: none;');
  });

  it('renders locker button with amber dot when activeNav is "locker"', () => {
    render(<LauncherSidebar activeNav="locker" onSelectNav={mockOnSelectNav} />);
    const lockerButton = screen.getByTitle('Locker');
    const dot = lockerButton.querySelector('span');
    expect(dot).toHaveStyle('background-color: #F2B82E; box-shadow: 0 0 6px rgba(242, 184, 46, 0.8);');
  });

  it('renders gallery button with red dot when activeNav is "gallery"', () => {
    render(<LauncherSidebar activeNav="gallery" onSelectNav={mockOnSelectNav} />);
    const galleryButton = screen.getByTitle('Gallery');
    const dot = galleryButton.querySelector('span');
    expect(dot).toHaveStyle('background-color: #EF4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);');
  });

  it('renders store button with red dot when activeNav is "store"', () => {
    render(<LauncherSidebar activeNav="store" onSelectNav={mockOnSelectNav} />);
    const storeButton = screen.getByTitle('Store');
    const dot = storeButton.querySelector('span');
    expect(dot).toHaveStyle('background-color: #EF4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);');
  });

  it('handles boundary case where activeNav is undefined', () => {
    render(<LauncherSidebar activeNav={undefined} onSelectNav={mockOnSelectNav} />);
    const homeButton = screen.getByTitle('Home');
    expect(homeButton).toHaveStyle('border: 1px solid transparent; background-color: transparent; color: #94A3B8; box-shadow: none;');
  });

  it('handles boundary case where activeNav is null', () => {
    render(<LauncherSidebar activeNav={null} onSelectNav={mockOnSelectNav} />);
    const homeButton = screen.getByTitle('Home');
    expect(homeButton).toHaveStyle('border: 1px solid transparent; background-color: transparent; color: #94A3B8; box-shadow: none;');
  });

  it('handles boundary case where onSelectNav is undefined', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={undefined} />);
    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);
    expect(mockOnSelectNav).not.toHaveBeenCalled();
  });

  it('handles boundary case where onSelectNav is null', () => {
    render(<LauncherSidebar activeNav="home" onSelectNav={null} />);
    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);
    expect(mockOnSelectNav).not.toHaveBeenCalled();
  });
});
