'use client';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import NotesGrid from '../../components/notes/NotesGrid';

export default function ArchivedNotesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Archived Notes</h1>
          <Link
            href="/notes"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Active Notes
          </Link>
        </div>

        <NotesGrid showArchived={true} />
      </div>
    </div>
  );
}