import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InvitationsList from '../InvitationsList';
import { useInvitationStore } from '../../../store/invitationStore';
import { useAuthStore } from '../../../store/authStore';

// Mock the stores
vi.mock('../../../store/invitationStore');
vi.mock('../../../store/authStore');

const mockInvitations = [
  {
    id: '1',
    hub_id: 'hub-1',
    hub_name: 'Test Hub 1',
    inviter_id: 'user-1',
    inviter_name: 'John Doe',
    invitee_id: 'user-2',
    role: 'member' as const,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    hub_description: 'Test hub description'
  }
];

describe('InvitationsList', () => {
  const mockFetchInvitations = vi.fn();
  const mockAcceptInvitation = vi.fn();
  const mockDeclineInvitation = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuthStore as any).mockReturnValue({
      user: { id: 'user-2' }
    });

    (useInvitationStore as any).mockReturnValue({
      invitations: mockInvitations,
      isLoading: false,
      error: null,
      fetchInvitations: mockFetchInvitations,
      acceptInvitation: mockAcceptInvitation,
      declineInvitation: mockDeclineInvitation,
      clearError: mockClearError
    });
  });

  it('renders invitations list correctly', async () => {
    render(<InvitationsList />);

    await waitFor(() => {
      expect(screen.getByText('Hub Invitations')).toBeInTheDocument();
      expect(screen.getByText('Test Hub 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no invitations', async () => {
    (useInvitationStore as any).mockReturnValue({
      invitations: [],
      isLoading: false,
      error: null,
      fetchInvitations: mockFetchInvitations,
      acceptInvitation: mockAcceptInvitation,
      declineInvitation: mockDeclineInvitation,
      clearError: mockClearError
    });

    render(<InvitationsList />);

    await waitFor(() => {
      expect(screen.getByText('No Pending Invitations')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton when loading', () => {
    (useInvitationStore as any).mockReturnValue({
      invitations: [],
      isLoading: true,
      error: null,
      fetchInvitations: mockFetchInvitations,
      acceptInvitation: mockAcceptInvitation,
      declineInvitation: mockDeclineInvitation,
      clearError: mockClearError
    });

    render(<InvitationsList />);

    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3);
  });

  it('shows error state when there is an error', () => {
    (useInvitationStore as any).mockReturnValue({
      invitations: [],
      isLoading: false,
      error: 'Failed to load invitations',
      fetchInvitations: mockFetchInvitations,
      acceptInvitation: mockAcceptInvitation,
      declineInvitation: mockDeclineInvitation,
      clearError: mockClearError
    });

    render(<InvitationsList />);

    expect(screen.getByText('Error Loading Invitations')).toBeInTheDocument();
    expect(screen.getByText('Failed to load invitations')).toBeInTheDocument();
  });

  it('fetches invitations on mount', () => {
    render(<InvitationsList />);

    expect(mockFetchInvitations).toHaveBeenCalledWith('user-2');
  });
});