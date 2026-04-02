import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const ICON_MAP = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const DURATION = 3500;

const Toast = ({ message, type = 'success', onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const Icon = ICON_MAP[type] || Info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsClosing(true);
            setTimeout(() => onClose(), 300);
        }, DURATION);
        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    return (
        <div className={`${styles.toast} ${styles[type]} ${isClosing ? styles.slideOut : styles.slideIn}`}>
            <div className={styles.toastIcon}><Icon size={18} /></div>
            <span className={styles.toastMsg}>{message}</span>
            <button className={styles.closeBtn} onClick={handleClose}>
                <X size={14} />
            </button>
            {/* Progress bar */}
            <div className={`${styles.progress} ${isClosing ? '' : styles.progressRun}`}
                style={{ animationDuration: `${DURATION}ms` }} />
        </div>
    );
};

export default Toast;
