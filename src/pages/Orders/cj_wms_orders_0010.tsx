import React from 'react';

// ── Tailwind 상수 ──────────────────────────────────────────────

// ── 레이아웃
const pageShell             = "flex min-h-0 flex-1 bg-surface";
const contentShell          = "flex min-w-0 flex-1 flex-col";
const sectionCard           = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader         = "shrink-0 border-b border-slate-100 p-6";

// ── 버튼
const btnBase               = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary            = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline            = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;

// ── 필터 (입고등록 cj_wms_receipt_0010 과 동일)
const filterBox             = "mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4";
const filterGrid            = "grid grid-cols-4 gap-4";
const filterItem            = "flex min-w-0 flex-col gap-1.5";
const filterItemWide        = "col-span-2 flex min-w-0 flex-col gap-1.5";
const filterLabel           = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect          = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed";
const filterInput           = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed";
const filterInputGroup      = "flex min-w-0 gap-1.5";
const filterInputInGroup    = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed";
const filterInputReadonly   = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600";
const filterSearchBtn       = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed";

// ── 툴바
const toolbar               = "mt-4 flex items-center justify-between gap-3";
const toolbarGroup          = "flex items-center gap-1.5";
const btnToolbar            = "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

// ── 테이블
const tableWrapper          = "min-h-0 flex-1 overflow-auto";
const tableClass            = "min-w-[2300px] table-fixed border-collapse text-xs";
const theadClass            = "sticky top-0 z-[1] bg-slate-50 text-slate-500";
const thCell                = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide";
const tbodyClass            = "divide-y divide-slate-50 text-slate-700";
const cellCenter            = "px-2 py-2 text-center";
const cellRight             = "px-2 py-2 text-right tabular-nums";
// ───────────────────────────────────────────────────────────────

