import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, BedDouble, Gem, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/api';
import styles from './AdminTable.module.css';
import modalStyles from '../../components/Modal.module.css';
import Toast from '../../components/Toast';

const ROOM_TYPES = ['STANDARD', 'VIP'];

const SkeletonRow = () => (
    <tr>
        {[1, 2, 3, 4, 5].map(i => (
            <td key={i}><div className={`skeleton ${styles.skeletonCell}`} /></td>
        ))}
    </tr>
);

// Custom confirm dialog to replace window.confirm
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
    <div className={modalStyles.modalOverlay}>
        <div className={`${modalStyles.modalContent} ${modalStyles.checkoutModal}`} style={{ maxWidth: 360 }}>
            <div className={modalStyles.modalHeader}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <AlertTriangle size={20} style={{ color: 'var(--warning)' }} /> Xác nhận xóa
                </h2>
                <button onClick={onCancel} className={modalStyles.closeBtn}><X size={18} /></button>
            </div>
            <div className={modalStyles.modalBody}><p>{message}</p></div>
            <div className={`${modalStyles.modalFooter} ${modalStyles.endingFooter}`}>
                <button onClick={onCancel} className={modalStyles.btnSecondary}>Hủy</button>
                <button onClick={onConfirm} className={modalStyles.btnPrimary}
                    style={{ background: 'var(--danger)', boxShadow: 'none' }}>Xóa</button>
            </div>
        </div>
    </div>
);

const AdminRoomPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [formData, setFormData] = useState({ roomNumber: '', type: 'STANDARD', price: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [confirm, setConfirm] = useState(null); // { id, roomNumber }
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const roomsPerPage = 6;

    const fetchRooms = async () => {
        setLoading(true);
        try { setRooms(await api.get('/rooms')); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRooms(); }, []);

    const openAdd = () => {
        setEditRoom(null);
        setFormData({ roomNumber: '', type: 'STANDARD', price: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (room) => {
        setEditRoom(room);
        setFormData({ roomNumber: room.roomNumber, type: room.type, price: room.price });
        setError('');
        setShowModal(true);
    };

    const handleDeleteConfirmed = async () => {
        await api.delete(`/rooms/${confirm.id}`);
        setConfirm(null);
        setToast({ message: `Đã xóa phòng ${confirm.roomNumber}`, type: 'success' });

        // Adjust pagination if deleting last item on page
        if (currentRooms.length === 1 && currentPage > 1) {
            setCurrentPage(p => p - 1);
        }

        fetchRooms();
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!formData.roomNumber || !formData.price) { setError('Vui lòng điền đầy đủ thông tin'); return; }
        setIsSubmitting(true);
        try {
            if (editRoom) {
                await api.put(`/rooms/${editRoom.id}`, formData);
                setToast({ message: `Đã cập nhật phòng ${editRoom.roomNumber}`, type: 'success' });
            } else {
                await api.post('/rooms', formData);
                setToast({ message: `Đã thêm phòng ${formData.roomNumber}`, type: 'success' });
            }
            setShowModal(false);
            fetchRooms();
        } catch (err) {
            setError(err.message || 'Lỗi khi lưu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusBadge = (status) => {
        const map = {
            AVAILABLE: ['badgeAvailable', 'Trống'],
            OCCUPIED: ['badgeOccupied', 'Có khách'],
            CLEANING: ['badgeCleaning', 'Dọn dẹp'],
        };
        const [cls, label] = map[status] || ['badgeAvailable', status];
        return <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>;
    };

    // Pagination Logic
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = rooms.slice(indexOfFirstRoom, Math.min(indexOfLastRoom, rooms.length));
    const totalPages = Math.ceil(rooms.length / roomsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1><BedDouble size={24} style={{ verticalAlign: 'middle', marginRight: '0.75rem' }} />Quản lý Phòng</h1>
                <button onClick={openAdd} className={styles.btnAdd}>
                    <Plus size={18} /> Thêm phòng
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableToolbar} style={{ justifyContent: 'flex-end' }}>
                    <div className={styles.tableInfo}>
                        Hiển thị {rooms.length > 0 ? indexOfFirstRoom + 1 : 0} - {Math.min(indexOfLastRoom, rooms.length)} trên {rooms.length} kết quả
                    </div>
                </div>

                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>SỐ PHÒNG</th>
                                <th>LOẠI PHÒNG</th>
                                <th>GIÁ / ĐÊM</th>
                                <th>TRẠNG THÁI</th>
                                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                : currentRooms.map(room => (
                                    <tr key={room.id}>
                                        <td><strong>{room.roomNumber}</strong></td>
                                        <td>
                                            {room.type === 'VIP'
                                                ? <span className={styles.vipLabel}><Gem size={12} /> VIP</span>
                                                : <span className={styles.standardLabel}>Standard</span>}
                                        </td>
                                        <td><strong>{room.price?.toLocaleString('vi-VN')} đ</strong></td>
                                        <td>{statusBadge(room.status)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={`${styles.btnIcon} ${styles.warning}`}
                                                    onClick={() => openEdit(room)} title="Sửa">
                                                    <Pencil size={15} />
                                                </button>
                                                <button className={`${styles.btnIcon} ${styles.danger}`}
                                                    onClick={() => setConfirm({ id: room.id, roomNumber: room.roomNumber })} title="Xóa">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {!loading && rooms.length === 0 && (
                    <div className={styles.emptyState}><BedDouble size={32} style={{ opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />Chưa có phòng nào. Hãy thêm phòng đầu tiên!</div>
                )}

                {rooms.length > roomsPerPage && (
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
                                    onClick={() => handlePageChange(idx + 1)}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={modalStyles.modalOverlay}>
                    <div className={`${modalStyles.modalContent} ${modalStyles.checkoutModal}`}>
                        <div className={modalStyles.modalHeader}>
                            <h2>{editRoom ? `Sửa phòng ${editRoom.roomNumber}` : 'Thêm phòng mới'}</h2>
                            <button onClick={() => setShowModal(false)} className={modalStyles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={modalStyles.modalBody}>
                            <div className={modalStyles.formGroup}>
                                <label>Số phòng *</label>
                                <input type="text" value={formData.roomNumber}
                                    onChange={e => setFormData(p => ({ ...p, roomNumber: e.target.value }))}
                                    placeholder="VD: 101" disabled={!!editRoom} />
                            </div>
                            <div className={modalStyles.formGroup}>
                                <label>Loại phòng</label>
                                <select value={formData.type}
                                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                                    {ROOM_TYPES.map(t => (
                                        <option key={t} value={t}>{t === 'VIP' ? '💎 VIP' : 'Standard'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={modalStyles.formGroup}>
                                <label>Giá mỗi đêm (VNĐ) *</label>
                                <input type="number" value={formData.price}
                                    onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                                    placeholder="VD: 500000" />
                            </div>
                            {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
                        </form>
                        <div className={`${modalStyles.modalFooter} ${modalStyles.endingFooter}`}>
                            <button onClick={() => setShowModal(false)} className={modalStyles.btnSecondary}>Hủy</button>
                            <button onClick={handleSubmit} disabled={isSubmitting} className={modalStyles.btnPrimary}>
                                {isSubmitting ? <span className="spinner"></span> : (editRoom ? 'Lưu thay đổi' : 'Thêm phòng')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {confirm && (
                <ConfirmDialog
                    message={`Bạn có chắc muốn xóa phòng ${confirm.roomNumber}? Hành động này không thể hoàn tác.`}
                    onConfirm={handleDeleteConfirmed}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminRoomPage;
