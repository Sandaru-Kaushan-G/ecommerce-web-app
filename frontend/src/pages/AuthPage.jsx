import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (isLogin) {
        // Login සාර්ථක වූ පසු State එක update කර අදාළ Role එකට යවයි
        login(res.data);
        if (res.data.role === 'admin') navigate('/admin');
        else if (res.data.role === 'staff') navigate('/staff');
        else navigate('/');
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', color: '#333' }}>
      <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isLogin && (
          <div>
            <label>Name:</label>
            <input 
              type="text" 
              name="name" 
              required 
              onChange={handleChange} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
            />
          </div>
        )}

        <div>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            required 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            required 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        {!isLogin && (
          <div>
            <label>Select Role (For Testing):</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </span>
      </p>
    </div>
  );
}