const CJ_WMS_ORDER_0010: React.FC = () => {
    return (
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">출고 등록</h3>
                                <p className="mt-1 text-sm text-muted">신규 출고 정보를 시스템에 등록합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary}>
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                    조회
                                </button>
                                <button className={btnOutline}>
                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                    신규
                                </button>
                                <button className={btnOutline}>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    저장
                                </button>
                                <button className={btnOutline}>
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Filter 1행 — 고객사 / 센터 / 출고번호 */}
                        <div className={filterBox}>
                            <div className={filterGrid}>
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect}>
                                        <option>-- 선택 --</option>
                                    </select>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect}>
                                        <option>-- 선택 --</option>
                                    </select>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>출고번호</label>
                                    <input type="text" className={filterInput} placeholder="" />
                                </div>
                            </div>
                        </div>

                        {/* Filter 2행 — 출고구분 / 거래처(검색) / 출고예정일 / 수불유형 / 차량번호(검색) / 비고 */}
                        <div className={filterBox}>
                            <div className={filterGrid}>
                                <div className={filterItem}>
                                    <label className={filterLabel}>출고구분</label>
                                    <select className={filterSelect}>
                                        <option>-- 선택 --</option>
                                    </select>
                                </div>
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>거래처</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className={filterInputInGroup} placeholder="" />
                                        <button type="button" className={filterSearchBtn}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} placeholder="" readOnly />
                                    </div>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>출고예정일</label>
                                    <input type="date" className={filterInput} />
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>수불유형</label>
                                    <select className={filterSelect}>
                                        <option>-- 선택 --</option>
                                    </select>
                                </div>
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>차량번호</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className={filterInputInGroup} placeholder="" />
                                        <button type="button" className={filterSearchBtn}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} placeholder="" readOnly />
                                    </div>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>비고</label>
                                    <input type="text" className={filterInput} placeholder="" />
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className={toolbar}>
                            <div className={toolbarGroup}>
                                <button className={btnToolbar}>
                                    <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                                    행추가
                                </button>
                                <button className={btnToolbar}>
                                    <span className="material-symbols-outlined text-[16px] text-danger">delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className={toolbarGroup}>
                                <button className={btnToolbar}>
                                    <span className="material-symbols-outlined text-[16px]">description</span>
                                    양식다운로드
                                </button>
                                <button className={btnToolbar}>
                                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                    엑셀업로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={tableWrapper}>
                        <table className={tableClass}>
                            <colgroup>
                                <col style={{ width: '40px' }} />    {/* 공란 */}
                                <col style={{ width: '140px' }} />   {/* 고객사 */}
                                <col style={{ width: '180px' }} />   {/* 센터 */}
                                <col style={{ width: '200px' }} />   {/* 품번 */}
                                <col style={{ width: '250px' }} />   {/* 품명 */}
                                <col style={{ width: '250px' }} />   {/* 고객품명 */}
                                <col style={{ width: '150px' }} />    {/* 존 */}
                                <col style={{ width: '150px' }} />   {/* 존명 */}
                                <col style={{ width: '120px' }} />   {/* 출고예정량 */}
                                <col style={{ width: '200px' }} />   {/* BARCODE */}
                                <col style={{ width: '200px' }} />   {/* 비고 */}
                                <col style={{ width: '150px' }} />   {/* 출고상태 */}
                                <col style={{ width: '90px' }} />    {/* 등록자 */}
                                <col style={{ width: '120px' }} />   {/* 등록일자 */}
                                <col style={{ width: '90px' }} />    {/* 수정자 */}
                                <col style={{ width: '120px' }} />   {/* 수정일자 */}
                                <col style={{ width: '300px' }} />   {/* 업로드결과 */}
                            </colgroup>
                            <thead className={theadClass}>
                                <tr>
                                    <th className={thCell}></th>
                                    <th className={thCell}>고객사</th>
                                    <th className={thCell}>센터</th>
                                    <th className={thCell}>품번</th>
                                    <th className={thCell}>품명</th>
                                    <th className={thCell}>고객품명</th>
                                    <th className={thCell}>존</th>
                                    <th className={thCell}>존명</th>
                                    <th className={thCell}>출고예정량</th>
                                    <th className={thCell}>BARCODE</th>
                                    <th className={thCell}>비고</th>
                                    <th className={thCell}>출고상태</th>
                                    <th className={thCell}>등록자</th>
                                    <th className={thCell}>등록일자</th>
                                    <th className={thCell}>수정자</th>
                                    <th className={thCell}>수정일자</th>
                                    <th className={thCell}>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                <tr className="hover:bg-slate-50">
                                    <td className={cellCenter}></td>
                                    <td className={cellCenter}>1201</td>
                                    <td className={cellCenter}>1001</td>
                                    <td className={cellCenter}>02-1602</td>
                                    <td className="truncate px-2 py-2">Kixx G1 5W-30 (4L)</td>
                                    <td className="truncate px-2 py-2">지크 G1 5W-30</td>
                                    <td className={cellCenter}>A</td>
                                    <td className={cellCenter}>상온존</td>
                                    <td className={cellRight}>50</td>
                                    <td className={cellCenter}>8801234500124</td>
                                    <td className="px-2 py-2 text-slate-400">-</td>
                                    <td className={cellCenter}>미지시</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className={cellCenter}></td>
                                    <td className={cellCenter}>1201</td>
                                    <td className={cellCenter}>1001</td>
                                    <td className={cellCenter}>02-1663</td>
                                    <td className="truncate px-2 py-2">Kixx PAO 1 0W-30 (1L)</td>
                                    <td className="truncate px-2 py-2">지크 PAO 0W-30</td>
                                    <td className={cellCenter}>A</td>
                                    <td className={cellCenter}>상온존</td>
                                    <td className={cellRight}>20</td>
                                    <td className={cellCenter}>8801234500125</td>
                                    <td className="px-2 py-2 text-slate-400">-</td>
                                    <td className={cellCenter}>미지시</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                    <td className={cellCenter}>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
                        <p className="text-xs text-muted">Showing 1 to 2 of 2 entries</p>
                        <div className="flex items-center gap-2">
                            <button className="inline-flex size-8 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="inline-flex size-8 items-center justify-center rounded bg-primary text-xs font-bold text-white">1</button>
                            <button className="inline-flex size-8 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CJ_WMS_ORDER_0010;
