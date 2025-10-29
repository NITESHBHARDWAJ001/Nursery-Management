import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ShopSalesExport = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      let params = `?format=${format}`;
      if (from && to) {
        params += `&from=${from}&to=${to}`;
      } else if (from) {
        params += `&from=${from}`;
      } else if (to) {
        params += `&to=${to}`;
      }
      const res = await api.get(`/stock/export-shop-sales${params}`);
      if (res.data.success && res.data.url) {
        const url = `http://localhost:5000${res.data.url}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        link.click();
        window.open(url, '_blank');
        toast.success(`Exported sales as ${format.toUpperCase()}`);
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Export Shop Sales Data</h2>
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40 border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40 border rounded px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleExport('csv')} disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition">Export CSV</button>
          <button onClick={() => handleExport('pdf')} disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition">Export PDF</button>
        </div>
      </div>
    </div>
  );
};

export default ShopSalesExport;
