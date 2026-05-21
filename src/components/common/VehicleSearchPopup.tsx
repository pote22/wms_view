import React, { useState, useEffect, useRef } from 'react';
import { getVehicleSearchList } from '../../api/common/commonService';
import styles from './VehicleSearchPopup.module.css';

interface VehicleResult {
    vehicle_no  : string;
    drv_nm      : string;
    use_yn      : string;
}

interface Props {
    isOpen              : boolean;
    srvcCd              : string;
    whCd                : string;
    initialVehicleNo?   : string;
    onSelect            : (vehicleNo: string, drvNm: string) => void;
    onClose             : () => void;
}

const VehicleSearchPopup: React.FC<Props> = ({ isOpen, srvcCd, whCd, initialVehicleNo, onSelect, onClose }) => {
    const [searchVehicleNo, setSearchVehicleNo] = useState('');
    const [searchUseYn,     setSearchUseYn]     = useState('');
    const [vehicleList,     setVehicleList]     = useState<VehicleResult[]>([]);
    const [searched,        setSearched]        = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialVehicleNo ?? '';
            setSearchVehicleNo(initVal);
            setSearchUseYn('');
            setVehicleList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            if (initVal) {
                getVehicleSearchList(
                    { srvcCd, whCd, vehicleNo: initVal, useYn: '' },
                    (res) => { setVehicleList((res.data ?? []) as any[]); setSearched(true); },
                    () => {}
                );
            }
        }
    }, [isOpen]);

    const handleSearch = () => {
        getVehicleSearchList(
            { srvcCd, whCd, vehicleNo: searchVehicleNo, useYn: searchUseYn },
            (res) => { setVehicleList((res.data ?? []) as any[]); setSearched(true); },
            (err) => { console.error('차량 검색 오류:', err); setSearched(true); }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (vehicleNo: string, drvNm: string) => {
        onSelect(vehicleNo, drvNm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h4 className={styles.title}>차량 검색</h4>
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
                        placeholder="차량번호"
                        value={searchVehicleNo}
                        onChange={e => setSearchVehicleNo(e.target.value)}
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
                                <th style={{ width: '40%' }}>차량번호</th>
                                <th>기사명</th>
                                <th style={{ width: '15%' }}>사용여부</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && vehicleList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : vehicleList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.vehicle_no, v.drv_nm)}>
                                    <td className={styles.vehicleNo}>{v.vehicle_no}</td>
                                    <td>{v.drv_nm}</td>
                                    <td>{v.use_yn === 'Y' ? '사용' : '미사용'}</td>
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

export default VehicleSearchPopup;
