import { useState } from 'react';
import { Hotel, User, Lock, Eye, EyeOff, CheckCircle2, ChevronRight, Building2 } from 'lucide-react';
import styles from './SetupWizardPage.module.css';

const SetupWizardPage = ({ onSetupComplete }) => {
    const [step, setStep] = useState(1); // 1 = Hotel Info, 2 = Admin Account
    const [formData, setFormData] = useState({
        hotelName: '',
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

    const handleStep1Next = () => {
        if (!formData.hotelName.trim()) {
            setError('Vui lòng nhập tên khách sạn');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!formData.fullName.trim() || !formData.username.trim() || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:8080/api/system/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotelName: formData.hotelName,
                    fullName: formData.fullName,
                    username: formData.username,
                    password: formData.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi khởi tạo');
            setDone(true);
            setTimeout(() => onSetupComplete(), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className={styles.doneScreen}>
                <CheckCircle2 size={64} className={styles.doneIcon} />
                <h1>Khởi tạo thành công!</h1>
                <p>Đang chuyển bạn đến trang đăng nhập...</p>
            </div>
        );
    }

    return (
        <div className={styles.wizardPage}>
            {/* Decorative background blobs */}
            <div className={styles.blob1}></div>
            <div className={styles.blob2}></div>

            <div className={styles.wizardCard}>
                {/* Header */}
                <div className={styles.wizardHeader}>
                    <div className={styles.logoCircle}>
                        <Hotel size={32} />
                    </div>
                    <h1 className={styles.wizardTitle}>Chào mừng đến với hệ thống</h1>
                    <p className={styles.wizardSubtitle}>Cấu hình lần đầu để bắt đầu sử dụng</p>
                </div>

                {/* Step Indicator */}
                <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}>
                        <Building2 size={14} />
                    </div>
                    <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ''}`}></div>
                    <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}>
                        <User size={14} />
                    </div>
                </div>
                <div className={styles.stepLabels}>
                    <span className={step === 1 ? styles.stepLabelActive : ''}>Thông tin khách sạn</span>
                    <span className={step === 2 ? styles.stepLabelActive : ''}>Tài khoản quản trị</span>
                </div>

                {/* Step 1: Hotel Info */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <label><Building2 size={15} /> Tên khách sạn *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.hotelName}
                                onChange={e => update('hotelName', e.target.value)}
                                placeholder="VD: Grand Palace Hotel"
                                onKeyDown={e => e.key === 'Enter' && handleStep1Next()}
                                autoFocus
                            />
                        </div>
                        {error && <p className={styles.errorMsg}>{error}</p>}
                        <button className={styles.btnNext} onClick={handleStep1Next}>
                            Tiếp theo <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Admin Account */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <label><User size={15} /> Họ và tên quản trị viên *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.fullName}
                                onChange={e => update('fullName', e.target.value)}
                                placeholder="VD: Nguyễn Văn A"
                                autoFocus
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><User size={15} /> Tên đăng nhập *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.username}
                                onChange={e => update('username', e.target.value)}
                                placeholder="VD: admin"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Lock size={15} /> Mật khẩu *</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    value={formData.password}
                                    onChange={e => update('password', e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    autoComplete="new-password"
                                />
                                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label><Lock size={15} /> Xác nhận mật khẩu *</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                value={formData.confirmPassword}
                                onChange={e => update('confirmPassword', e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                        </div>

                        {error && <p className={styles.errorMsg}>{error}</p>}

                        <div className={styles.btnRow}>
                            <button className={styles.btnBack} onClick={() => { setStep(1); setError(''); }}>
                                Quay lại
                            </button>
                            <button className={styles.btnFinish} onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? <span className={styles.spinner}></span> : 'Hoàn tất thiết lập'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetupWizardPage;
