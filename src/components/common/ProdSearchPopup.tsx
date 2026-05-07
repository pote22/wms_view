import React, { useState, useEffect, useRef } from 'react';
import { getProdSearchList, type ProdSearch } from '../../api/common/commonService';
import styles from './ProdSearchPopup.module.css';

interface Props {
    isOpen        : boolean;
    srvcCd        : string;
    whCd          : string;
    initialProdCd?: string;
    onSelect      : (prodCd: string, prodNm: string) => void;
    onClose       : () => void;
}

const ProdSearchPopup: React.FC<Props> = ({ isOpen, srvcCd, whCd, initialProdCd, onSelect, onClose }) => {
    const [searchProdCd, setSearchProdCd] = useState('');
    const [prodList, setProdList]         = useState<ProdSearch[]>([]);
    const [searched, setSearched]         = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialProdCd ?? '';
            setSearchProdCd(initVal);
            setProdList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            if (initVal) {
                getProdSearchList(
                    { srvcCd, whCd, prodCd: initVal },
                    (res) => { setProdList(res.data ?? []); setSearched(true); },
                    () => {}
                );
            }
        }
    }, [isOpen]);

    const handleSearch = () => {
        getProdSearchList(
            { srvcCd, whCd, prodCd: searchProdCd },
            (res) => { setProdList(res.data ?? []); setSearched(true); },
            () => {}
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (prod_cd: string, prod_nm: string) => {
        onSelect(prod_cd, prod_nm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h4 className={styles.title}>품목 검색</h4>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 검색바 */}
                <div className={styles.searchBar}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        placeholder="품목번호 입력 후 조회"
                        value={searchProdCd}
                        onChange={e => setSearchProdCd(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
                        조회
                    </button>
                </div>

                {/* 결과 테이블 */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th style={{ width: '45%' }}>품목번호</th>
                                <th>품목명</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && prodList.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : prodList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.prod_cd, v.prod_nm)}>
                                    <td className={styles.prodCd}>{v.prod_cd}</td>
                                    <td>{v.prod_nm}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 안내 */}
                <p className={styles.hint}>행을 더블클릭하면 선택됩니다.</p>
            </div>
        </div>
    );
};

export default ProdSearchPopup;
