import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      getMe: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    },
  },
}));

const mockedAuth = api.auth as jest.Mocked<typeof api.auth>;

function Probe() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <button onClick={() => login('a@b.com', 'pw')}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it('loads the current user on mount', async () => {
  mockedAuth.getMe.mockResolvedValue({ user: { id: '1', name: 'Ravi', email: 'a@b.com' } });

  renderProbe();

  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  expect(screen.getByTestId('user')).toHaveTextContent('Ravi');
});

it('shows no user when the session check returns null', async () => {
  mockedAuth.getMe.mockResolvedValue({ user: null });

  renderProbe();

  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  expect(screen.getByTestId('user')).toHaveTextContent('none');
});

it('sets the user after a successful login', async () => {
  mockedAuth.getMe.mockResolvedValue({ user: null });
  mockedAuth.login.mockResolvedValue({
    success: true,
    token: 'jwt',
    user: { id: '1', name: 'Ravi', email: 'a@b.com' },
  });
  const user = userEvent.setup();

  renderProbe();
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

  await user.click(screen.getByText('do-login'));

  await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ravi'));
  expect(mockedAuth.login).toHaveBeenCalledWith('a@b.com', 'pw');
});

it('keeps user empty when login fails', async () => {
  mockedAuth.getMe.mockResolvedValue({ user: null });
  mockedAuth.login.mockResolvedValue({ error: 'Invalid credentials' });
  const user = userEvent.setup();

  renderProbe();
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

  await user.click(screen.getByText('do-login'));

  await waitFor(() => expect(mockedAuth.login).toHaveBeenCalled());
  expect(screen.getByTestId('user')).toHaveTextContent('none');
});

it('clears the user on logout', async () => {
  mockedAuth.getMe.mockResolvedValue({ user: { id: '1', name: 'Ravi', email: 'a@b.com' } });
  mockedAuth.logout.mockResolvedValue({ message: 'ok' });
  const user = userEvent.setup();

  renderProbe();
  await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ravi'));

  await user.click(screen.getByText('do-logout'));

  await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
  expect(mockedAuth.logout).toHaveBeenCalled();
});
