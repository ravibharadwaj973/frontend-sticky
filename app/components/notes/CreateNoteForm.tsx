'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface CreateNoteFormProps {
  onNoteCreated: () => void;
}

export default function CreateNoteForm({ onNoteCreated }: CreateNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffeb3b');

  const colors = ['#ffeb3b', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await api.notes.create({ title, content, color });
      setTitle('');
      setContent('');
      setColor('#ffeb3b');
      onNoteCreated();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
      <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex items-center space-x-4">
          <span>Color:</span>
          <div className="flex space-x-2">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === colorOption ? 'border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={!title || !content}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Note
        </button>
      </form>
    </div>
  );
}