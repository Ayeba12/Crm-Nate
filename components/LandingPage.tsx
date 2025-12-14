import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Shield, Globe, Zap, CheckCircle2, ChevronRight, Layout, CheckSquare, BarChart3, Users, Star, ArrowUpRight } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 dark:bg-black dark:text-white dark:selection:bg-blue-900/30 overflow-x-hidden">

            {/* Background Grid Texture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-black/80 dark:border-gray-800' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg dark:bg-white dark:text-black">
                        L
                    </div>
                    <span className="text-xl font-bold tracking-tight">LumenCRM</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
                    <a href="#testimonials" className="hover:text-gray-900 dark:hover:text-white transition-colors">Testimonials</a>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onGetStarted} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Log in</button>
                    <button onClick={onGetStarted} className="px-4 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all shadow-md shadow-black/10 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-transparent">
                        Start free trial
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide border border-gray-200 mb-8 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 animate-fadeIn opacity-0 [animation-delay:0.1s] [animation-fill-mode:forwards]">
                        <Sparkles size={12} className="mr-2 text-amber-500" />
                        v2.0 is live: Tasks & Automations
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-600 animate-slideUp opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
                        Think, plan, and close<br /> in one place.
                    </h1>

                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed dark:text-gray-400 animate-slideUp opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
                        The CRM built for modern revenue teams. Beautifully designed pipelines, powerful tasks, and seamless billing.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slideUp opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
                        <button onClick={onGetStarted} className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                            Start free trial
                        </button>
                        <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all hover:border-gray-300 w-full sm:w-auto dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 shadow-sm">
                            Watch product tour
                        </button>
                    </div>
                </div>

                {/* Floating UI Cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] pointer-events-none z-0 hidden lg:block opacity-0 animate-fadeIn [animation-delay:0.6s] [animation-fill-mode:forwards]">
                    {/* Card 1: Pipeline */}
                    <div className="absolute top-20 -left-10 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 transform -rotate-6 animate-float dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-3/4 bg-gray-100 rounded dark:bg-gray-800"></div>
                            <div className="h-20 bg-blue-50 rounded-lg border border-blue-100 p-3 dark:bg-blue-900/20 dark:border-blue-800">
                                <div className="h-2 w-1/2 bg-blue-200 rounded mb-2 dark:bg-blue-800"></div>
                                <div className="h-2 w-1/3 bg-blue-100 rounded dark:bg-blue-900"></div>
                            </div>
                            <div className="h-20 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700"></div>
                        </div>
                    </div>

                    {/* Card 2: Task */}
                    <div className="absolute bottom-40 -right-20 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 transform rotate-6 animate-float [animation-delay:1s] dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Today's Tasks</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 dark:bg-gray-800 dark:text-gray-400">3</span>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-default dark:hover:bg-gray-800">
                                    <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"></div>
                                    <div className="h-2 w-24 bg-gray-100 rounded dark:bg-gray-700"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Product Section */}
            <section id="features" className="py-24 px-4 bg-gray-50/50 border-t border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6 dark:bg-blue-900/30 dark:text-blue-400">
                                <BarChart3 size={12} className="mr-2" />
                                Interactive Pipelines
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Complete visibility over every deal.</h2>
                            <p className="text-lg text-gray-500 mb-8 leading-relaxed dark:text-gray-400">
                                Visualize your sales process with a drag-and-drop board that actually feels good to use. Custom stages, automated probability, and instant updates.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Drag-and-drop deal management',
                                    'Customizable stages and workflows',
                                    'Revenue forecasting included'
                                ].map(item => (
                                    <li key={item} className="flex items-center text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 size={18} className="text-blue-600 mr-3 dark:text-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                                {/* Mock UI */}
                                <div className="border-b border-gray-100 p-4 flex items-center gap-4 dark:border-gray-800">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="h-2 w-32 bg-gray-100 rounded dark:bg-gray-800"></div>
                                </div>
                                <div className="p-6 grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map(col => (
                                        <div key={col} className="space-y-3">
                                            <div className="h-3 w-16 bg-gray-100 rounded mb-4 dark:bg-gray-800"></div>
                                            {[1, 2].map(card => (
                                                <div key={card} className="bg-gray-50 rounded-lg p-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                                    <div className="h-2 w-12 bg-gray-200 rounded mb-2 dark:bg-gray-600"></div>
                                                    <div className="h-2 w-20 bg-gray-200 rounded dark:bg-gray-600"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 bg-white dark:bg-black">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
                        <p className="text-gray-500 text-lg">Start for free, scale as you grow. No hidden fees.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Starter */}
                        <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800">
                            <h3 className="font-semibold text-lg mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">Perfect for freelancers and solo founders.</p>
                            <button onClick={onGetStarted} className="w-full py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-8 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">Start for free</button>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Up to 500 leads</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Basic pipelines</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> 7-day retention</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="p-8 bg-black text-white rounded-2xl shadow-xl relative overflow-hidden dark:bg-white dark:text-black transform scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Popular</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$29</span>
                                <span className="text-gray-400 dark:text-gray-600">/mo</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6 dark:text-gray-600">For growing teams that need power.</p>
                            <button onClick={onGetStarted} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-8 shadow-lg shadow-blue-500/30">Get Started</button>
                            <ul className="space-y-3 text-sm text-gray-300 dark:text-gray-700">
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-blue-400 mr-2 dark:text-blue-600" /> Unlimited leads</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-blue-400 mr-2 dark:text-blue-600" /> Advanced analytics</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-blue-400 mr-2 dark:text-blue-600" /> Task automation</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-blue-400 mr-2 dark:text-blue-600" /> Priority support</li>
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800">
                            <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$99</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">Custom solutions for large organizations.</p>
                            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-8 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Contact Sales</button>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> SSO & Audit logs</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Dedicated manager</li>
                                <li className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Custom API limits</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Loved by modern teams</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">Join thousands of companies closing deals faster.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "It's the first CRM that doesn't feel like data entry. We actually enjoy using it.",
                                author: "Alex Rivera",
                                role: "VP Sales, TechStart",
                                color: "bg-blue-100 text-blue-600"
                            },
                            {
                                quote: "The task automation alone saved us 20 hours a week. Incredible ROI.",
                                author: "Sarah Chen",
                                role: "Founder, GrowthBox",
                                color: "bg-purple-100 text-purple-600"
                            },
                            {
                                quote: "Simple, beautiful, and fast. Exactly what we needed to scale from 10 to 50 people.",
                                author: "Mark Johnson",
                                role: "CRO, ScaleUp",
                                color: "bg-green-100 text-green-600"
                            }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
                                <div className="flex items-center gap-1 mb-6 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-gray-700 mb-6 text-lg leading-relaxed dark:text-gray-300">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                                        {t.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{t.author}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">Frequently asked questions</h2>
                        <p className="text-gray-500 dark:text-gray-400">Everything you need to know about LumenCRM.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Is there a free trial?", a: "Yes, we offer a 14-day free trial on all paid plans. You can cancel anytime during the trial period." },
                            { q: "Can I import my data?", a: "Absolutely. We support CSV imports and have native integrations with Google Contacts and Outlook." },
                            { q: "How secure is my data?", a: "Security is our top priority. We use bank-grade AES-256 encryption and are SOC2 compliant." },
                            { q: "Do you offer enterprise plans?", a: "Yes, for teams larger than 50, we offer custom enterprise plans with dedicated support and advanced security features." },
                            { q: "Does it work on mobile?", a: "Yes, LumenCRM is fully responsive and has native apps for iOS and Android (coming soon)." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 open:bg-white dark:open:bg-gray-800/50 transition-all duration-200">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {faq.q}
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 bg-white dark:bg-black dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold dark:bg-white dark:text-black">L</div>
                        <span className="font-bold text-gray-900 dark:text-white">LumenCRM</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">Twitter</a>
                    </div>
                    <div className="text-sm text-gray-400">
                        © 2024 LumenCRM Inc.
                    </div>
                </div>
            </footer>

            <style>{`
                html { scroll-behavior: smooth; }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(-6deg); }
                    50% { transform: translateY(-20px) rotate(-6deg); }
                    100% { transform: translateY(0px) rotate(-6deg); }
                }
                @keyframes float-reverse {
                    0% { transform: translateY(0px) rotate(6deg); }
                    50% { transform: translateY(-15px) rotate(6deg); }
                    100% { transform: translateY(0px) rotate(6deg); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default LandingPage;
