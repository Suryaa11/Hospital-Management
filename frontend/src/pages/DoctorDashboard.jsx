import { useState, useEffect } from 'react';
import { useAuthStore, api } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { LogOut, Calendar, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorDashboard() {
    const { user, logout } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [availability, setAvailability] = useState({ date: '', startTime: '', endTime: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('appointments'); // appointments, availability, prescription

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/my-appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error("Failed to fetch appointments");
        }
    };

    const handleSetAvailability = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/availability', availability);
            setMsg({ text: 'Availability set successfully!', type: 'success' });
            setAvailability({ date: '', startTime: '', endTime: '' });
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Failed to set availability', type: 'error' });
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            fetchAppointments();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
                    <Clock className="text-blue-600" /> Doctor Portal
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-red-500 flex items-center gap-1 font-medium transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    <button onClick={() => setActiveTab('appointments')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                        <Calendar size={18}/> Appointments
                    </button>
                    <button onClick={() => setActiveTab('availability')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'availability' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                        <Clock size={18}/> Set Availability
                    </button>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'appointments' && (
                        <div className="glass-panel p-6">
                            <h2 className="text-xl font-bold mb-4">Your Appointments</h2>
                            <div className="space-y-4">
                                {appointments.map(app => (
                                    <div key={app._id} className="border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center bg-white shadow-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800">Date: {new Date(app.date).toLocaleDateString()}</p>
                                            <p className="text-sm text-slate-500">Time: {app.startTime} - {app.endTime}</p>
                                            <p className="text-sm text-slate-500">Patient ID: {app.patientId}</p>
                                            <p className="mt-1 font-medium">Status: <span className={`px-2 py-0.5 rounded-full text-xs ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : app.status === 'Completed' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{app.status}</span></p>
                                        </div>
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            {app.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => updateStatus(app._id, 'Accepted')} className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors" title="Accept"><CheckCircle size={20}/></button>
                                                    <button onClick={() => updateStatus(app._id, 'Rejected')} className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors" title="Reject"><XCircle size={20}/></button>
                                                </>
                                            )}
                                            {app.status === 'Accepted' && (
                                                <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center gap-1">
                                                    <FileText size={16}/> Write Prescription
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {appointments.length === 0 && <p className="text-slate-500">No appointments scheduled.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'availability' && (
                        <div className="glass-panel p-6 max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Set Availability</h2>
                            {msg.text && <div className={`p-3 rounded-lg mb-4 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg.text}</div>}
                            <form onSubmit={handleSetAvailability} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input type="date" required value={availability.date} onChange={e => setAvailability({...availability, date: e.target.value})} className="w-full p-2 border rounded-lg outline-blue-500"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                        <input type="time" required value={availability.startTime} onChange={e => setAvailability({...availability, startTime: e.target.value})} className="w-full p-2 border rounded-lg outline-blue-500"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                        <input type="time" required value={availability.endTime} onChange={e => setAvailability({...availability, endTime: e.target.value})} className="w-full p-2 border rounded-lg outline-blue-500"/>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700">Save Availability</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
