import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AtSign, Loader2, Info } from 'lucide-react';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('standard_user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const getStrengthDetails = (pass) => {
        let score = 0;
        if (!pass) return { score: 0, text: '', color: 'bg-gray-800' };
        
        if (pass.length > 0) score += 1;
        if (pass.length >= 8) score += 1;
        if (pass.length >= 8 && (/[A-Z]/.test(pass) || /[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass))) score += 1;
        if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
        
        const colors = ['bg-gray-800', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-accent'];
        const texts = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        
        return { score, text: texts[score], color: colors[score] };
    };

    const strength = getStrengthDetails(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!isLogin && password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        const res = isLogin 
            ? await login(username, password)
            : await register(username, password, role);
            
        if (!res.success) {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-6 font-sans selection:bg-accent/30">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-accent to-purple-500 p-[2px] shadow-2xl shadow-accent/20 mb-6">
                        <div className="w-full h-full rounded-[22px] bg-[#161b2a] flex items-center justify-center">
                            <Shield className="text-accent" size={40} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-3">NimbusFS</h1>
                    <p className="text-gray-500 font-medium">Distributed Cloud Architecture & Storage</p>
                </div>

                <div className="bg-[#161b2a]/80 backdrop-blur-xl border border-gray-800 rounded-[32px] p-8 shadow-2xl">
                    <div className="flex bg-[#0f111a] rounded-2xl p-1 mb-8">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#0f111a] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent transition-all placeholder:text-gray-700"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0f111a] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            {!isLogin && password && (
                                <div className="mt-4 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <div className="flex gap-1.5 h-1.5 mb-2.5">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div 
                                                key={level} 
                                                className={`flex-1 rounded-full transition-all duration-500 ${strength.score >= level ? strength.color : 'bg-gray-800'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className={`${strength.score >= 3 ? 'text-green-400' : 'text-gray-500'} transition-colors duration-300`}>
                                            {strength.text} Password
                                        </span>
                                        <span className={`${password.length >= 8 ? 'text-green-400' : 'text-gray-500'} transition-colors duration-300`}>
                                            {password.length}/8+ Chars
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Account Role</label>
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-[#0f111a] border border-gray-800 rounded-2xl py-3.5 px-4 text-sm font-bold transition-all focus:outline-none focus:border-accent appearance-none cursor-pointer"
                                >
                                    <option value="standard_user">Standard User</option>
                                    <option value="administrator">Administrator</option>
                                </select>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs font-bold animate-shake">
                                <Info size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-hover py-4 rounded-2xl text-white font-black tracking-widest uppercase text-xs shadow-xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Authenticate Session' : 'Create Primary Account')}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                    Secured by NimbusFS Quantum Cryptography
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
