import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Lock, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Load saved credentials on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('hotel_remember_username');
        const savedPassword = localStorage.getItem('hotel_remember_password');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const user = await login(username, password);

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('hotel_remember_username', username);
                localStorage.setItem('hotel_remember_password', password);
            } else {
                localStorage.removeItem('hotel_remember_username');
                localStorage.removeItem('hotel_remember_password');
            }

            if (user.role === 'ADMIN') {
                navigate('/admin/rooms');
            } else {
                navigate('/receptionist/rooms');
            }
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageBackground}>

            {/* Top Navigation */}
            <nav className={styles.topNav}>
                <div className={styles.navLeft}>
                    <strong>Hotel MIXI</strong>
                </div>
                <div className={styles.navRight}>
                    <span className={styles.navActive}>Đăng Nhập</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContainer}>

                <div className={styles.loginCard}>
                    {/* Enterprise Tag */}
                    <div className={styles.enterpriseTag}>
                        <span className={styles.tagPrimary}>ENTERPRISE PORTAL</span>
                        <span className={styles.tagDivider}>/</span>
                        <span className={styles.tagSecondary}>AUTHENTICATION</span>
                    </div>

                    {/* Logo & Titles */}
                    <div className={styles.logoBox}>
                        <Building2 size={24} className={styles.logoIcon} />
                    </div>

                    <h1 className={styles.title}>Quản Lý Khách Sạn</h1>
                    <p className={styles.subtitle}>Hệ thống quản lý nội bộ chuyên nghiệp</p>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.formContainer}>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="username">TÊN ĐĂNG NHẬP</label>
                            <div className={styles.inputWrapper}>
                                <User size={18} className={styles.inputIcon} />
                                <input
                                    id="username"
                                    type="text"
                                    className={styles.inputUnderline}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên tài khoản của bạn"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="password">MẬT KHẨU</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.inputUnderline}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Extra Options */}
                        <div className={styles.optionsRow}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className={styles.checkboxText}>Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className={styles.forgotLink} onClick={e => { e.preventDefault(); setShowForgotModal(true); }}>Quên mật khẩu?</a>
                        </div>

                        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
                            {!isLoading && <ArrowRight size={18} className={styles.btnIconDir} />}
                        </button>
                    </form>
                </div>

            </main>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Quên mật khẩu</h3>
                            <button className={styles.modalCloseBtn} onClick={() => setShowForgotModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Vì đây là hệ thống quản trị nội bộ, vui lòng liên hệ trực tiếp với <strong>Quản trị viên (Admin)</strong> để được cấp lại mật khẩu mới.</p>
                            <p style={{ marginTop: '0.5rem' }}>Hotline hỗ trợ: <strong style={{color: '#4f46e5'}}>1900 1234</strong></p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.modalOkBtn} onClick={() => setShowForgotModal(false)}>
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Footer */}
            <footer className={styles.bottomFooter}>
                <div className={styles.footerLeft}>© 2026 HOTEL MIXI.</div>
                <div className={styles.footerRight}>
                    <span>SUPPORT</span>
                    <span>TERMS</span>
                    <span>PRIVACY</span>
                </div>
            </footer>

        </div>
    );
};

export default LoginPage;
