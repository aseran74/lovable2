import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RealEstateAgency {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
}

const AgenciesList = () => {
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('real_estate_agencies')
      .select('*')
      .order('name');
    if (!error) setAgencies(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta agencia?')) return;
    const { error } = await supabase
      .from('real_estate_agencies')
      .delete()
      .eq('id', id);
    if (!error) {
      setAgencies(agencies.filter(a => a.id !== id));
      toast({ title: 'Éxito', description: 'Elemento eliminado correctamente' });
    } else {
      toast({ title: 'Error', description: 'Error al realizar la acción', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6 font-poppins">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agencias Inmobiliarias</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            Tabla
          </Button>
          <Link to="/dashboard/agencies/new">
            <Button>Nueva Agencia</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando agencias...</div>
      ) : agencies.length === 0 ? (
        <Card className="font-poppins">
          <CardHeader>
            <h3 className="text-lg font-semibold">No hay agencias registradas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Comienza agregando una nueva agencia inmobiliaria.
            </p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-poppins">
          {agencies.map((agency) => (
            <Card key={agency.id} className="relative w-full max-w-[500px] h-[300px] bg-white rounded-xl outline outline-1 outline-gray-200 outline-offset-[-12px] shadow-lg overflow-hidden mx-auto group font-poppins flex flex-col items-center justify-start pt-6">
              <div className="flex flex-col items-center">
                {agency.logo_url ? (
                  <img src={agency.logo_url} alt={agency.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 shadow-lg">
                    <span className="text-gray-400 text-4xl">🏢</span>
                  </div>
                )}
                <div className="flex gap-2 justify-center mt-2">
                  <Link to={`/dashboard/agencies/${agency.id}/edit`}>
                    <Button size="icon" variant="ghost" className="text-gray-500"><Pencil size={18} /></Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Button size="icon" variant="ghost" className="text-gray-500" onClick={() => handleDelete(agency.id)}><Trash2 size={18} color="#e11d48" /></Button>
                  )}
                </div>
              </div>
              <CardHeader className="pt-2 pb-1 text-center bg-white">
                <Link to={`/dashboard/agencies/${agency.id}`} className="hover:underline">
                  <h2 className="text-xl font-semibold text-gray-900 drop-shadow-none">{agency.name}</h2>
                </Link>
                <p className="text-gray-600 text-sm">{agency.email}</p>
                <p className="text-gray-600 text-sm">{agency.phone}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm line-clamp-2 mb-2 max-h-[2.5em] overflow-hidden pt-4">{agency.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded font-poppins">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Teléfono</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td className="px-4 py-2 border">
                    <Link to={`/dashboard/agencies/${agency.id}`} className="hover:underline">
                      {agency.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border">{agency.email}</td>
                  <td className="px-4 py-2 border">{agency.phone}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`/dashboard/agencies/${agency.id}/edit`}>
                      <Button size="icon" variant="ghost"><Pencil /></Button>
                    </Link>
                    {user?.role === 'admin' && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(agency.id)}><Trash2 color="#e11d48" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgenciesList; 