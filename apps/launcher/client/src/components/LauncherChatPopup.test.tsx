import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LauncherChatPopup } from './LauncherChatPopup';

const mockFriend: FriendEntry = {
  id: '1',
  name: 'John Doe',
  avatar: 'https://example.com/avatar.jpg',
  status: 'Online',
};

const mockMessages: ChatMessage[] = [
  { id: '1', sender: 'me', text: 'Hello', time: '10:00' },
  { id: '2', sender: 'friend', text: 'Hi', time: '10:01' },
];

const mockChatInput = 'Hello, friend!';

describe('LauncherChatPopup', () => {
  let onChatInputChange: jest.Mock;
  let onSendMessage: jest.Mock;
  let onCloseChat: jest.Mock;

  beforeEach(() => {
    onChatInputChange = vi.fn();
    onSendMessage = vi.fn();
    onCloseChat = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the chat popup with correct styles', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    const popup = screen.getByRole('dialog');
    expect(popup).toHaveStyle('position: absolute');
    expect(popup).toHaveStyle('bottom: 16px');
    expect(popup).toHaveStyle('right: 345px');
    expect(popup).toHaveStyle('width: 290px');
    expect(popup).toHaveStyle('height: 320px');
    expect(popup).toHaveStyle('backgroundColor: #080c14');
  });

  it('renders the friend name and status correctly', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders the close button and calls onCloseChat when clicked', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onCloseChat).toHaveBeenCalled();
  });

  it('renders the message thread with correct messages', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('renders the input form and updates chatInput on change', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New message' } });
    expect(onChatInputChange).toHaveBeenCalledWith('New message');
  });

  it('submits the form and calls onSendMessage', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    const form = screen.getByRole('form');
    fireEvent.submit(form);
    expect(onSendMessage).toHaveBeenCalled();
  });

  it('handles empty messages gracefully', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={[]}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('Hi')).not.toBeInTheDocument();
  });

  it('handles undefined friend gracefully', () => {
    render(
      <LauncherChatPopup
        friend={undefined}
        messages={mockMessages}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('handles undefined messages gracefully', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={undefined}
        chatInput={mockChatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('Hi')).not.toBeInTheDocument();
  });

  it('handles undefined chatInput gracefully', () => {
    render(
      <LauncherChatPopup
        friend={mockFriend}
        messages={mockMessages}
        chatInput={undefined}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onCloseChat={onCloseChat}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });
});
