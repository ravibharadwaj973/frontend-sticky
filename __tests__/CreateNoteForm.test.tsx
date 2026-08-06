import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateNoteForm from '@/app/components/notes/CreateNoteForm';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    notes: { create: jest.fn() },
  },
}));

const mockedCreate = api.notes.create as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it('disables the button until title and content are filled', async () => {
  const user = userEvent.setup();
  render(<CreateNoteForm onNoteCreated={jest.fn()} />);

  const button = screen.getByRole('button', { name: 'Create Note' });
  expect(button).toBeDisabled();

  await user.type(screen.getByPlaceholderText('Title'), 'My note');
  expect(button).toBeDisabled();

  await user.type(screen.getByPlaceholderText('Content'), 'Hello');
  expect(button).toBeEnabled();
});

it('creates a note and clears the form', async () => {
  mockedCreate.mockResolvedValue({ note: { _id: '1' } });
  const onNoteCreated = jest.fn();
  const user = userEvent.setup();

  render(<CreateNoteForm onNoteCreated={onNoteCreated} />);

  await user.type(screen.getByPlaceholderText('Title'), 'My note');
  await user.type(screen.getByPlaceholderText('Content'), 'Hello');
  await user.click(screen.getByRole('button', { name: 'Create Note' }));

  await waitFor(() => expect(onNoteCreated).toHaveBeenCalled());
  expect(mockedCreate).toHaveBeenCalledWith({
    title: 'My note',
    content: 'Hello',
    color: '#ffeb3b',
  });
  expect(screen.getByPlaceholderText('Title')).toHaveValue('');
  expect(screen.getByPlaceholderText('Content')).toHaveValue('');
});

it('sends the selected color', async () => {
  mockedCreate.mockResolvedValue({ note: { _id: '1' } });
  const user = userEvent.setup();

  render(<CreateNoteForm onNoteCreated={jest.fn()} />);

  // the first buttons in the form are the 7 color swatches, the submit button is last
  const buttons = screen.getAllByRole('button');
  await user.click(buttons[1]); // '#e91e63'

  await user.type(screen.getByPlaceholderText('Title'), 'Colored');
  await user.type(screen.getByPlaceholderText('Content'), 'Note');
  await user.click(screen.getByRole('button', { name: 'Create Note' }));

  await waitFor(() =>
    expect(mockedCreate).toHaveBeenCalledWith({
      title: 'Colored',
      content: 'Note',
      color: '#e91e63',
    })
  );
});
