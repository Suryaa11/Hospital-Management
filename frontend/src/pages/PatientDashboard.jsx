import { useState, useEffect } from 'react';
import { useAuthStore, api } from '../store/useAuthStore';
import { LogOut, Search, CalendarPlus, UserCircle, Stethoscope } from 'lucide-react';

export default function PatientDashboard() {
    const { logout } = useAuthStore();
    const [doctors, setDoctors] = useState([]);
    const [specialization, setSpecialization] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
    }, []);

    const fetchDoctors = async () => {
        try {
            const url = specialization ? `/users/doctors?specialization=${specialization}` : `/users/doctors`;
            const res = await api.get(url);
            setDoctors(res.data);
        } catch (error) {
            console.error("Failed to fetch doctors");
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/my-appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error("Failed to fetch appointments");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    const viewAvailability = async (doctorId) => {
        try {
            const res = await api.get(`/appointments/availability/${doctorId}`);
            setAvailabilities(res.data);
            setSelectedDoctor(doctorId);
        } catch (error) {
            console.error("Failed to fetch availability");
        }
    };

    const bookAppointment = async (availabilityId) => {
        try {
            await api.post('/appointments/book', { availabilityId });
            setMsg({ text: 'Appointment booked successfully!', type: 'success' });
            fetchAppointments();
            setAvailabilities(availabilities.filter(a => a._id !== availabilityId));
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Booking failed', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
                    <UserCircle className="text-blue-600" /> Patient Portal
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-red-500 flex items-center gap-1 font-medium transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Col: Doctors & Booking */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Stethoscope size={20}/> Find a Doctor</h2>
                    
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            placeholder="Filter by Specialization (e.g. Cardiology)" 
                            value={specialization} 
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="flex-1 border p-2 rounded-lg outline-blue-500"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
                            <Search size={18}/> Search
                        </button>
                    </form>

                    {msg.text && <div className={`p-3 rounded-lg mb-4 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg.text}</div>}

                    <div className="space-y-4">
                        {doctors.map(doc => (
                            <div key={doc.userId} className="glass-panel p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{doc.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                                    </div>
                                    <button onClick={() => viewAvailability(doc.userId)} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                                        View Slots
                                    </button>
                                </div>
                                
                                {selectedDoctor === doc.userId && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <h4 className="text-sm font-semibold mb-2 text-slate-700">Available Slots</h4>
                                        {availabilities.length === 0 ? (
                                            <p className="text-sm text-slate-500">No slots available right now.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {availabilities.map(slot => (
                                                    <button 
                                                        key={slot._id}
                                                        onClick={() => bookAppointment(slot._id)}
                                                        className="text-xs bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 p-2 rounded-md transition-all shadow-sm flex flex-col items-center"
                                                    >
                                                        <span>{new Date(slot.date).toLocaleDateString()}</span>
                                                        <span className="font-semibold">{slot.startTime}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col: My Appointments */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><CalendarPlus size={20}/> My Appointments</h2>
                    <div className="glass-panel p-6 space-y-4">
                        {appointments.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">You have no upcoming appointments.</p>
                        ) : (
                            appointments.map(app => (
                                <div key={app._id} className="border-b last:border-0 pb-4 last:pb-0">
                                    <p className="font-semibold text-slate-800">Date: {new Date(app.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-600">Time: {app.startTime} - {app.endTime}</p>
                                    <p className="mt-2 text-sm">
                                        Status: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : app.status === 'Completed' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{app.status}</span>
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
