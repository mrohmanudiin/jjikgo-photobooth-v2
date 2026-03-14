import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Receipt, Plus, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const resp = await axios.get(`${API_URL}/api/branches`);
      setBranches(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/branches`, newBranch);
      setIsModalOpen(false);
      setNewBranch({ name: '', location: '' });
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Branches</h1>
          <p className="text-slate-500 mt-1">Manage all studio locations and their operational data.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${branch.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {branch.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{branch.name}</h3>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-6">
              <MapPin size={14} />
              {branch.location || 'No location set'}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Staff</div>
                <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  {branch._count?.users || 0}
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Tx</div>
                <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Receipt size={18} className="text-slate-400" />
                  {branch._count?.transactions || 0}
                </div>
              </div>
            </div>

            <button className="w-100 py-3 rounded-2xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              View Stats
              <ExternalLink size={16} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-black mb-6">Add New Branch</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Branch Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-black outline-none transition-all font-medium"
                    placeholder="e.g. Serang City"
                    value={newBranch.name}
                    onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-black outline-none transition-all font-medium"
                    placeholder="Full Address"
                    value={newBranch.location}
                    onChange={e => setNewBranch({...newBranch, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
