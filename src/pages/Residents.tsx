import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Resident {
  id: number;
  nik: string;
  name: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  address: string;
  rt: string;
  rw: string;
  status: string;
}

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Resident>>({});

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = () => {
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => setResidents(data));
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nik.includes(searchTerm)
  );

  const handleDelete = async (id: number) => {
    if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
      await fetch(`/api/residents/${id}`, { method: 'DELETE' });
      fetchResidents();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchResidents();
        setIsModalOpen(false);
        setFormData({});
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Warga</h1>
          <p className="text-slate-500">Kelola data kependudukan</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Warga
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Tambah Warga Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIK</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.nik || ''} onChange={e => setFormData({...formData, nik: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select required className="w-full px-3 py-2 border rounded-lg"
                    value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value as 'L' | 'P'})}>
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.birth_place || ''} onChange={e => setFormData({...formData, birth_place: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.birth_date || ''} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agama</label>
                  <select required className="w-full px-3 py-2 border rounded-lg"
                    value={formData.religion || ''} onChange={e => setFormData({...formData, religion: e.target.value})}>
                    <option value="">Pilih...</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pekerjaan</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.job || ''} onChange={e => setFormData({...formData, job: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Perkawinan</label>
                  <select required className="w-full px-3 py-2 border rounded-lg"
                    value={formData.marital_status || ''} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                    <option value="">Pilih...</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">TTL</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-600">{resident.nik}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{resident.name}</td>
                  <td className="px-6 py-4">{resident.gender}</td>
                  <td className="px-6 py-4">
                    {resident.birth_place}, {format(new Date(resident.birth_date), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    {resident.address ? `${resident.address} RT${resident.rt}/RW${resident.rw}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resident.status === 'Hidup' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {resident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-slate-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(resident.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
