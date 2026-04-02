import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/api';
import styles from './Modal.module.css';

const CheckinModal = ({ room, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        guestName: '',
        cccd: '',
        phone: '',
        checkOutDate: ''
    });

    const [errors, setErrors] = useState({});
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tính tiền Live (Real-time)
    useEffect(() => {
        if (formData.checkOutDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkOut = new Date(formData.checkOutDate);

            // Tính số ngày chênh lệch
            const diffTime = checkOut.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                setEstimatedPrice(diffDays * room.price);
                // Clear error if valid date
                setErrors(prev => ({ ...prev, checkOutDate: null }));
            } else {
                setEstimatedPrice(0);
                setErrors(prev => ({ ...prev, checkOutDate: 'Ngày trả phòng phải sau ngày hôm nay' }));
            }
        }
    }, [formData.checkOutDate, room.price]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.guestName.trim()) newErrors.guestName = 'Vui lòng nhập tên khách hàng';
        if (!formData.cccd.trim()) newErrors.cccd = 'Vui lòng không để trống CCCD';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        if (!formData.checkOutDate) newErrors.checkOutDate = 'Vui lòng chọn ngày trả phòng';
        else if (estimatedPrice === 0) newErrors.checkOutDate = 'Ngày trả phòng không hợp lệ';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await api.post('/bookings/checkin', {
                roomId: room.id,
                guestName: formData.guestName,
                cccd: formData.cccd,
                phone: formData.phone,
                checkOutDate: formData.checkOutDate
            });
            onSuccess();
        } catch (error) {
            setErrors({ submit: error.message || 'Lỗi hệ thống khi nhận phòng' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.checkinModal}`}>
                <div className={styles.modalHeader}>
                    <h2>Làm thủ tục nhận phòng - {room.roomNumber}</h2>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={`${styles.modalBody} ${styles.splitForm}`}>
                    {/* Cột trái: Thông tin phòng (Read-only) */}
                    <div className={`${styles.formColumn} ${styles.roomInfoCol}`}>
                        <div className={styles.infoBox}>
                            <p className={styles.infoLabel}>Loại phòng</p>
                            <p className={styles.infoValue}>{room.type === 'VIP' ? '💎 VIP' : 'THƯỜNG'}</p>
                        </div>
                        <div className={styles.infoBox}>
                            <p className={styles.infoLabel}>Giá mỗi đêm</p>
                            <p className={`${styles.infoValue} ${styles.priceText}`}>{room.price.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                    </div>

                    {/* Cột phải: Nhập liệu */}
                    <div className={styles.formColumn}>
                        <div className={styles.formGroup}>
                            <label>Tên khách hàng *</label>
                            <input
                                type="text"
                                name="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                className={errors.guestName ? styles.inputError : ''}
                                placeholder="Nhập họ và tên"
                            />
                            {errors.guestName && <span className={styles.errorText}>{errors.guestName}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>CCCD / CMND *</label>
                            <input
                                type="text"
                                name="cccd"
                                value={formData.cccd}
                                onChange={handleChange}
                                className={errors.cccd ? styles.inputError : ''}
                                placeholder="Số định danh"
                            />
                            {errors.cccd && <span className={styles.errorText}>{errors.cccd}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Số điện thoại *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? styles.inputError : ''}
                                placeholder="VD: 0901234567"
                            />
                            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Ngày trả phòng *</label>
                            <input
                                type="date"
                                name="checkOutDate"
                                value={formData.checkOutDate}
                                onChange={handleChange}
                                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                className={errors.checkOutDate ? styles.inputError : ''}
                            />
                            {errors.checkOutDate && <span className={styles.errorText}>{errors.checkOutDate}</span>}
                        </div>
                    </div>
                </form>

                {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

                <div className={styles.modalFooter}>
                    <div className={styles.pricePreview}>
                        <span>Tạm tính: </span>
                        <strong>{estimatedPrice.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={styles.btnPrimary}
                    >
                        {isSubmitting ? <span className={styles.spinner}></span> : 'Nhận phòng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckinModal;
