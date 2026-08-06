import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '@/app/components/notes/ImageUpload';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    uploads: {
      upload: jest.fn(),
      getNotifications: jest.fn(),
    },
  },
}));

const mockedUploads = api.uploads as jest.Mocked<typeof api.uploads>;

// fake timers keep the component's 4s delayed refresh from outliving the test;
// userEvent and RTL's waitFor advance them automatically
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockedUploads.getNotifications.mockResolvedValue({ notifications: [] });
});

afterEach(() => {
  jest.useRealTimers();
});

const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

it('shows the empty state when there are no notifications', async () => {
  render(<ImageUpload />);

  expect(
    await screen.findByText('No notifications yet. Upload an image!')
  ).toBeInTheDocument();
});

it('lists notifications loaded from MongoDB on mount', async () => {
  mockedUploads.getNotifications.mockResolvedValue({
    notifications: [
      {
        _id: 'x1',
        message: 'Image uploaded successfully',
        key: 'uploads/u1/123-cat.png',
        size: 2048,
        createdAt: '2026-08-05T10:00:00.000Z',
        url: 'https://example.com/signed',
      },
    ],
  });

  render(<ImageUpload />);

  expect(await screen.findByText(/Image uploaded successfully/)).toBeInTheDocument();
  expect(screen.getByText(/123-cat\.png/)).toBeInTheDocument();
});

it('uploads the chosen image through the API', async () => {
  mockedUploads.upload.mockResolvedValue({ key: 'uploads/u1/1-pic.png' });
  const user = setupUser();

  render(<ImageUpload />);

  const file = new File(['tiny-image-bytes'], 'pic.png', { type: 'image/png' });
  await user.upload(screen.getByLabelText('Choose image'), file);

  // preview appears once the FileReader finishes
  expect(await screen.findByAltText('Preview')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Upload to S3' }));

  await waitFor(() => expect(mockedUploads.upload).toHaveBeenCalled());
  const payload = mockedUploads.upload.mock.calls[0][0];
  expect(payload.filename).toBe('pic.png');
  expect(payload.contentType).toBe('image/png');
  expect(payload.data).toMatch(/^data:image\/png;base64,/);

  expect(
    await screen.findByText('Stored in S3! Waiting for the SNS notification...')
  ).toBeInTheDocument();
});

it('rejects images larger than 4MB without calling the API', async () => {
  const user = setupUser();

  render(<ImageUpload />);

  const bigFile = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'big.png', {
    type: 'image/png',
  });
  await user.upload(screen.getByLabelText('Choose image'), bigFile);

  expect(await screen.findByAltText('Preview', {}, { timeout: 10000 })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Upload to S3' }));

  expect(await screen.findByText('Image must be smaller than 4MB')).toBeInTheDocument();
  expect(mockedUploads.upload).not.toHaveBeenCalled();
}, 20000);
