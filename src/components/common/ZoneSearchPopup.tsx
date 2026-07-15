import React, { useState, useEffect, useRef } from 'react';
import { getZoneSearchList } from '../../api/common/commonService';
import styles from './ZoneSearchPopup.module.css';

interface ZoneResult {
    zone_cd : string;
    zone_nm : string;
    use_yn  : string;
}

interface Props {
    isOpen          : boolean;
    srvcCd          : string;
    whCd            : string;
    initialZoneCd?  : string;
    onSelect        : (zoneCd: string, zoneNm: string) => void;
    onClose         : () => void;
}

const ZoneSearchPopup: React.FC<Props> = ({ isOpen, srvcCd, whCd, initialZoneCd, onSelect, onClose }) => {
    const [searchZoneCd, setSearchZoneCd] = useState('');
    const [searchUseYn,  setSearchUseYn]  = useState('');
    const [zoneList,     setZoneList]     = useState<ZoneResult[]>([]);
    const [searched,     setSearched]     = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialZoneCd ?? '';
            setSearchZoneCd(initVal);
            setSearchUseYn('');
            setZoneList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            getZoneSearchList(
                { srvcCd, whCd, zoneCd: initVal, zoneNm: '', locCd: '', useYn: '' },
                (res) => { setZoneList(res.data ?? []); setSearched(true); },
                () => {}
            );
        }
    }, [isOpen]);

    const handleSearch = () => {
        getZoneSearchList(
            { srvcCd, whCd, zoneCd: searchZoneCd, zoneNm: '', locCd: '', useYn: searchUseYn },
            (res) => { setZoneList(res.data ?? []); setSearched(true); },
            () => {}
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (zoneCd: string, zoneNm: string) => {
        onSelect(zoneCd, zoneNm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h4 className={styles.title}>존 검색</h4>
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
                        placeholder="존코드"
                        value={searchZoneCd}
                        onChange={e => setSearchZoneCd(e.target.value)}
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
                                <th style={{ width: '40%' }}>존코드</th>
                                <th>존명</th>
                                <th>사용여부</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && zoneList.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : zoneList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.zone_cd, v.zone_nm)}>
                                    <td className={styles.zoneCd}>{v.zone_cd}</td>
                                    <td>{v.zone_nm}</td>
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

export default ZoneSearchPopup;
