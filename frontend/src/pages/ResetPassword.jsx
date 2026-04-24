import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, api } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, checkAuth } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            return setError('Passwords do not match');
        }
        
        try {
            await api.post('/auth/reset-password', { userId: user.userId, newPassword: password });
            await checkAuth(); // refresh user state so isFirstLogin is false
            navigate('/doctor');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full glass-panel p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <KeyRound size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Action Required</h2>
                    <p className="text-sm text-slate-500 mt-2">As this is your first time logging in, you must set a new password.</p>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="password" required placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <input type="password" required placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-all">
                        Reset Password
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
