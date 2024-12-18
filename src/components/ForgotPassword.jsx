import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const checkUserExists = async (email) => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length > 0;
        } catch (error) {
            console.error('Error checking user:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            // Check if user exists first
            const exists = await checkUserExists(email);
            if (!exists) {
                setError('No account found with this email address.');
                return;
            }

            // Updated actionCodeSettings
            const actionCodeSettings = {
                url: 'http://localhost:5173/reset-password',
                handleCodeInApp: false,
            };

            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            console.log("Password reset email sent successfully");
            setMessage('Password reset email sent! Please check your inbox and spam folder.');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                fullError: error
            });
            let errorMessage = 'Failed to send reset email. ';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Please enter a valid email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many attempts. Please try again later.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#f0f2f5',
            fontFamily: 'Roboto, sans-serif'
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            transition: 'transform 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)'
            }
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
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            '&:focus': {
                borderColor: '#3498db',
                boxShadow: '0 0 0 4px rgba(52, 152, 219, 0.1)'
            }
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
            marginTop: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.1s ease',
            '&:hover': {
                backgroundColor: '#2980b9'
            },
            '&:active': {
                transform: 'scale(0.98)'
            }
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
        },
        loadingSpinner: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid rgba(255,255,255,.3)',
            borderRadius: '50%',
            borderTopColor: '#fff',
            animation: 'spin 1s ease-in-out infinite'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Reset Password</h2>
                {message && <div style={styles.message}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        style={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span style={styles.loadingSpinner}></span>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>
                <button 
                    onClick={() => navigate('/')} 
                    style={styles.submitButton}
                    disabled={isLoading}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword; 