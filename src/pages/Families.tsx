import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';

interface Family {
  id: number;
  kk_number: string;
  head_of_family: string;
  address: string;
  rt: string;
  rw: string;
}

export default function Families() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/families')
      .then(res => res.json())
      .then(data => setFamilies(data));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Family>>({});

  const filteredFamilies = families.filter(f => 
    f.head_of_family.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.kk_number.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        // Refresh data
        fetch('/api/families').then(res => res.json()).then(data => setFamilies(data));
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
          <h1 className="text-2xl font-bold text-slate-900">Data Kartu Keluarga</h1>
          <p className="text-slate-500">Daftar Kepala Keluarga</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah KK
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Tambah Kartu Keluarga</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor KK</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                  value={formData.kk_number || ''} onChange={e => setFormData({...formData, kk_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kepala Keluarga</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                  value={formData.head_of_family || ''} onChange={e => setFormData({...formData, head_of_family: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea required className="w-full px-3 py-2 border rounded-lg" rows={3}
                  value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RT</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.rt || ''} onChange={e => setFormData({...formData, rt: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RW</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.rw || ''} onChange={e => setFormData({...formData, rw: e.target.value})} />
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
              placeholder="Cari No. KK atau Kepala Keluarga..."
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
                <th className="px-6 py-4">No. KK</th>
                <th className="px-6 py-4">Kepala Keluarga</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">RT/RW</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFamilies.map((family) => (
                <tr key={family.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-600">{family.kk_number}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{family.head_of_family}</td>
                  <td className="px-6 py-4">{family.address}</td>
                  <td className="px-6 py-4">RT {family.rt} / RW {family.rw}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
