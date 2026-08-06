import React, { useState, useEffect, useRef } from 'react';
import { getLocSearchList, type LocSearch } from '../../api/common/commonService';
import styles from './LocSearchPopup.module.css';

interface Props {
    isOpen          : boolean;
    srvcCd          : string;
    whCd            : string;
    zoneCd?         : string;
    initialLocCd?   : string;
    onSelect        : (locCd: string) => void;
    onClose         : () => void;
}

const LocSearchPopup: React.FC<Props> = ({ isOpen, srvcCd, whCd, zoneCd, initialLocCd, onSelect, onClose }) => {
    const [searchLocCd, setSearchLocCd] = useState('');
    const [searchUseYn, setSearchUseYn] = useState('');
    const [locList,     setLocList]     = useState<LocSearch[]>([]);
    const [searched,    setSearched]    = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialLocCd ?? '';
            setSearchLocCd(initVal);
            setSearchUseYn('');
            setLocList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            getLocSearchList(
                { srvcCd, whCd, zoneCd: zoneCd ?? '', locCd: initVal, useYn: '' },
                (res) => { setLocList(res.data ?? []); setSearched(true); },
                () => {}
            );
        }
    }, [isOpen]);

    const handleSearch = () => {
        getLocSearchList(
            { srvcCd, whCd, zoneCd: zoneCd ?? '', locCd: searchLocCd, useYn: searchUseYn },
            (res) => { setLocList(res.data ?? []); setSearched(true); },
            () => {}
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (locCd: string) => {
        onSelect(locCd);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h4 className={styles.title}>로케이션 검색</h4>
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
                        placeholder="로케이션코드"
                        value={searchLocCd}
                        onChange={e => setSearchLocCd(e.target.value)}
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
                                <th style={{ width: '45%' }}>로케이션코드</th>
                                <th style={{ width: '30%' }}>존코드</th>
                                <th>사용여부</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && locList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : locList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.loc_cd)}>
                                    <td className={styles.locCd}>{v.loc_cd}</td>
                                    <td>{v.zone_cd}</td>
                                    <td>{v.use_yn}</td>
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

export default LocSearchPopup;
