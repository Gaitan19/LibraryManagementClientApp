'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBook, FaUser, FaPlus, FaTimes, FaCheck, FaUndo } from 'react-icons/fa';

interface Book {
  id: string;
  title: string;
  author: string;
  publicationYear: number;
  isbn: string;
  isAvailable: boolean;
}

interface User {
  id: string;
  name: string;
  books: Book[];
}

export default function LibraryManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterBorrowed, setFilterBorrowed] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', publicationYear: '', isbn: '' });
  const [userForm, setUserForm] = useState({ name: '' });

  useEffect(() => {
    fetchBooks();
    fetchUsers();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get<Book[]>('https://localhost:7299/api/Books');
      setBooks(res.data);
    } catch (error) {
      toast.error('Error al obtener libros');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>('https://localhost:7299/api/Users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Error al obtener usuarios');
    }
  };

  const handleBorrow = async (userId: string, bookId: string) => {
    try {
      await axios.post(`https://localhost:7299/api/Users/borrow`, { userId, bookId });
      toast.success('Libro prestado exitosamente');
      fetchBooks();
      fetchUsers();
    } catch (error) {
      toast.error('Error al prestar libro');
    }
  };

  const handleReturn = async (userId: string, bookId: string) => {
    try {
      await axios.post(`https://localhost:7299/api/Users/return`, { userId, bookId });
      toast.success('Libro devuelto exitosamente');
      fetchBooks();
      fetchUsers();
    } catch (error) {
      toast.error('Error al devolver libro');
      console.log(error);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center">Gestión de Biblioteca</h1>
      <div className="flex justify-center mt-4 gap-4">
        <button onClick={() => setActiveTab('books')} className={`p-2 rounded ${activeTab === 'books' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <FaBook className="inline-block mr-2" /> Libros
        </button>
        <button onClick={() => setActiveTab('users')} className={`p-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <FaUser className="inline-block mr-2" /> Usuarios
        </button>
      </div>

      {activeTab === 'books' && (
        <div>
          <h2 className="text-2xl font-bold mt-6">Lista de Libros</h2>
          <div className="flex gap-4 mb-4">
            <button onClick={() => setFilterAvailable(true)} className="p-2 bg-green-500 text-white rounded">Disponibles</button>
            <button onClick={() => setFilterAvailable(false)} className="p-2 bg-red-500 text-white rounded">No Disponibles</button>
            <button onClick={() => setFilterAvailable(null)} className="p-2 bg-gray-500 text-white rounded">Todos</button>
          </div>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Título</th>
                <th className="border p-2">Autor</th>
                <th className="border p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {books.filter(book => filterAvailable === null || book.isAvailable === filterAvailable).map(book => (
                <tr key={book.id} className="text-center">
                  <td className="border p-2">{book.title}</td>
                  <td className="border p-2">{book.author}</td>
                  <td className="border p-2">{book.isAvailable ? 'Disponible' : 'Prestado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mt-6">Lista de Usuarios</h2>
          <div className="flex gap-4 mb-4">
            <button onClick={() => setFilterBorrowed(true)} className="p-2 bg-yellow-500 text-white rounded">Con Préstamos</button>
            <button onClick={() => setFilterBorrowed(false)} className="p-2 bg-gray-500 text-white rounded">Todos</button>
          </div>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Libros Prestados</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => !filterBorrowed || user.books.length > 0).map(user => (
                <tr key={user.id} className="text-center">
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.books.length}</td>
                  <td className="border p-2">
                    {user.books.map(book => (
                      <button key={book.id} onClick={() => handleReturn(user.id, book.id)} className="p-2 bg-red-500 text-white rounded m-1">
                        <FaUndo /> Devolver {book.title}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}