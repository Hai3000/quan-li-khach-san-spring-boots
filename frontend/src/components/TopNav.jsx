import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './TopNav.module.css';

const getInitials = (name = 'Admin User') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const TopNav = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.topNav} style={{ justifyContent: 'flex-end' }}>
            <div className={styles.navRight}>
                <div className={styles.iconActions}>
                    <button onClick={handleLogout} className={`${styles.iconBtn} ${styles.logoutBtn}`} title="Đăng xuất">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.userProfile}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.fullName || 'Admin User'}</span>
                        <span className={styles.userRole}>
                            {user?.role === 'ADMIN' ? 'FLOOR MANAGER' : 'RECEPTIONIST'}
                        </span>
                    </div>
                    <div className={styles.avatar}>
                        {getInitials(user?.fullName || 'Admin User')}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
