'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import CreateNoteForm from '../components/notes/CreateNoteForm';
import ImageUpload from '../components/notes/ImageUpload';
import NotesGrid from '../components/notes/NotesGrid';

export default function NotesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Sticky Notes</h1>
          <Link
            href="/notes/archived"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            View Archived Notes
          </Link>
        </div>

        <CreateNoteForm onNoteCreated={handleNoteCreated} />
        <ImageUpload />
        <NotesGrid key={refreshTrigger} showArchived={false} />

        {refreshTrigger === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-l g">
              No notes yet. Create your first note above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}