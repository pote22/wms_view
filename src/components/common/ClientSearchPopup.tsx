import React, { useState, useEffect, useRef } from 'react';
import { getClientSearchList } from '../../api/common/commonService';
import styles from './ClientSearchPopup.module.css';

interface ClientResult {
    clientCd : string;
    clientNm : string;
    useYn    : string;
}

interface Props {
    isOpen          : boolean;
    srvcCd          : string;
    whCd            : string;
    initialClientCd?: string;
    onSelect        : (clientCd: string, clientNm: string) => void;
    onClose         : () => void;
}

const ClientSearchPopup: React.FC<Props> = ({ isOpen, srvcCd, whCd, initialClientCd, onSelect, onClose }) => {
    const [searchClientCd, setSearchClientCd] = useState('');
    const [searchUseYn,    setSearchUseYn]    = useState('');
    const [clientList,     setClientList]     = useState<ClientResult[]>([]);
    const [searched,       setSearched]       = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initVal = initialClientCd ?? '';
            setSearchClientCd(initVal);
            setSearchUseYn('');
            setClientList([]);
            setSearched(false);
            setTimeout(() => inputRef.current?.focus(), 50);

            getClientSearchList(
                { srvcCd, whCd, clientCd: initVal, clientNm: '', useYn: '' },
                (res) => { 
                    const client : ClientResult[] = (res.data ?? []).map((v: any) => ({
                        clientCd : v.client_cd,
                        clientNm : v.client_nm,
                        useYn    : v.use_yn,
                    }));

                    setClientList(client);
                    setSearched(true); 
                },
                () => {}
            );
        }
    }, [isOpen]);

    const handleSearch = () => {
        getClientSearchList(
            { srvcCd, whCd, clientCd: searchClientCd, useYn: searchUseYn },
            (res) => {
                const client : ClientResult[] = (res.data ?? []).map((v: any) => ({
                    clientCd : v.client_cd,
                    clientNm : v.client_nm,
                    useYn    : v.use_yn,
                }));

                setClientList(client);
                setSearched(true); 
            },
            () => {}
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') onClose();
    };

    const handleSelect = (clientCd: string, clientNm: string) => {
        onSelect(clientCd, clientNm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h4 className={styles.title}>거래처 검색</h4>
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
                        placeholder="거래처코드"
                        value={searchClientCd}
                        onChange={e => setSearchClientCd(e.target.value)}
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
                                <th style={{ width: '30%' }}>거래처코드</th>
                                <th style={{ width: '50%' }}>거래처명</th>
                                <th style={{ width: '20%' }}>사용여부</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {searched && clientList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={styles.empty}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                            ) : clientList.map((v, i) => (
                                <tr key={i} onDoubleClick={() => handleSelect(v.clientCd, v.clientNm)}>
                                    <td className={styles.clientCd}>{v.clientCd}</td>
                                    <td>{v.clientNm}</td>
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

export default ClientSearchPopup;
