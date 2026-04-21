import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { getTokenPayload } from "../../utils/auth";

interface SrvcCdOption { srvcCd: string; srvcNm: string; }
interface WhCdOption   { whCd: string;  whNm: string;  }

// 헤더 컴포넌트
interface HeaderProps {
    selectSrvcCd: string;
    selectWhCd: string;
    activeMainTab: "home" | "storage" | "common";
    srvcCdList: SrvcCdOption[];
    whCdList: WhCdOption[];
    onSrvcCdChange: (val: string) => void;
    onWhCdChange: (val: string) => void;
    onTabChange: (tab: "home" | "storage" | "common") => void;
}

const Header: React.FC<HeaderProps> = ({
    selectSrvcCd,
    selectWhCd,
    activeMainTab,
    srvcCdList,
    whCdList,
    onSrvcCdChange,
    onWhCdChange,
    onTabChange,
}) => {
    const [openDropdown, setOpenDropdown] = useState<"customer" | "center" | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // 토큰에서 사용자 정보 가져오기
    const payload = getTokenPayload();           // 페이로드
    const userId = payload?.userId ?? "";        // 사용자ID
    const userNm = payload?.userNm ?? "사용자";   // 사용자명
    const role = payload?.role ?? "";            // 사용자권한
    const initial = userNm.charAt(0);            // 이니셜 (첫글자)
    const isAdmin = payload?.adminYn === 'Y';    // 관리자 여부 

    const navigate = useNavigate();

    // 로그아웃
    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    }

    const getAuthLabel = (role: string): string => {
        if (role == "ADMIN") {
            return "관리자";
        } else if (role.includes("WMS")) {
            return "담당자";
        } else if (role.includes("CUSTOMER")) {
            return "사용자";
        } else {
            return "";
        }
    }

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
                            <span className={styles.selectorValue}>{srvcCdList.find(c => c.srvcCd === selectSrvcCd)?.srvcNm ?? ""}</span>
                            <span className={`material-symbols-outlined ${styles.selectorArrow} ${openDropdown === "customer" ? styles.selectorArrowOpen : ""}`}>expand_more</span>
                        </div>
                        {openDropdown === "customer" && (
                            <ul className={styles.dropdownList}>
                                {srvcCdList.map((c) => (
                                    <li key={c.srvcCd} className={`${styles.dropdownItem} ${c.srvcCd === selectSrvcCd ? styles.dropdownItemActive : ""}`}
                                        onClick={() => { onSrvcCdChange(c.srvcCd); setOpenDropdown(null); }}>
                                        {c.srvcNm}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.dropdownWrap}>
                        <div className={styles.selectorBox} onClick={() => setOpenDropdown(openDropdown === "center" ? null : "center")}>
                            <span className={styles.selectorLabel}>센터</span>
                            <span className={styles.selectorValue}>{whCdList.find(c => c.whCd === selectWhCd)?.whNm ?? ""}</span>
                            <span className={`material-symbols-outlined ${styles.selectorArrow} ${openDropdown === "center" ? styles.selectorArrowOpen : ""}`}>expand_more</span>
                        </div>
                        {openDropdown === "center" && (
                            <ul className={styles.dropdownList}>
                                {whCdList.map((c) => (
                                    <li key={c.whCd} className={`${styles.dropdownItem} ${c.whCd === selectWhCd ? styles.dropdownItemActive : ""}`}
                                        onClick={() => { onWhCdChange(c.whCd); setOpenDropdown(null); }}>
                                        {c.whNm}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 우측: 사용자 정보 */}
                <div className={styles.headerUserArea}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{initial}</div>
                        <div className={styles.userText}>
                            <span className={styles.userName}>{userNm}</span>
                            <span className={styles.userRole}>{getAuthLabel(role)}</span>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>logout</span>
                        로그아웃
                    </button>
                    {/* 설정 기능 추가시 사용예정
                    <div className={styles.headerIcons}>
                        <button className={`${styles.iconBtn} material-symbols-outlined`}>notifications</button>
                        <button className={`${styles.iconBtn} material-symbols-outlined`}>settings</button>
                    </div>
                    */}
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
                {isAdmin && (
                    <button
                        className={`${styles.mainTab} ${activeMainTab === "common" ? styles.mainTabActive : ""}`}
                        onClick={() => onTabChange("common")}
                    >
                        공통관리
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;