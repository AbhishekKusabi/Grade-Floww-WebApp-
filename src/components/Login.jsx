import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            setError('Invalid email or password');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            minWidth: '100vw',
            backgroundColor: '#f0f2f5',
            padding: '20px',
            margin: 0,
            boxSizing: 'border-box'
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
        },
        title: {
            textAlign: 'center',
            color: '#1a1a1a',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '30px'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        label: {
            color: '#4b5563',
            fontSize: '14px',
            fontWeight: '500'
        },
        input: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '16px',
            transition: 'border-color 0.2s',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: '#000000',
            '&:focus': {
                borderColor: '#3b82f6',
                backgroundColor: '#ffffff'
            },
            '&::placeholder': {
                color: '#9ca3af'
            }
        },
        button: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#2563eb'
            }
        },
        error: {
            color: '#ef4444',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '20px'
        },
        forgotPassword: {
            textAlign: 'center',
            marginTop: '20px'
        },
        link: {
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '14px',
            '&:hover': {
                textDecoration: 'underline'
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Welcome to GradeFlow</h1>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your college email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Sign In
                    </button>
                </form>

                <div style={styles.forgotPassword}>
                    <Link to="/forgot-password" style={styles.link}>
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login; 