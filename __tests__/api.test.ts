import { api, tokenStore } from '@/lib/api';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown) =>
  Promise.resolve({ json: () => Promise.resolve(body) });

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

beforeEach(() => {
  mockFetch.mockReset();
  tokenStore.clear();
});

describe('tokenStore', () => {
  it('stores, reads and clears the token', () => {
    expect(tokenStore.get()).toBeNull();
    tokenStore.set('abc');
    expect(tokenStore.get()).toBe('abc');
    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
  });
});

describe('api.auth', () => {
  it('saves the token from a successful login', async () => {
    mockFetch.mockReturnValueOnce(
      jsonResponse({ success: true, token: 'jwt-123', user: { id: '1' } })
    );

    const data = await api.auth.login('a@b.com', 'pw');

    expect(data.token).toBe('jwt-123');
    expect(tokenStore.get()).toBe('jwt-123');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com', password: 'pw' });
  });

  it('does not save a token when login fails', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ error: 'Invalid credentials' }));

    await api.auth.login('a@b.com', 'wrong');

    expect(tokenStore.get()).toBeNull();
  });

  it('saves the token from a successful register', async () => {
    mockFetch.mockReturnValueOnce(
      jsonResponse({ success: true, token: 'jwt-reg', user: { id: '1' } })
    );

    await api.auth.register('Ravi', 'a@b.com', 'pw');

    expect(tokenStore.get()).toBe('jwt-reg');
  });

  it('clears the token on logout', async () => {
    tokenStore.set('jwt-123');
    mockFetch.mockReturnValueOnce(jsonResponse({ message: 'Logged out successfully' }));

    await api.auth.logout();

    expect(tokenStore.get()).toBeNull();
  });
});

describe('Authorization header', () => {
  it('sends the Bearer token and credentials on requests when logged in', async () => {
    tokenStore.set('jwt-123');
    mockFetch.mockReturnValueOnce(jsonResponse({ notes: [] }));

    await api.notes.getAll();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer jwt-123');
    expect(options.credentials).toBe('include');
  });

  it('sends no Authorization header when logged out', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ notes: [] }));

    await api.notes.getAll();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('sets Content-Type json only when a body is sent', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ note: {} }));
    await api.notes.create({ title: 't', content: 'c' });
    const [, createOptions] = mockFetch.mock.calls[0];
    expect(createOptions.headers['Content-Type']).toBe('application/json');

    mockFetch.mockReturnValueOnce(jsonResponse({ notes: [] }));
    await api.notes.getAll();
    const [, getOptions] = mockFetch.mock.calls[1];
    expect(getOptions.headers['Content-Type']).toBeUndefined();
  });
});
