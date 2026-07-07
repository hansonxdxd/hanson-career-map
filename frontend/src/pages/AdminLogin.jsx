import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatApiErrorDetail } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const AdminLogin = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">內容管理後台</h1>
            <p className="text-slate-400 text-sm">Career Evolution Map CMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-slate-300 mb-2 block">電子郵件</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  className="pl-10 bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 mb-2 block">密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  className="pl-10 bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3" data-testid="login-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              data-testid="login-submit-button"
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              {submitting ? '登入中...' : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  登入
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
