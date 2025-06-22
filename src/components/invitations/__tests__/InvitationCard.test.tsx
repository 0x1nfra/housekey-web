import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InvitationCard from '../InvitationCard';
import { HubInvitation } from '../../../types/invitation';

const mockInvitation: HubInvitation = {
  id: '1',
  hub_id: 'hub-1',
  hub_name: 'Test Family Hub',
  inviter_id: 'user-1',
  inviter_name: 'John Doe',
  invitee_id: 'user-2',
  role: 'member',
  status: 'pending',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  hub_description: 'A test family hub'
};

describe('InvitationCard', () => {
  const mockOnAccept = vi.fn();
  const mockOnDecline = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invitation details correctly', () => {
    render(
      <InvitationCard
        invitation={mockInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    expect(screen.getByText('Test Family Hub')).toBeInTheDocument();
    expect(screen.getByText('A test family hub')).toBeInTheDocument();
    expect(screen.getByText('Invited by John Doe')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', async () => {
    render(
      <InvitationCard
        invitation={mockInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockOnAccept).toHaveBeenCalledWith('1');
    });
  });

  it('calls onDecline when decline button is clicked', async () => {
    render(
      <InvitationCard
        invitation={mockInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockOnDecline).toHaveBeenCalledWith('1');
    });
  });

  it('disables buttons when loading', () => {
    render(
      <InvitationCard
        invitation={mockInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={true}
      />
    );

    const acceptButton = screen.getByText('Accept');
    const declineButton = screen.getByText('Decline');

    expect(acceptButton).toBeDisabled();
    expect(declineButton).toBeDisabled();
  });

  it('shows admin privileges message for admin role', () => {
    const adminInvitation = { ...mockInvitation, role: 'admin' as const };
    
    render(
      <InvitationCard
        invitation={adminInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    expect(screen.getByText(/Manager privileges/)).toBeInTheDocument();
  });

  it('shows expiry warning for invitations expiring soon', () => {
    const soonToExpireInvitation = {
      ...mockInvitation,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
    };

    render(
      <InvitationCard
        invitation={soonToExpireInvitation}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    expect(screen.getByText(/This invitation expires soon/)).toBeInTheDocument();
  });
});