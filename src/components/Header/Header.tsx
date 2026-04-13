import React, { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
    selectedCustomer: string;
    selectedCenter: string;
    activeMainTab: "home" | "storage" | "common";
    customers: string[];
    centers: string[];
    onCustomerChange: (val: string) => void;
    onCenterChange: (val: string) => void;
    onTabChange: (tab: "home" | "storage" | "common") => void;
}

const Header: React.FC<HeaderProps> = ({
    selectedCustomer,
    selectedCenter,
    activeMainTab,
    customers,
    centers,
    onCustomerChange,
    onCenterChange,
    onTabChange,
}) => {
    const [openDropdown, setOpenDropdown] = useState<"customer" | "center" | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 드롭다운 외부 클릭 시 닫기 로직
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className={styles.topHeader}>
            <div className={styles.headerTopRow}>
                {/* 좌측: 셀렉터 */}
                <div className={styles.headerSelectors} ref={dropdownRef}>
                    <div className={styles.dropdownWrap}>
                        <div className={styles.selectorBox} onClick={() => setOpenDropdown(openDropdown === "customer" ? null : "customer")}>
                            <span className={styles.selectorLabel}>고객사</span>
                            <span className={styles.selectorValue}>{selectedCustomer}</span>
                            <span className={`material-symbols-outlined ${styles.selectorArrow} ${openDropdown === "customer" ? styles.selectorArrowOpen : ""}`}>expand_more</span>
                        </div>
                        {openDropdown === "customer" && (
                            <ul className={styles.dropdownList}>
                                {customers.map((c) => (
                                    <li key={c} className={`${styles.dropdownItem} ${c === selectedCustomer ? styles.dropdownItemActive : ""}`}
                                        onClick={() => { onCustomerChange(c); setOpenDropdown(null); }}>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.dropdownWrap}>
                        <div className={styles.selectorBox} onClick={() => setOpenDropdown(openDropdown === "center" ? null : "center")}>
                            <span className={styles.selectorLabel}>센터</span>
                            <span className={styles.selectorValue}>{selectedCenter}</span>
                            <span className={`material-symbols-outlined ${styles.selectorArrow} ${openDropdown === "center" ? styles.selectorArrowOpen : ""}`}>expand_more</span>
                        </div>
                        {openDropdown === "center" && (
                            <ul className={styles.dropdownList}>
                                {centers.map((c) => (
                                    <li key={c} className={`${styles.dropdownItem} ${c === selectedCenter ? styles.dropdownItemActive : ""}`}
                                        onClick={() => { onCenterChange(c); setOpenDropdown(null); }}>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 우측: 사용자 정보 */}
                <div className={styles.headerUserArea}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>JS</div>
                        <div className={styles.userText}>
                            <span className={styles.userName}>김철수 관리자</span>
                            <span className={styles.userRole}>SUPER USER</span>
                        </div>
                    </div>
                    <button className={styles.logoutBtn}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>logout</span>
                        로그아웃
                    </button>
                    <div className={styles.headerIcons}>
                        <button className={`${styles.iconBtn} material-symbols-outlined`}>notifications</button>
                        <button className={`${styles.iconBtn} material-symbols-outlined`}>settings</button>
                    </div>
                </div>
            </div>

            {/* 메인 탭 네비게이션 */}
            <div className={styles.headerTabRow}>
                <button
                    className={`${styles.mainTab} ${activeMainTab === "home" ? styles.mainTabActive : ""}`}
                    onClick={() => onTabChange("home")}
                >
                    홈
                </button>
                <button
                    className={`${styles.mainTab} ${activeMainTab === "storage" ? styles.mainTabActive : ""}`}
                    onClick={() => onTabChange("storage")}
                >
                    보관관리
                </button>
                <button
                    className={`${styles.mainTab} ${activeMainTab === "common" ? styles.mainTabActive : ""}`}
                    onClick={() => onTabChange("common")}
                >
                    공통관리
                </button>
            </div>
        </header>
    );
};

export default Header;