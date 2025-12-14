import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2, User, Building2, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
    onAuthSuccess?: () => void;
    onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            company_name: companyName
                        }
                    }
                });
                if (error) throw error;
            }
            if (onAuthSuccess) onAuthSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-50 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
            >
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
            </button>

            {/* Left Panel: Brand & Testimonial */}
            <div className={`hidden lg:flex w-1/2 relative overflow-hidden transition-all duration-500 ease-in-out ${isLogin ? 'bg-gray-900 order-1' : 'bg-blue-600 order-2'}`}>
                {/* Abstract Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white pt-24">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">L</div>
                        <span className="font-bold text-xl tracking-tight">LumenCRM</span>
                    </div>

                    <div className="max-w-md">
                        {isLogin ? (
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold leading-tight">Welcome back to your command center.</h2>
                                <p className="text-gray-400 text-lg">"LumenCRM completely transformed how we manage our deal flow. It's the first CRM our team actually enjoys using."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400"></div>
                                    <div>
                                        <div className="font-semibold">Sarah Jenkins</div>
                                        <div className="text-sm text-gray-400">VP of Sales at TechFlow</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold leading-tight">Start your 14-day free trial today.</h2>
                                <ul className="space-y-4">
                                    {[' Unlimited Pipelines', ' Advanced Analytics', ' Task Automation', ' Priority Support'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-lg text-blue-100">
                                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                                <CheckCircle2 size={14} className="text-white" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-white/40">
                        © 2024 LumenCRM Inc.
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 transition-all duration-500 ease-in-out ${isLogin ? 'order-2' : 'order-1'} bg-white dark:bg-black`}>
                <div className="w-full max-w-md space-y-8 animate-fadeIn">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isLogin ? 'Sign in to your account' : 'Create an account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {isLogin ? 'Enter your details to access your workspace.' : 'No credit card required for trial.'}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 animate-slideUp">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-slideUp">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:focus:ring-white/10 dark:focus:border-white"
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 dark:text-gray-300">Company</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:focus:ring-white/10 dark:focus:border-white"
                                            placeholder="Acme Inc."
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 dark:text-gray-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:focus:ring-white/10 dark:focus:border-white"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">Password</label>
                                {isLogin && <button type="button" className="text-xs text-blue-600 hover:text-blue-500 font-medium">Forgot password?</button>}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:focus:ring-white/10 dark:focus:border-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 dark:bg-black dark:text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-900">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-900">
                            <img src="https://www.svgrepo.com/show/448234/microsoft.svg" className="h-5 w-5 mr-2" alt="Microsoft" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft</span>
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
