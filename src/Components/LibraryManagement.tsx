"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBook, FaUser, FaUndo } from "react-icons/fa";

interface Book {
  id: string;
  title: string;
  author: string;
  isAvailable: boolean;
}

interface User {
  id: string;
  name: string;
  books: Book[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LibraryManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"books" | "users">("books");
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterBorrowed, setFilterBorrowed] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<{ [key: string]: string }>(
    {}
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    publicationYear: "",
    isbn: "",
  });
  const [userForm, setUserForm] = useState({ name: "" });

  useEffect(() => {
    fetchBooks();
    fetchUsers();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleSubmitBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/Books`, form);
      toast.success("Libro registrado exitosamente");
      fetchBooks();
      setForm({ title: "", author: "", publicationYear: "", isbn: "" });
      setModalOpen(false);
    } catch (error) {
      toast.error("Error al registrar libro");
    }
  };

  const handleSubmitUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/Users`, userForm);
      toast.success("Usuario registrado exitosamente");
      fetchUsers();
      setUserForm({ name: "" });
      setModalOpen(false);
    } catch (error) {
      toast.error("Error al registrar usuario");
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get<Book[]>(`${API_BASE_URL}/api/Books`);
      setBooks(res.data);
    } catch (error) {
      toast.error("Error al obtener libros");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>(`${API_BASE_URL}/api/Users`);
      setUsers(res.data);
    } catch (error) {
      toast.error("Error al obtener usuarios");
    }
  };

  const handleBorrow = async (userId: string) => {
    const bookId = selectedBook[userId];
    if (!bookId) {
      toast.error("Selecciona un libro para prestar");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/Users/borrow`, {
        userId,
        bookId,
      });
      toast.success("Libro prestado exitosamente");
      fetchBooks();
      fetchUsers();
    } catch (error) {
      toast.error("Error al prestar libro");
    }
  };

  const handleReturn = async (userId: string, bookId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/Users/return`, {
        userId,
        bookId,
      });
      toast.success("Libro devuelto exitosamente");
      fetchBooks();
      fetchUsers();
    } catch (error) {
      toast.error("Error al devolver libro");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center">Gestión de Biblioteca</h1>

      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={() => setActiveTab("books")}
          className={`p-2 rounded ${
            activeTab === "books" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          <FaBook className="inline-block mr-2" /> Libros
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`p-2 rounded ${
            activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          <FaUser className="inline-block mr-2" /> Usuarios
        </button>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-500 text-white p-2 rounded mt-4"
      >
        Agregar Libro / Usuario
      </button>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold">Registrar Libro</h2>
            <form onSubmit={handleSubmitBook}>
              <input
                required
                type="text"
                name="title"
                placeholder="Título"
                value={form.title}
                onChange={handleInputChange}
                className="border p-2 w-full mt-2"
              />
              <input
                required
                type="text"
                name="author"
                placeholder="Autor"
                value={form.author}
                onChange={handleInputChange}
                className="border p-2 w-full mt-2"
              />
              <input
                required
                type="number"
                name="publicationYear"
                placeholder="Año"
                value={form.publicationYear}
                onChange={handleInputChange}
                className="border p-2 w-full mt-2"
              />
              <input
                required
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={form.isbn}
                onChange={handleInputChange}
                className="border p-2 w-full mt-2"
              />
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded mt-4 w-full"
              >
                Registrar
              </button>
            </form>
            <h2 className="text-xl font-bold mt-4">Registrar Usuario</h2>
            <form onSubmit={handleSubmitUser}>
              <input
                required
                type="text"
                name="name"
                placeholder="Nombre"
                value={userForm.name}
                onChange={handleUserChange}
                className="border p-2 w-full mt-2"
              />
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded mt-4 w-full"
              >
                Registrar
              </button>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="bg-red-500 text-white p-2 rounded mt-4 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {activeTab === "books" && (
        <div>
          <h2 className="text-2xl font-bold mt-6">Lista de Libros</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setFilterAvailable(true)}
              className="p-2 bg-green-500 text-white rounded"
            >
              Disponibles
            </button>
            <button
              onClick={() => setFilterAvailable(false)}
              className="p-2 bg-red-500 text-white rounded"
            >
              No Disponibles
            </button>
            <button
              onClick={() => setFilterAvailable(null)}
              className="p-2 bg-gray-500 text-white rounded"
            >
              Todos
            </button>
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
              {books
                .filter(
                  (book) =>
                    filterAvailable === null ||
                    book.isAvailable === filterAvailable
                )
                .map((book) => (
                  <tr key={book.id} className="text-center">
                    <td className="border p-2">{book.title}</td>
                    <td className="border p-2">{book.author}</td>
                    <td className="border p-2">
                      {book.isAvailable ? "Disponible" : "Prestado"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h2 className="text-2xl font-bold mt-6">Lista de Usuarios</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setFilterBorrowed(true)}
              className="p-2 bg-yellow-500 text-white rounded"
            >
              Con Préstamos
            </button>
            <button
              onClick={() => setFilterBorrowed(false)}
              className="p-2 bg-gray-500 text-white rounded"
            >
              Todos
            </button>
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
              {users
                .filter((user) => !filterBorrowed || user.books.length > 0)
                .map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.books.length}</td>
                    <td className="border p-2">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex  gap-1">
                          <select
                            onChange={(e) =>
                              setSelectedBook({
                                ...selectedBook,
                                [user.id]: e.target.value,
                              })
                            }
                            className="p-2 border rounded"
                          >
                            <option value="">Seleccionar libro</option>
                            {books
                              .filter((book) => book.isAvailable)
                              .map((book) => (
                                <option key={book.id} value={book.id}>
                                  {book.title}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleBorrow(user.id)}
                            className="p-2 bg-blue-500 text-white rounded ml-2"
                          >
                            Prestar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.books.map((book) => (
                            <button
                              key={book.id}
                              onClick={() => handleReturn(user.id, book.id)}
                              className="p-2 bg-red-500 text-white rounded ml-2"
                            >
                              <FaUndo /> Devolver {book.title}
                            </button>
                          ))}
                        </div>
                      </div>
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
