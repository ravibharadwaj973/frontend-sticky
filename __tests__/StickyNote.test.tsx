import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StickyNote from '@/app/components/notes/StickyNote';
import { api } from '@/lib/api';
import { Note } from '@/types';

jest.mock('@/lib/api', () => ({
  api: {
    notes: {
      update: jest.fn(),
      archive: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedNotes = api.notes as jest.Mocked<typeof api.notes>;

const note: Note = {
  _id: 'n1',
  title: 'Shopping',
  content: 'Milk and eggs',
  color: '#ffeb3b',
  position: { x: 0, y: 0 },
  user: 'u1',
  isArchived: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders the note title and content', () => {
  render(<StickyNote note={note} onUpdate={jest.fn()} />);

  expect(screen.getByText('Shopping')).toBeInTheDocument();
  expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
});

it('edits and saves the note', async () => {
  mockedNotes.update.mockResolvedValue({ note });
  const onUpdate = jest.fn();
  const user = userEvent.setup();

  render(<StickyNote note={note} onUpdate={onUpdate} />);

  await user.click(screen.getByRole('button', { name: 'Edit' }));

  const titleInput = screen.getByPlaceholderText('Title');
  await user.clear(titleInput);
  await user.type(titleInput, 'Groceries');
  await user.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  expect(mockedNotes.update).toHaveBeenCalledWith('n1', {
    title: 'Groceries',
    content: 'Milk and eggs',
  });
});

it('cancel leaves edit mode without saving', async () => {
  const user = userEvent.setup();

  render(<StickyNote note={note} onUpdate={jest.fn()} />);

  await user.click(screen.getByRole('button', { name: 'Edit' }));
  await user.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(screen.getByText('Shopping')).toBeInTheDocument();
  expect(mockedNotes.update).not.toHaveBeenCalled();
});

it('archives the note', async () => {
  mockedNotes.archive.mockResolvedValue({ note });
  const onUpdate = jest.fn();
  const user = userEvent.setup();

  render(<StickyNote note={note} onUpdate={onUpdate} />);

  await user.click(screen.getByRole('button', { name: 'Archive' }));

  await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  expect(mockedNotes.archive).toHaveBeenCalledWith('n1');
});

it('deletes the note', async () => {
  mockedNotes.delete.mockResolvedValue({ message: 'deleted' });
  const onUpdate = jest.fn();
  const user = userEvent.setup();

  render(<StickyNote note={note} onUpdate={onUpdate} />);

  await user.click(screen.getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  expect(mockedNotes.delete).toHaveBeenCalledWith('n1');
});
