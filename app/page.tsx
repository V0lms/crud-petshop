'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

type Pet = {
  id: number;
  name: string;
  category: string;
  photoUrls: string;
};

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPet, setNewPet] = useState({ name: '', status: 'available', photoUrls: '' });
  const [newNames, setNewNames] = useState<Record<number, string>>({});

  const api = axios.create({
    baseURL: 'https://petstore.swagger.io/v2',
    headers: {
      'api_key': 'special-key',
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async (status?: string) => {
    if (!status) {
      status =  'available';
    }
    try {
      const { data } = await api.get('/pet/findByStatus', {
        params: { status: (status) }
      });
      const uniquePets: any = Array.from(new Map(data.map((pet: Pet) => [pet.id, pet])).values());
      setPets(uniquePets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pet', {
        name: newPet.name,
        photoUrls: [newPet.photoUrls] ,
        status: 'available',
        
      });
      await fetchPets();
      setNewPet({ name: '', status: 'available', photoUrls: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pet');
    }
  };

  const updatePet = async (petId: number) => {
    try {
      const newName = newNames[petId];
      if (!newName) return;

      const pet = pets.find(p => p.id === petId);
      if (!pet) return;

      await api.put('/pet', {
        id: petId,
        name: newName,
        photoUrls: pet.photoUrls,
        status: 'available',
      });
      await fetchPets();
      setNewNames(prev => {
        const updated = { ...prev };
        delete updated[petId];
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet');
    }
  };

  const deletePet = async (petId: number) => {
    try {
      await api.delete(`/pet/${petId}`);
      await fetchPets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading pets...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Petstore CRUD</h1>
      <div className=' flex gap-2 p-4 h-[25%]'>
        <button type="button" onClick={() => fetchPets('available')} className="h-[20%] w-[33%] bg-neutral-500 text-white rounded hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500">
          Disponibles
        </button>
        <button type="button" onClick={() => fetchPets('pending')} className="h-[20%] w-[33%] bg-neutral-500 text-white rounded hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500">
          Pendientes
        </button>
        <button type="button" onClick={() => fetchPets('sold')} className="h-[20%] w-[33%] bg-neutral-500 text-white rounded hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500">
          Vendidos
        </button>
      </div>
      
      <form onSubmit={addPet} className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Pet</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newPet.name}
            onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
            placeholder="Nombre"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            value={newPet.photoUrls}
            onChange={(e) => setNewPet({ ...newPet, photoUrls: e.target.value })}
            placeholder="Foto URL"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"

          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Pet
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <div key={pet.id} className="p-4 bg-white rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                <img
                  src={pet.photoUrls}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">{pet.name}</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNames[pet.id] || ''}
                    onChange={(e) => setNewNames(prev => ({ ...prev, [pet.id]: e.target.value }))}
                    placeholder="New name"
                    className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={() => updatePet(pet.id)}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-r hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    Update
                  </button>
                </div>
                <button
                  onClick={() => deletePet(pet.id)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
    </div>
  );
}