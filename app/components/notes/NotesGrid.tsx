'use client';
import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { api } from '@/lib/api';
import StickyNote from './StickyNote';

interface NotesGridProps {
  showArchived?: boolean;
}

export default function NotesGrid({ showArchived = false }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const endpoint = showArchived ? 'getArchived' : 'getAll';
      const data = await api.notes[endpoint]();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [showArchived]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <StickyNote
          key={note._id}
          note={note}
          onUpdate={fetchNotes}
        />
      ))}
    </div>
  );
}