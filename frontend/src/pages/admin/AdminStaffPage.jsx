import { useState, useEffect } from 'react';
import { Plus, LockKeyhole, LockKeyholeOpen, X, Users, UserCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminTable.module.css';
import modalStyles from '../../components/Modal.module.css';
import Toast from '../../components/Toast';

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const SkeletonRow = () => (
    <tr>
        {[1, 2, 3, 4, 5].map(i => (
            <td key={i}><div className={`skeleton ${styles.skeletonCell}`} /></td>
        ))}
    </tr>
);

const AdminStaffPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', fullName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const { user: currentUser } = useAuth();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;

    const fetchUsers = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            setUsers(await api.get('/users'));
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Auto-refresh data in background every 5 seconds for Real-time UX
        const intervalId = setInterval(() => {
            fetchUsers(false);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleToggle = async (u) => {
        await api.put(`/users/${u.id}/toggle`);
        setToast({ message: u.active ? `Đã khóa tài khoản ${u.fullName}` : `Đã mở khóa ${u.fullName}`, type: 'info' });
        fetchUsers(false);
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!formData.username || !formData.password || !formData.fullName) {
            setError('Vui lòng điền đầy đủ thông tin'); return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/users', formData);
            setShowModal(false);
            setFormData({ username: '', password: '', fullName: '' });
            setToast({ message: `Đã tạo tài khoản cho ${formData.fullName}`, type: 'success' });
            fetchUsers(false);
        } catch (err) {
            setError(err.message || 'Lỗi khi tạo tài khoản');
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleBadge = (role) => (
        <span className={`${styles.badge} ${role === 'ADMIN' ? styles.badgeOccupied : styles.badgeBlue}`}>
            {role === 'ADMIN' ? 'QUẢN TRỊ' : 'LỄ TÂN'}
        </span>
    );

    const formatLastActive = (dateArray) => {
        if (!dateArray) return 'Chưa từng online';

        // Parse array or String returned by Spring Boot LocalDateTime
        let parsedDate;
        if (Array.isArray(dateArray)) {
            const [year, month, day, hour, minute, second] = dateArray;
            parsedDate = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
        } else {
            // Backend sends "YYYY-MM-DDThh:mm:ss", which is already server local time.
            // Using new Date() without 'Z' preserves local interpretation.
            parsedDate = new Date(dateArray);
        }

        const diffMs = new Date() - parsedDate;
        // Fix Negative Time (due to slight server-client clock drift)
        if (diffMs < 0) return 'Vài giây trước';

        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Vài giây trước';
        if (diffMins < 60) return `${diffMins} phút trước`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    };

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, Math.min(indexOfLastUser, users.length));
    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1><Users size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Quản lý Nhân sự</h1>
                <button onClick={() => { setError(''); setFormData({ username: '', password: '', fullName: '' }); setShowModal(true); }}
                    className={styles.btnAdd}>
                    <Plus size={16} /> Thêm nhân viên
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableToolbar} style={{ justifyContent: 'flex-end' }}>
                    <div className={styles.tableInfo}>
                        Hiển thị {users.length > 0 ? indexOfFirstUser + 1 : 0} - {Math.min(indexOfLastUser, users.length)} trên {users.length} kết quả
                    </div>
                </div>

                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>NHÂN VIÊN</th>
                                <th>TÊN ĐĂNG NHẬP</th>
                                <th>VAI TRÒ</th>
                                <th>TRẠNG THÁI</th>
                                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                                : currentUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatarSmall}>{getInitials(u.fullName)}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{getInitials(u.fullName)}</span>
                                                    <strong>{u.fullName}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.monoText}>{u.username}</td>
                                        <td>{roleBadge(u.role)}</td>
                                        <td>
                                            {!u.active ? (
                                                <span className={`${styles.badge} ${styles.badgeGray}`}>ĐÃ KHÓA</span>
                                            ) : u.online ? (
                                                <span className={`${styles.badge} ${styles.badgeAvailable}`}>ĐANG HOẠT ĐỘNG</span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles.badgeGray}`}>
                                                    OFFLINE • {formatLastActive(u.lastActiveAt)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {u.id !== currentUser?.id && u.role !== 'ADMIN' && (
                                                    <button
                                                        className={`${styles.btnIcon} ${u.active ? styles.danger : styles.success}`}
                                                        onClick={() => handleToggle(u)}
                                                        title={u.active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                    >
                                                        {u.active ? <LockKeyhole size={15} /> : <LockKeyholeOpen size={15} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {!loading && users.length === 0 && (
                    <div className={styles.emptyState}>
                        <UserCircle2 size={32} style={{ opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
                        Chưa có nhân viên nào.
                    </div>
                )}

                {users.length > usersPerPage && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={16} /> Trang trước
                        </button>
                        <div className={styles.pageNumbers}>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx + 1}
                                    className={`${styles.pageNumber} ${currentPage === idx + 1 ? styles.active : ''}`}
                                    onClick={() => setCurrentPage(idx + 1)}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                            Trang sau <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className={modalStyles.modalOverlay}>
                    <div className={`${modalStyles.modalContent} ${modalStyles.checkoutModal}`}>
                        <div className={modalStyles.modalHeader}>
                            <h2>Thêm nhân viên mới</h2>
                            <button onClick={() => setShowModal(false)} className={modalStyles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={modalStyles.modalBody}>
                            <div className={modalStyles.formGroup}>
                                <label>Họ và tên *</label>
                                <input type="text" value={formData.fullName}
                                    onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                                    placeholder="Nhập họ tên đầy đủ" />
                            </div>
                            <div className={modalStyles.formGroup}>
                                <label>Tên đăng nhập *</label>
                                <input type="text" value={formData.username}
                                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                                    placeholder="VD: nguyenvana" />
                            </div>
                            <div className={modalStyles.formGroup}>
                                <label>Mật khẩu *</label>
                                <input type="password" value={formData.password}
                                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                    placeholder="Nhập mật khẩu" />
                            </div>
                            <p className={styles.helperText}>Tài khoản sẽ được tạo với vai trò <strong>Lễ Tân</strong>.</p>
                            {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
                        </form>
                        <div className={`${modalStyles.modalFooter} ${modalStyles.endingFooter}`}>
                            <button onClick={() => setShowModal(false)} className={modalStyles.btnSecondary}>Hủy</button>
                            <button onClick={handleSubmit} disabled={isSubmitting} className={modalStyles.btnPrimary}>
                                {isSubmitting ? <span className="spinner"></span> : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminStaffPage;
