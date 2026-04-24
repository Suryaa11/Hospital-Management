import { useState, useEffect } from 'react';
import { useAuthStore, api } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { LogOut, Plus, Users, UserPlus } from 'lucide-react';

const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 
    'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 
    'Radiology', 'Surgery', 'Urology', 'Ophthalmology', 'Gynecology', 'Oncology', 'General Medicine'
];

export default function AdminDashboard() {
    const { logout } = useAuthStore();
    const [doctors, setDoctors] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', specialization: 'General Medicine', password: ''
    });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/users/doctors');
            setDoctors(res.data);
        } catch (error) {
            console.error("Failed to fetch doctors");
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setMsg({ text: 'Creating doctor...', type: 'info' });
        try {
            await api.post('/users/doctor', formData);
            setMsg({ text: 'Doctor created and invite sent successfully!', type: 'success' });
            setShowAddForm(false);
            fetchDoctors();
            setFormData({ name: '', email: '', phone: '', specialization: 'General Medicine', password: '' });
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Failed to create doctor', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
                    <Users className="text-blue-600" /> Admin Portal
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-red-500 flex items-center gap-1 font-medium transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Hospital Staff</h1>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Doctor</>}
                    </button>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-lg mb-6 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {msg.text}
                    </div>
                )}

                {showAddForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 mb-8 overflow-hidden">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus size={20}/> New Doctor Profile</h2>
                        <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="border p-2 rounded-lg outline-blue-500" />
                            <input type="email" name="email" required placeholder="Email (Immutable later)" value={formData.email} onChange={handleChange} className="border p-2 rounded-lg outline-blue-500" />
                            <input type="tel" name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="border p-2 rounded-lg outline-blue-500" />
                            <select name="specialization" value={formData.specialization} onChange={handleChange} className="border p-2 rounded-lg outline-blue-500 bg-white">
                                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="text" name="password" required placeholder="Default Password" value={formData.password} onChange={handleChange} className="border p-2 rounded-lg outline-blue-500 md:col-span-2" />
                            <div className="md:col-span-2">
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Create & Send Invite</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b">
                                <th className="p-4 font-semibold text-slate-600">Name</th>
                                <th className="p-4 font-semibold text-slate-600">Specialization</th>
                                <th className="p-4 font-semibold text-slate-600">Email</th>
                                <th className="p-4 font-semibold text-slate-600">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doc => (
                                <tr key={doc._id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800">{doc.name}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{doc.specialization}</span>
                                    </td>
                                    <td className="p-4 text-slate-600">{doc.email}</td>
                                    <td className="p-4 text-slate-600">{doc.phone}</td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No doctors found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
