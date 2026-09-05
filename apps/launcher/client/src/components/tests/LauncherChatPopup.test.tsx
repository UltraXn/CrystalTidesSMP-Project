import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LauncherChatPopup from '../LauncherChatPopup';

const mockFriend: FriendEntry = {
  name: 'John Doe',
  avatar: 'avatar.jpg',
  status: 'Online',
};

const mockMessages: ChatMessage[] = [
  { sender: 'me', text: 'Hello', time: '10:00' },
  { sender: 'friend', text: 'Hi', time: '10:01' },
];

const mockChatInput = 'Hello, John!';

const mockOnChatInputChange = vi.fn();
const mockOnSendMessage = vi.fn();
const mockOnCloseChat = vi.fn();

describe('LauncherChatPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the chat popup with correct friend information', () => {
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it('renders the correct messages', () => {
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    expect(screen.getByText(/hi/i)).toBeInTheDocument();
  });

  it('renders the chat input with the correct value', () => {
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    expect(screen.getByRole('textbox')).toHaveValue(mockChatInput);
  });

  it('calls onChatInputChange when chat input changes', async () => {
    const user = userEvent.setup();
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    await user.type(screen.getByRole('textbox'), ' new message');
    expect(mockOnChatInputChange).toHaveBeenCalledWith('Hello, John! new message');
  });

  it('calls onSendMessage when form is submitted', async () => {
    const user = userEvent.setup();
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(mockOnSendMessage).toHaveBeenCalled();
  });

  it('calls onCloseChat when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnCloseChat).toHaveBeenCalled();
  });

  it('renders correctly when messages are empty', () => {
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={[]}
      chatInput={mockChatInput}
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hi/i)).not.toBeInTheDocument();
  });

  it('renders correctly when chat input is empty', () => {
    render(<LauncherChatPopup
      friend={mockFriend}
      messages={mockMessages}
      chatInput=""
      onChatInputChange={mockOnChatInputChange}
      onSendMessage={mockOnSendMessage}
      onCloseChat={mockOnCloseChat}
    />);

    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
