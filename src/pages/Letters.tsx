import React, { useEffect, useState } from 'react';
import { Plus, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Letter {
  id: number;
  resident_name: string;
  nik: string;
  type: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

export default function Letters() {
  const [letters, setLetters] = useState<Letter[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ resident_id: '', type: '', description: '' });

  useEffect(() => {
    fetchLetters();
    fetch('/api/residents').then(res => res.json()).then(data => setResidents(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchLetters();
        setIsModalOpen(false);
        setFormData({ resident_id: '', type: '', description: '' });
      } else {
        alert('Gagal membuat surat');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLetters = () => {
    fetch('/api/letters')
      .then(res => res.json())
      .then(data => setLetters(data));
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/letters/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchLetters();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Disetujui</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Menunggu</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Surat Pengantar</h1>
          <p className="text-slate-500">Permohonan surat pengantar warga</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Surat Baru
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Buat Surat Pengantar</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Warga</label>
                <select required className="w-full px-3 py-2 border rounded-lg"
                  value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})}>
                  <option value="">Pilih Warga...</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.nik}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Surat</label>
                <select required className="w-full px-3 py-2 border rounded-lg"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="">Pilih Jenis...</option>
                  <option value="Surat Pengantar KTP">Surat Pengantar KTP</option>
                  <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                  <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</option>
                  <option value="Surat Keterangan Usaha">Surat Keterangan Usaha</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Keperluan surat..." />
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Pemohon</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {letters.map((letter) => (
                <tr key={letter.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(letter.created_at), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{letter.resident_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{letter.nik}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {letter.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{letter.description || '-'}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(letter.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {letter.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => updateStatus(letter.id, 'Approved')}
                          className="text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                        >
                          Setuju
                        </button>
                        <button 
                          onClick={() => updateStatus(letter.id, 'Rejected')}
                          className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {letters.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada permohonan surat
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
