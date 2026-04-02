import { useState, useEffect } from 'react';
import { X, Receipt } from 'lucide-react';
import api from '../api/api';
import styles from './Modal.module.css';

const CheckoutModal = ({ room, onClose, onSuccess }) => {
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await api.get(`/bookings/active/${room.id}`);
                setBooking(data);
            } catch (err) {
                setError('Không tìm thấy thông tin nhận phòng hợp lệ.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooking();
    }, [room.id]);

    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const invoice = await api.post(`/bookings/${booking.id}/checkout`);
            onSuccess(invoice);
        } catch (err) {
            setError(err.message || 'Lỗi khi trả phòng');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} ${styles.loaderContent}`}>
                    <div className={`${styles.spinner} ${styles.spinnerLg}`}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.checkoutModal}`}>
                <div className={styles.modalHeader}>
                    <h2>Thanh toán trả phòng - {room.roomNumber}</h2>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                {error ? (
                    <div className={styles.modalBody}>
                        <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
                    </div>
                ) : (
                    <div className={`${styles.modalBody} ${styles.invoiceBody}`}>
                        <div className={styles.invoiceHeader}>
                            <Receipt size={48} color="#94a3b8" strokeWidth={1.5} />
                            <h3>Chi tiết hóa đơn</h3>
                        </div>

                        <div className={styles.invoiceDetails}>
                            <div className={styles.invoiceRow}>
                                <span className={styles.label}>Khách hàng:</span>
                                <span className={styles.value}>{booking.guestName}</span>
                            </div>
                            <div className={styles.invoiceRow}>
                                <span className={styles.label}>Số điện thoại:</span>
                                <span className={styles.value}>{booking.phone}</span>
                            </div>
                            <div className={styles.invoiceRow}>
                                <span className={styles.label}>Ngày Check-in:</span>
                                <span className={styles.value}>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className={styles.invoiceRow}>
                                <span className={styles.label}>Ngày Check-out:</span>
                                <span className={styles.value}>{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                            </div>

                            <hr className={styles.divider} />

                            <div className={`${styles.invoiceRow} ${styles.totalRow}`}>
                                <span className={styles.label}>Tổng phải thu:</span>
                                <span className={styles.highlight}>{booking.estimatedPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`${styles.modalFooter} ${styles.endingFooter}`}>
                    <button onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>Hủy</button>
                    {!error && (
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className={styles.btnSuccess}
                        >
                            {isSubmitting ? <span className={styles.spinner}></span> : 'Xác nhận thanh toán'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
