import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BranchContext = createContext(null);

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // null = All Branches
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/branches`);
      setBranches(data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    } finally {
      setLoading(false);
    }
  };

  const selectBranch = (branchId) => {
    // branchId = null means "All Branches"
    const branch = branchId ? branches.find(b => b.id === branchId) : null;
    setSelectedBranch(branch);
  };

  return (
    <BranchContext.Provider value={{
      branches,
      selectedBranch,
      selectBranch,
      refreshBranches: fetchBranches,
      loading,
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
