import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useUser } from '../../../contexts/userContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { setAuth } = useUser();

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('Password is required'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const response = await axios.post('http://localhost:3000/api/v1/users/login', { email: values.email, password: values.password }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                });
                setAuth({ xt: response.data.accessToken });
                navigate("/shop");
                resetForm();
            } catch (error) {
                console.error('Login failed:', error.response?.data || error.message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem', marginTop: "12rem" }}>
            <h2>Login</h2>
            <form onSubmit={formik.handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        style={{ display: 'block', width: '100%', padding: '8px' }}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div style={{ color: 'red' }}>{formik.errors.email}</div>
                    ) : null}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        style={{ display: 'block', width: '100%', padding: '8px' }}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div style={{ color: 'red' }}>{formik.errors.password}</div>
                    ) : null}
                </div>

                <button type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
