import React from 'react';
import { useLoadingStore } from '../../store/loadingStore';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay: React.FC = () => {
    const count = useLoadingStore(state => state.count);

    if (count === 0) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.spinner} />
        </div>
    );
};

export default LoadingOverlay;
