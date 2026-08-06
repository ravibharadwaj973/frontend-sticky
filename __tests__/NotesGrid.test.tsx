import { render, screen, waitFor } from '@testing-library/react';
import NotesGrid from '@/app/components/notes/NotesGrid';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    notes: {
      getAll: jest.fn(),
      getArchived: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedNotes = api.notes as jest.Mocked<typeof api.notes>;

const sampleNotes = [
  {
    _id: 'n1',
    title: 'First',
    content: 'one',
    color: '#ffeb3b',
    position: { x: 0, y: 0 },
    user: 'u1',
    isArchived: false,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'n2',
    title: 'Second',
    content: 'two',
    color: '#2196f3',
    position: { x: 0, y: 0 },
    user: 'u1',
    isArchived: false,
    createdAt: '',
    updatedAt: '',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

it('shows a loading state, then the notes', async () => {
  mockedNotes.getAll.mockResolvedValue({ notes: sampleNotes });

  render(<NotesGrid />);

  expect(screen.getByText('Loading notes...')).toBeInTheDocument();

  expect(await screen.findByText('First')).toBeInTheDocument();
  expect(screen.getByText('Second')).toBeInTheDocument();
  expect(mockedNotes.getAll).toHaveBeenCalled();
  expect(mockedNotes.getArchived).not.toHaveBeenCalled();
});

it('fetches archived notes when showArchived is set', async () => {
  mockedNotes.getArchived.mockResolvedValue({ notes: [sampleNotes[0]] });

  render(<NotesGrid showArchived />);

  expect(await screen.findByText('First')).toBeInTheDocument();
  expect(mockedNotes.getArchived).toHaveBeenCalled();
  expect(mockedNotes.getAll).not.toHaveBeenCalled();
});

it('renders an empty grid when the API returns no notes', async () => {
  mockedNotes.getAll.mockResolvedValue({ notes: [] });

  const { container } = render(<NotesGrid />);

  await waitFor(() =>
    expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument()
  );
  expect(container.querySelectorAll('h3')).toHaveLength(0);
});
