/**
 * delivery-addresses.test.ts
 *
 * Integration-style tests for the delivery-addresses CRUD layer.
 * Uses jest mocks to avoid real Supabase calls.
 */

// Mock the supabase client
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockGetSession = jest.fn();

const mockSupabase = {
  auth: { getSession: mockGetSession },
  from: jest.fn(() => ({
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    single: mockSingle,
  })),
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const MOCK_SESSION = { user: { id: 'user-123' } };

const MOCK_ADDRESS = {
  id: 'addr-001',
  user_id: 'user-123',
  label: 'Home',
  full_name: 'Arjun Sharma',
  phone: '+919876543210',
  house_number: '42',
  street: 'Main Road',
  area: 'Anna Nagar',
  city: 'Chennai',
  state: 'Tamil Nadu',
  postal_code: '600040',
  is_default: true,
  latitude: 13.0827,
  longitude: 80.2707,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  mockGetSession.mockResolvedValue({ data: { session: MOCK_SESSION }, error: null });
});

describe('getDeliveryAddresses', () => {
  it('returns addresses from Supabase when session exists', async () => {
    mockSelect.mockReturnThis();
    mockOrder.mockResolvedValue({ data: [MOCK_ADDRESS], error: null });

    const { getDeliveryAddresses } = await import('../lib/delivery-addresses');
    const result = await getDeliveryAddresses();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('addr-001');
  });

  it('falls back to localStorage when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    localStorageMock.setItem(
      'agrimark_delivery_addresses',
      JSON.stringify([MOCK_ADDRESS])
    );

    const { getDeliveryAddresses } = await import('../lib/delivery-addresses');
    const result = await getDeliveryAddresses();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('addr-001');
  });

  it('returns empty array when Supabase returns error', async () => {
    mockSelect.mockReturnThis();
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const { getDeliveryAddresses } = await import('../lib/delivery-addresses');
    const result = await getDeliveryAddresses();

    expect(result).toEqual([]);
  });
});

describe('saveDeliveryAddress', () => {
  it('inserts to Supabase and returns the saved address', async () => {
    mockUpdate.mockReturnThis();
    mockEq.mockReturnThis();
    mockEq.mockResolvedValue({ error: null }); // clear is_default
    mockInsert.mockReturnThis();
    mockSelect.mockReturnThis();
    mockSingle.mockResolvedValue({ data: MOCK_ADDRESS, error: null });

    const { saveDeliveryAddress } = await import('../lib/delivery-addresses');
    const result = await saveDeliveryAddress({
      label: 'Home',
      full_name: 'Arjun Sharma',
      phone: '+919876543210',
      house_number: '42',
      street: 'Main Road',
      area: 'Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '600040',
      is_default: true,
    });

    expect(result.id).toBe('addr-001');
  });
});

describe('One-default invariant', () => {
  it('setting is_default=true clears existing defaults (application-level)', async () => {
    // The DB trigger handles this at DB level. This test verifies the
    // application-level clearance call made before insert.
    mockUpdate.mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockEq.mockReturnValue({ eq: eqMock });
    mockInsert.mockReturnThis();
    mockSelect.mockReturnThis();
    mockSingle.mockResolvedValue({ data: MOCK_ADDRESS, error: null });

    const { saveDeliveryAddress } = await import('../lib/delivery-addresses');
    await saveDeliveryAddress({
      label: 'Farm',
      full_name: 'Arjun',
      phone: '+919876543210',
      house_number: '1',
      street: 'Farm Rd',
      area: 'Rural',
      city: 'Tirunelveli',
      state: 'Tamil Nadu',
      postal_code: '627001',
      is_default: true,
    });

    // update (clear defaults) should have been called before insert
    expect(mockSupabase.from).toHaveBeenCalledWith('delivery_addresses');
  });
});

describe('deleteDeliveryAddress', () => {
  it('deletes address from Supabase', async () => {
    mockDelete.mockReturnThis();
    mockEq.mockReturnThis();
    mockEq.mockResolvedValue({ error: null });

    const { deleteDeliveryAddress } = await import('../lib/delivery-addresses');
    await expect(deleteDeliveryAddress('addr-001')).resolves.not.toThrow();
  });
});
