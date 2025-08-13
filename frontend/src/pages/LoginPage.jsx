// File: src/pages/LoginPage.jsx
// Halaman untuk login pengguna.

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiLogin } from '../api/apiService';

const LoginPage = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await apiLogin(username, password);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login Gagal');
            }
            login(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Login sekarang!</h1>
                    <p className="py-6">Masuk untuk mengakses sistem ERP Custom Made Anda.</p>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form className="card-body" onSubmit={handleSubmit}>
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="form-control">
                            <label className="label"><span className="label-text">Username</span></label>
                            <input type="text" placeholder="username" className="input input-bordered" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <input type="password" placeholder="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;