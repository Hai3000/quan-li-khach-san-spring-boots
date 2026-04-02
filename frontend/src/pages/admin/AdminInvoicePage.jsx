import { useState, useEffect } from 'react';
import { ClipboardList, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/api';
import styles from './AdminTable.module.css';

const SkeletonRow = () => (
    <tr>
        {[1, 2, 3, 4, 5].map(i => (
            <td key={i}><div className={`skeleton ${styles.skeletonCell}`} /></td>
        ))}
    </tr>
);

const AdminInvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try { setInvoices(await api.get('/invoices')); } finally { setLoading(false); }
        };
        fetchInvoices();
    }, []);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = invoices.slice(indexOfFirstItem, Math.min(indexOfLastItem, invoices.length));
    const totalPages = Math.ceil(invoices.length / itemsPerPage);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1><ClipboardList size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Lịch sử Hóa đơn</h1>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng doanh thu</span>
                    <strong style={{ color: '#059669', fontSize: '1.5rem', letterSpacing: '-0.025em' }}>
                        {totalRevenue.toLocaleString('vi-VN')} đ
                    </strong>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableToolbar} style={{ justifyContent: 'flex-end' }}>
                    <div className={styles.tableInfo}>
                        Hiển thị {invoices.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, invoices.length)} trên {invoices.length} kết quả
                    </div>
                </div>

                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th># MÃ</th>
                                <th>SỐ PHÒNG</th>
                                <th>KHÁCH HÀNG</th>
                                <th>NGÀY TẠO</th>
                                <th style={{ textAlign: 'right' }}>TỔNG TIỀN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                : currentInvoices.map((inv, idx) => (
                                    <tr key={inv.id}>
                                        <td style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>#{indexOfFirstItem + idx + 1}</td>
                                        <td><strong>{inv.roomNumber}</strong></td>
                                        <td>{inv.guestName}</td>
                                        <td style={{ color: '#64748b' }}>
                                            {inv.createdAt ? new Date(inv.createdAt).toLocaleString('vi-VN') : '—'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <strong style={{ color: '#059669' }}>
                                                {inv.totalAmount?.toLocaleString('vi-VN')} đ
                                            </strong>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {!loading && invoices.length === 0 && (
                    <div className={styles.emptyState}>
                        <Receipt size={32} style={{ opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
                        Chưa có hóa đơn nào được ghi nhận.
                    </div>
                )}

                {invoices.length > itemsPerPage && (
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
        </div>
    );
};

export default AdminInvoicePage;
