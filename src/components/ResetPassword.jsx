import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

const ResetPassword = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const oobCode = query.get('oobCode');

    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    if (!oobCode) {
        return (
            <div style={styles.container}>
                <div style={styles.formContainer}>
                    <h2 style={styles.title}>Invalid Reset Link</h2>
                    <p style={styles.error}>
                        This password reset link is invalid or has expired.
                        Please request a new one.
                    </p>
                    <button 
                        onClick={() => navigate('/forgot-password')} 
                        style={styles.submitButton}
                    >
                        Request New Reset Link
                    </button>
                </div>
            </div>
        );
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess('Password has been reset successfully!');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            console.error('Error resetting password:', error);
            switch (error.code) {
                case 'auth/expired-action-code':
                    setError('This reset link has expired. Please request a new one.');
                    break;
                case 'auth/invalid-action-code':
                    setError('This reset link is invalid. Please request a new one.');
                    break;
                case 'auth/weak-password':
                    setError('Please choose a stronger password (at least 6 characters).');
                    break;
                default:
                    setError('Failed to reset password: ' + error.message);
            }
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: 'Roboto, sans-serif'
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px'
        },
        title: {
            color: '#333',
            fontSize: '1.8rem',
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '1.5rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            color: '#333',
            backgroundColor: '#ffffff',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
        },
        submitButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
        },
        message: {
            color: 'green',
            textAlign: 'center',
            marginBottom: '1rem'
        },
        error: {
            color: 'red',
            textAlign: 'center',
            marginBottom: '1rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Reset Your Password</h2>
                {success && <div style={styles.message}>{success}</div>}
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleResetPassword} style={styles.form}>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.submitButton}>
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 