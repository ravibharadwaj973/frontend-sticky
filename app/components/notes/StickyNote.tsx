

'use client';
import { useState } from 'react';
import { Note } from '@/types';
import { api } from '@/lib/api';

interface StickyNoteProps {
  note: Note;
  onUpdate: () => void;
}

export default function StickyNote({ note, onUpdate }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = async () => {
    try {
      await api.notes.update(note._id, { title, content });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleArchive = async () => {
    try {
      await api.notes.archive(note._id);
      onUpdate();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.notes.delete(note._id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div
      className="p-4 rounded-lg shadow-lg cursor-move transition-all"
      style={{ backgroundColor: note.color }}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-1 bg-transparent border-b border-gray-600 focus:outline-none"
            placeholder="Title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-1 bg-transparent resize-none focus:outline-none"
            placeholder="Content"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-lg mb-2">{note.title}</h3>
          <p className="whitespace-pre-wrap">{note.content}</p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Edit
            </button>
            <button
              onClick={handleArchive}
              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
            >
              Archive
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}