import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInvitationStore } from '../invitationStore';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            gt: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('invitationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useInvitationStore.setState({
      invitations: [],
      isLoading: false,
      error: null
    });
  });

  it('initializes with correct default state', () => {
    const state = useInvitationStore.getState();
    
    expect(state.invitations).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('sets loading state when fetching invitations', async () => {
    const { fetchInvitations } = useInvitationStore.getState();
    
    const fetchPromise = fetchInvitations('user-1');
    
    // Check loading state is set
    expect(useInvitationStore.getState().isLoading).toBe(true);
    
    await fetchPromise;
    
    // Check loading state is cleared
    expect(useInvitationStore.getState().isLoading).toBe(false);
  });

  it('handles fetch invitations success', async () => {
    const mockData = [
      {
        id: '1',
        hub_id: 'hub-1',
        role: 'member',
        created_at: '2024-01-01',
        expires_at: '2024-01-08',
        invited_by: 'user-1',
        hub: { name: 'Test Hub', description: 'Test Description' },
        inviter: { name: 'John Doe' }
      }
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            gt: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
            }))
          }))
        }))
      }))
    });

    const { fetchInvitations } = useInvitationStore.getState();
    await fetchInvitations('user-1');

    const state = useInvitationStore.getState();
    expect(state.invitations).toHaveLength(1);
    expect(state.invitations[0].hub_name).toBe('Test Hub');
    expect(state.error).toBe(null);
  });

  it('handles fetch invitations error', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            gt: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
            }))
          }))
        }))
      }))
    });

    const { fetchInvitations } = useInvitationStore.getState();
    await fetchInvitations('user-1');

    const state = useInvitationStore.getState();
    expect(state.error).toBe('Database error');
    expect(state.isLoading).toBe(false);
  });

  it('clears error when clearError is called', () => {
    // Set an error first
    useInvitationStore.setState({ error: 'Test error' });
    
    const { clearError } = useInvitationStore.getState();
    clearError();
    
    expect(useInvitationStore.getState().error).toBe(null);
  });
});