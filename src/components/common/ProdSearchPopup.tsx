import React, { useState, useEffect, useRef } from 'react';
import { getProdSearchList } from '../../api/common/commonService';
import styles from './ProdSearchPopup.module.css';

interface ProdResult {
    prodCd : string;
    prodNm : string;
    useYn  : string;
}

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
    const [searchUseYn,  setSearchUseYn]  = useState('');
    const [prodList,     setProdList]     = useState<ProdResult[]>([]);
    const [searched,     setSearched]     = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialProdCd ?? '';
            setSearchProdCd(initVal);
            setSearchUseYn('');
            setProdList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            getProdSearchList(
                { srvcCd, whCd, prodCd: initVal, useYn: '' },
                (res) => {
                    const prods: ProdResult[] = (res.data ?? []).map((v: any) => ({
                        prodCd : v.prod_cd,
                        prodNm : v.prod_nm,
                        useYn  : v.use_yn,
                    }));
                    setProdList(prods);
                    setSearched(true);
                },
                () => {}
            );
        }
    }, [isOpen]);

    const handleSearch = () => {
        getProdSearchList(
            { srvcCd, whCd, prodCd: searchProdCd, useYn: searchUseYn },
            (res) => {
                const prods: ProdResult[] = (res.data ?? []).map((v: any) => ({
                    prodCd : v.prod_cd,
                    prodNm : v.prod_nm,
                    useYn  : v.use_yn,
                }));
                setProdList(prods);
                setSearched(true);
            },
            () => {}
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (prodCd: string, prodNm: string) => {
        onSelect(prodCd, prodNm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
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
                    <select
                        className={styles.select}
                        value={searchUseYn}
                        onChange={e => setSearchUseYn(e.target.value)}>
                        <option value="">전체</option>
                        <option value="Y">사용</option>
                        <option value="N">미사용</option>
                    </select>
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
                                <th style={{ width: '30%' }}>품목번호</th>
                                <th style={{ width: '50%' }}>품목명</th>
                                <th style={{ width: '20%' }}>사용여부</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && prodList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : prodList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.prodCd, v.prodNm)}>
                                    <td className={styles.prodCd}>{v.prodCd}</td>
                                    <td>{v.prodNm}</td>
                                    <td style={{ textAlign: 'center' }}>{v.useYn === 'Y' ? '사용' : '미사용'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className={styles.hint}>행을 더블클릭하면 선택됩니다.</p>
            </div>
        </div>
    );
};

export default ProdSearchPopup;
