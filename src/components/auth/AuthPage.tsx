import React, { useState } from 'react';
import { 
  Mail, Lock, User, CheckCircle2, Shield, 
  GraduationCap, BookOpen, AlertCircle, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showDemoList, setShowDemoList] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), role);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 sm:p-6 text-left">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A73E8] text-white font-bold text-xl shadow-xs mb-2">
            CF
          </div>
          <h1 className="text-2xl font-bold text-[#202124]">
            ClassFlow
          </h1>
          <p className="text-xs text-[#5F6368]">
            Academic Learning Platform
          </p>
        </div>

        {/* Main Box */}
        <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xs p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#D93025] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#DADCE0]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`pb-2.5 text-xs font-semibold flex-1 text-center transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-[#1A73E8] text-[#1A73E8]'
                  : 'border-transparent text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`pb-2.5 text-xs font-semibold flex-1 text-center transition-colors border-b-2 ${
                mode === 'register'
                  ? 'border-[#1A73E8] text-[#1A73E8]'
                  : 'border-transparent text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@classflow.demo"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prof. Alice Smith"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice.smith@university.edu"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      role === 'student'
                        ? 'bg-blue-50 border-[#1A73E8] text-[#1A73E8]'
                        : 'border-[#DADCE0] text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      role === 'teacher'
                        ? 'bg-blue-50 border-[#1A73E8] text-[#1A73E8]'
                        : 'border-[#DADCE0] text-[#5F6368] hover:bg-slate-50'
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Quick Test Accounts Accordion */}
          <div className="pt-2 border-t border-[#DADCE0]">
            <button
              type="button"
              onClick={() => setShowDemoList(!showDemoList)}
              className="w-full flex items-center justify-between text-xs text-[#5F6368] hover:text-[#202124] font-medium py-1"
            >
              <span>Quick Test Logins</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoList ? 'rotate-180' : ''}`} />
            </button>

            {showDemoList && (
              <div className="mt-2 space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => quickLogin('amit.kulkarni@classflow.demo')}
                  className="w-full p-2 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DADCE0] rounded-lg text-left flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#202124]">Dr. Amit Kulkarni (OS Teacher)</span>
                  <span className="text-[10px] text-[#1A73E8] font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('aarav.sharma@classflow.demo')}
                  className="w-full p-2 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DADCE0] rounded-lg text-left flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#202124]">Aarav Sharma (Student)</span>
                  <span className="text-[10px] text-[#188038] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('admin@classflow.demo')}
                  className="w-full p-2 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DADCE0] rounded-lg text-left flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#202124]">Platform Admin</span>
                  <span className="text-[10px] text-[#7627BB] font-semibold bg-purple-50 px-1.5 py-0.5 rounded">Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
