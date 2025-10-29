import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ShopSale = () => {
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({
    plantId: '',
    salePrice: '',
    quantity: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
  api.get('/plants').then(res => setPlants(res.data.data)).catch(() => toast.error('Failed to load plants'));
  fetchSales(selectedDate);
  }, [selectedDate]);

  const fetchSales = async (date) => {
    try {
      const res = await api.get(`/stock/shop-sale?date=${date}`);
      setSales(res.data.data);
    } catch {
      setSales([]);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.plantId || !form.salePrice || !form.quantity) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/stock/shop-sale', form);
      toast.success('Sale recorded!');
      setForm({ ...form, salePrice: '', quantity: '', description: '' });
      fetchSales(selectedDate);
    } catch {
      toast.error('Failed to record sale');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Record Shop Sale</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plant Name</label>
            <select name="plantId" value={form.plantId} onChange={handleChange} required className="w-full border rounded px-3 py-2">
              <option value="">Select Plant</option>
              {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
            <input name="salePrice" value={form.salePrice} onChange={handleChange} required type="number" min="1" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity Sold</label>
            <input name="quantity" value={form.quantity} onChange={handleChange} required type="number" min="1" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input name="date" value={form.date} onChange={handleChange} type="date" disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition">{loading ? 'Recording...' : 'Record Sale'}</button>
          </div>
        </form>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Sales for {selectedDate}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-48 border rounded px-3 py-2" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Plant Name</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Sale Price (₹)</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No sales recorded for this date.</td></tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale._id}>
                    <td className="px-4 py-2">{sale.plant?.name || '-'}</td>
                    <td className="px-4 py-2">{sale.quantity}</td>
                    <td className="px-4 py-2">₹{sale.salePrice}</td>
                    <td className="px-4 py-2">{sale.description || '-'}</td>
                    <td className="px-4 py-2">{new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopSale;
