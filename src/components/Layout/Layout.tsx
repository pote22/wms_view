import React from "react";
import styles from "./Layout.module.css";

interface MainLayoutProps {
    sidebar: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ sidebar, header, children }) => {
    return (
        <div className={styles.mainWrapper}>
            {/* 사이드바 영역 */}
            {sidebar}
            {/* 메인 콘텐츠 영역 (헤더 + 본문) */}
            <main className={styles.mainContent}>
                {header}
                <div className={styles.pageCanvas}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;