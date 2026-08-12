'use client';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
export default function Header() {
  const { user, logout } = useAuth();
const router=useRouter()
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Sticky Notes</h1>
            {user && (
              <>
                {/* /notes is the core backend, /todos is the todo-service */}
                <div className="ml-6 flex gap-1">
                  <Link
                    href="/notes"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Notes
                  </Link>
                  <Link
                    href="/todos"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Todos
                  </Link>
                </div>
                <span className="ml-4 text-gray-600">
                  Welcome, {user.name}!
                </span>
              </>
            )}
          </div>

          <button
onClickCapture={()=>router.push('/')}
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
