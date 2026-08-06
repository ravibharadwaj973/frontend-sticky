'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UploadNotification } from '@/types';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [notifications, setNotifications] = useState<UploadNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const data = await api.uploads.getNotifications();
      if (data.notifications) setNotifications(data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setStatus('');

    if (!selected) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !preview) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setStatus('Image must be smaller than 4MB');
      return;
    }

    const form = e.currentTarget;
    setUploading(true);
    setStatus('Uploading via Lambda to S3...');

    try {
      const data = await api.uploads.upload({
        filename: file.name,
        contentType: file.type,
        data: preview, // data URL; backend strips the prefix
      });

      if (data.key) {
        setStatus('Stored in S3! Waiting for the SNS notification...');
        setFile(null);
        setPreview(null);
        form.reset();
        // S3 -> SNS -> Lambda -> MongoDB is asynchronous, so check back shortly
        setTimeout(loadNotifications, 4000);
      } else {
        setStatus(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setStatus('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
      <h2 className="text-xl font-semibold mb-1">Upload Image</h2>
      <p className="text-sm text-gray-500 mb-4">
        Frontend → Lambda → S3, then SNS saves a notification in MongoDB
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          aria-label="Choose image"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element -- data: URL preview, next/image can't optimize it
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded border border-gray-200"
          />
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload to S3'}
        </button>

        {status && <p className="text-sm text-gray-700">{status}</p>}
      </form>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Upload Notifications (from SNS → MongoDB)</h3>
          <button
            type="button"
            onClick={loadNotifications}
            disabled={loadingNotifications}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
          >
            {loadingNotifications ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet. Upload an image!</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className="flex items-center gap-3 p-2 border border-gray-200 rounded"
              >
                {notification.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived presigned S3 URL, host varies
                  <img
                    src={notification.url}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-700">
                    ✅ {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {notification.key?.split('/').pop()}
                    {notification.size ? ` · ${Math.round(notification.size / 1024)} KB` : ''}
                    {notification.createdAt
                      ? ` · ${new Date(notification.createdAt).toLocaleString()}`
                      : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
