import React from "react";
import styles from "./SideBar.module.css";

// 1. 메뉴 아이템과 섹션에 대한 타입 정의
interface MenuItem {
    icon: string;
    label: string;
    key: string;
}

interface MenuSection {
    group: string;
    items: MenuItem[];
}

interface SidebarProps {
    menus: MenuSection[]; // any[] 대신 정의한 타입을 사용합니다.
    activeSideMenu: string;
    onMenuClick: (key: string) => void;
    onLogoClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ menus, activeSideMenu, onMenuClick, onLogoClick }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader} onClick={onLogoClick}>
                <h2 className={styles.sidebarLogo}>CJ WMS</h2>
                <p className={styles.sidebarSub}>CJ Logistics</p>
            </div>
            <nav className={styles.sidebarNav}>
                {menus.map((section) => (
                    <div className={styles.sidebarSection} key={section.group}>
                        <span className={styles.sidebarGroupLabel}>{section.group}</span>
                        {section.items.map((item) => (
                            <a
                                className={`${styles.sidebarMenuItem} ${activeSideMenu === item.key ? styles.sidebarMenuItemActive : ""}`}
                                href="#"
                                key={item.key}
                                onClick={(e) => { e.preventDefault(); onMenuClick(item.key); }}
                            >
                                <span className={`material-symbols-outlined ${styles.sidebarMenuIcon}`}>{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </div>
                ))}
            </nav>
            <div className={styles.sidebarFooter}>
                <a className={styles.sidebarMenuItem} href="#">
                    <span className={`material-symbols-outlined ${styles.sidebarMenuIcon}`}>help</span>
                    <span>Support</span>
                </a>
            </div>
        </aside>
    );
};
export default Sidebar;