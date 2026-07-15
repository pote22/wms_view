import React, { useState, useEffect, useRef } from 'react';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
import { getList, saveProdInfo, deleteProdInfo, getCheckList, type Item, type CheckResult } from '../../api/master/master_0030Service'
// 레이어 팝업
import { usePopupContext } from "../../components/common/PopupProvider";
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";

// ── Tailwind 상수 ──────────────────────────────────────────────
const pageShell             = "flex min-h-0 flex-1 bg-surface";
const contentShell          = "flex min-w-0 flex-1 flex-col";
const sectionCard           = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader         = "shrink-0 border-b border-slate-100 p-6";

const btnBase               = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary            = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline            = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;
const btnDanger             = `${btnBase} border border-red-200 bg-white text-danger hover:bg-red-50`;
const btnToolbar            = "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

const filterBox             = "rounded-lg border border-slate-100 bg-slate-50 p-4";
const filterItem            = "flex min-w-0 flex-col gap-1.5";
const filterLabel           = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect          = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInput           = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInputSearchOnly = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInputReadonly   = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600";
const filterSearchBtn       = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover";

const tableWrapper          = "min-h-0 flex-1 overflow-auto";
const cellInput             = "h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const cellCenter            = "px-2 py-2 text-center";
const cellMedium            = "px-2 py-2 font-medium text-slate-700";

const chipOk                = "inline-flex items-center gap-1 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white";
const chipError             = "inline-flex items-center gap-1 rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap";

// 그룹 헤더/셀 배경색 (Tailwind 임의값으로 표현하기 어려운 rgba 조합)
const thGroupStyle          = { backgroundColor: '#dbeafe', borderBottom: '2px solid #bfdbfe', color: '#3b82f6' };
const thGroupAltStyle       = { backgroundColor: '#fef3c7', borderBottom: '2px solid #fde68a', color: '#f59e0b' };
const thGroupSubStyle       = { backgroundColor: '#eff6ff' };
const thGroupSubAltStyle    = { backgroundColor: '#fffbeb' };
const cellGroupStyle        = { backgroundColor: 'rgba(219, 234, 254, 0.1)' };
const cellGroupAltStyle     = { backgroundColor: 'rgba(254, 243, 199, 0.1)' };
// ───────────────────────────────────────────────────────────────


const CJ_WMS_MASTER_0030: React.FC = () => {
    // 정수&실수 정규식
    const INT_REGEX     = /^[0-9]+$/;
    const FLOAT_REGEX   = /^[0-9]*\.?[0-9]*$/
    // 고객사&센터 리스트 조회
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    // 공통 팝업
    const { showAlert, showConfirm, openProdSearch }        = usePopupContext();
    // 토큰 정보
    const payload                                           = getTokenPayload();
    // 조회조건
    const [searchSrvcCd,        setSearchSrvcCd]            = useState(selectSrvcCd);
    const [searchWhCd,          setSearchWhCd]              = useState(selectWhCd);
    const [searchProdCd,        setSearchProdCd]            = useState('');
    const [searchProdNm,        setSearchProdNm]            = useState('');
    const [searchUseYn,         setSearchUseYn]             = useState('Y');
    const [searchProdCategory,  setSearchProdCategory]      = useState('');
    const [searchProdShape,     setSearchProdShape]         = useState('');
    const [searchSteItemNo,     setSearchSteItemNo]         = useState('');
    // 리스트 객체
    const [itemList,            setItemList]                = useState<Item[]>([]);
    // 조회 실행 여부
    const [searched,            setSearched]                = useState(false);
    // confirm 다이얼로그
    const [isSaved,             setIsSaved]                 = useState(false);
    // 포커싱
    const cellRefs                                          = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 엑셀문서 입력
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 로딩바표시
    const [isUploading, setIsUploading] = useState(false);
    // 품목검색 팝업

    // 체크박스(전체선택)
    const handleSelectAll = (e : React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setItemList(prev => prev.map(v => ({ ...v, chk: val })));
    };
    // 체크박스(선택)
    const handleSelectRow = (idx : number) => {
        setItemList(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    }

     // 헤더 고객사/센터 변경시 동기화
    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd);
    }, [selectWhCd]);

    // 조회
    const handleSearch = () => {
        getList(
            {   srvcCd          : searchSrvcCd,
                whCd            : searchWhCd,
                prodCd          : searchProdCd,
                prodNm          : searchProdNm,
                useYn           : searchUseYn,
                prodCategory    : searchProdCategory,
                prodShape       : searchProdShape,
                steItemNo       : searchSteItemNo
            },
            (res) => {
                const item : Item[] = (res.data ?? []).map((v: any) => ({
                    chk             : v.chk             ?? '0',
                    srvcCd          : v.srvc_cd         ?? '',
                    whCd            : v.wh_cd           ?? '',
                    prodCd          : v.prod_cd         ?? '',
                    prodNm          : v.prod_nm         ?? '',
                    steitemNo       : v.steitem_no      ?? '',
                    prodCategory    : v.prod_category   ?? '',
                    prodShape       : v.prod_shape      ?? '',
                    prodType        : v.prod_type       ?? '',
                    createTime      : v.create_time     ?? '',
                    useYn           : v.use_yn          ?? '',
                    fifoYn          : v.fifo_yn         ?? '',
                    price           : v.price           ?? '',
                    innerpack       : v.innerpack       ?? '',
                    prodUnit        : v.prod_unit       ?? '',
                    weight          : v.weight          ?? '',
                    realWeight      : v.real_weight     ?? '',
                    weightUnit      : v.weight_unit     ?? '',
                    prodSpec        : v.prod_spec       ?? '',
                    regId           : v.reg_id          ?? '',
                    regDate         : v.reg_date        ?? '',
                    updId           : v.upd_id          ?? '',
                    updDate         : v.upd_date        ?? '',
                    isNew           : false,
                    isDirty         : false,
                    uploadStatus    : '',
                }));
                setItemList(item);
                setSearched(true);
            },
            (err) => showAlert("조회 실패: " + err?.message)
        );
    };

    // 저장
    const handleSave = () => {
        var chkRow = itemList.filter(v => v.chk === '1');

        if (chkRow.length <= 0) {
            showAlert("저장할 항목을 선택해주세요.");
            return;
        }

        // 품번 필수체크
        const invalidProdCdIdx = itemList.findIndex(v => v.chk === '1' && !v.prodCd?.trim());
        
        if (invalidProdCdIdx !== -1) {
            const el = cellRefs.current.get(`${invalidProdCdIdx}_prodCd`);
            showAlert("품목번호를 입력해주세요.", () => el?.focus());
            return;
        }

        // 단가 정수체크
        const invalidPriceIdx      = itemList.findIndex(v => v.chk === '1' && v.price !== '' && !INT_REGEX.test(v.price));
        // 용기수량 정수체크
        const invalidInnerpackIdx  = itemList.findIndex(v => v.chk === '1' && v.innerpack !== '' && !INT_REGEX.test(v.innerpack));
        // 중량 실수체크
        const invalidWeightIdx     = itemList.findIndex(v => v.chk === '1' && v.weight !== '' && !FLOAT_REGEX.test(v.weight));
        // 실중량 실수체크
        const invalidRealWeightIdx = itemList.findIndex(v => v.chk === '1' && v.realWeight !== '' && !FLOAT_REGEX.test(v.realWeight));


        if (invalidPriceIdx !== -1) {
            const el = cellRefs.current.get(`${invalidPriceIdx}_price`);
            showAlert("단가는 정수만 입력 가능합니다.", () => el?.focus());
            return;
        }

        if (invalidInnerpackIdx !== -1) {
            const el = cellRefs.current.get(`${invalidInnerpackIdx}_innerpack`);
            showAlert("용기수량은 정수만 입력 가능합니다.", () => el?.focus());
            return;
        }

        if (invalidWeightIdx !== -1) {
            const el = cellRefs.current.get(`${invalidWeightIdx}_weight`);
            showAlert("중량은 숫자(소수점 허용)만 입력 가능합니다.", () => el?.focus());
            return;
        }

        if (invalidRealWeightIdx !== -1) {
            const el = cellRefs.current.get(`${invalidRealWeightIdx}_realWeight`);
            showAlert("실중량은 숫자(소수점 허용)만 입력 가능합니다.", () => el?.focus());
            return;
        }

        showConfirm(`저장하시겠습니까?`, () => {
            setIsSaved(true);

            const userId = payload?.userId ?? '';
            const prodList = chkRow.map(v => ({
                srvcCd          : v.srvcCd || selectSrvcCd,
                whCd            : v.whCd || selectWhCd,
                prodCd          : v.prodCd.trim(),
                prodNm          : v.prodNm,
                steitemNo       : v.steitemNo,
                prodCategory    : v.prodCategory,
                prodShape       : v.prodShape,
                prodType        : v.prodType,
                createTime      : v.createTime,
                useYn           : v.useYn,
                fifoYn          : v.fifoYn,
                price           : Number(v.price),
                innerpack       : Number(v.innerpack),
                prodUnit        : v.prodUnit,
                weight          : Number(v.weight),
                realWeight      : Number(v.realWeight),
                weightUnit      : v.weightUnit,
                prodSpec        : v.prodSpec,
                userId
            }));

            saveProdInfo(
                { prodList },
                (res) => {
                    setIsSaved(false);
                    showAlert(res.resultMessage ?? "저장되었습니다.", () => handleSearch());
                },
                (err) => {
                    setIsSaved(false);
                    showAlert("저장 실패: " + err?.message);
                }
            );
        });
    };

    // 삭제
    const handleDelete = () => {
        const chkRow = itemList.filter(v => v.chk === '1' && !v.isNew);

        if (chkRow.length === 0) {
            showAlert("삭제할 항목을 선택해주세요.");
            return;
        }

        showConfirm(`삭제하시겠습니까?`, () => {
            deleteProdInfo(
                {
                  srvcCd    : chkRow[0].srvcCd,
                  whCd      : chkRow[0].whCd,
                  prodList  : chkRow.map(v => ({ prodCd : v.prodCd }))
                },
                () => { handleSearch(); showAlert("삭제 되었습니다."); },
                (err) => showAlert("삭제 실패: " + err?.message)
            );
        });
    };

    // 엑셀다운로드
    const handleExcel = async () => {
        if (itemList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리");

        // 컬럼 정의
        ws.columns = [
            { header: "고객사",             key: "srvcCd",         width: 20 },
            { header: "센터",               key: "whCd",           width: 15 },
            { header: "품목번호",           key: "prodCd",         width: 18 },
            { header: "품목명",             key: "prodNm",         width: 18 },
            { header: "설계품번(고객품번)",  key: "steitemNo",      width: 25 },
            { header: "품목구분",           key: "prodCategory",   width: 15 },
            { header: "품목형태",           key: "prodShape",      width: 14 },
            { header: "품목타입",           key: "prodType",       width: 15 },
            { header: "생성일자",           key: "createTime",     width: 14 },
            { header: "사용여부",           key: "useYn",          width: 14 },
            { header: "선입선출여부",       key: "fifoYn",         width: 14 },
            { header: "단가",               key: "price",          width: 14 },
            { header: "용기수량",           key: "innerpack",      width: 14 },
            { header: "용기단위",           key: "prodUnit",       width: 14 },
            { header: "무게중량",           key: "weight",         width: 14 },
            { header: "무게실중량",         key: "realWeight",     width: 14 },
            { header: "무게단위",           key: "weightUnit",     width: 14 },
            { header: "등록자",             key: "regId",          width: 14 },
            { header: "등록일자",           key: "regDate",        width: 14 },
            { header: "수정자",             key: "updId",          width: 14 },
            { header: "수정일자",           key: "updDate",        width: 14 },
        ];

        // 헤더 스타일
        const headerRow = ws.getRow(1);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0080B2Fd" },
            };

            cell.font = { bold: true, color: { argb: "00000000" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" },
            };
        });

        headerRow.height = 22;

        // 데이터 행 추가
        itemList.forEach(v => {
            const row = ws.addRow({
                srvcCd      : v.srvcCd,
                whCd        : v.whCd,
                prodCd      : v.prodCd,
                prodNm      : v.prodNm          ?? '',
                steitemNo   : v.steitemNo       ?? '',
                prodCategory: v.prodCategory    ?? '',
                prodShape   : v.prodShape       ?? '',
                prodType    : v.prodType        ?? '',
                createTime  : v.createTime      ?? '',
                useYn       : v.useYn           ?? '',
                fifoYn      : v.fifoYn          ?? '',
                price       : v.price           ?? 0,
                innerpack   : v.innerpack       ?? '',
                prodUnit    : v.prodUnit        ?? '',
                weight      : v.weight          ?? 0,
                realWeight  : v.realWeight      ?? 0,
                weightUnit  : v.weightUnit      ?? '',
                regId       : v.regId           ?? "",
                regDate     : v.regDate         ?? "",
                updId       : v.updId           ?? "",
                updDate     : v.updDate         ?? "",
            });

            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" },
                };
            });

            row.height = 18;
        });

        // 파일 저장
        const buffer    = await wb.xlsx.writeBuffer();
        const blob      = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url       = window.URL.createObjectURL(blob);
        const a         = document.createElement("a");

        a.href = url;
        a.download = `폼목관리_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(a);

        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    };

    // 행추가
    const handleAddRow = () => {
        setItemList(prev => [...prev, {
            chk             : '1',
            srvcCd          : selectSrvcCd,
            whCd            : selectWhCd,
            prodCd          : '',
            prodNm          : '',
            steitemNo       : '',
            prodCategory    : '',
            prodShape       : '',
            prodType        : '',
            createTime      : '',
            useYn           : 'Y',
            fifoYn          : 'Y',
            price           : '',
            innerpack       : '',
            prodUnit        : '',
            weight          : '',
            realWeight      : '',
            weightUnit      : '',
            prodSpec        : '',
            regId           : '',
            regDate         : '',
            updId           : '',
            updDate         : '',
            isNew           : true,
            isDirty         : false,
            uploadStatus    : '',
        }]);
    };

    // 행삭제
    const handleDeleteRow = () => {
        const lastNewIdx = itemList.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();

        if (lastNewIdx === undefined) return;

        setItemList(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    // 양식다운로드
    const handleTempletDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리_양식");

        ws.columns = [
            { header: "고객사",                    key: "srvcCd",       width: 20 },
            { header: "센터",                      key: "whCd",         width: 20 },
            { header: "품목번호",                  key: "prodCd",       width: 20 },
            { header: "품목명",                    key: "prodNm",       width: 15 },
            { header: "설계품목번호(고객품목번호)", key: "steitemNo",    width: 25 },
            { header: "품목카테고리",              key: "prodCategory", width: 18 },
            { header: "품목형태",                  key: "prodShape",    width: 18 },
            { header: "품목타입",                  key: "prodType",     width: 18 },
            { header: "금액",                      key: "price",        width: 18 },
            { header: "용기수량",                  key: "innerpack",    width: 18 },
            { header: "용기단위",                  key: "prodUnit",     width: 18 },
            { header: "중량",                      key: "weight",       width: 18 },
            { header: "실중량",                    key: "realWeight",   width: 18 },
            { header: "무게단위",                  key: "weightUnit",   width: 18 },
            { header: "사양",                      key: "prodSpec",     width: 18 },
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41697', prodNm: 'RS APS1', steitemNo : '999997', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '', prodSpec : '' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41698', prodNm: 'RS APS2', steitemNo : '999998', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '', prodSpec : '' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41699', prodNm: 'RS APS3', steitemNo : '999999', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '', prodSpec : '' },
        ];

        // 헤더 행 스타일
        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0080B2Fd" },  // 배경색 (#003f87)
            };
            cell.font = {
                bold: true,
                color: { argb: "00000000" },    // 글자색 (검정색)
                size: 11,
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        headerRow.height = 22;

        exampleRows.forEach(data => {
            const row = ws.addRow(data);
            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
            row.height = 18;
        });

        // 파일 저장
        const buffer    = await wb.xlsx.writeBuffer();
        const blob      = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url       = window.URL.createObjectURL(blob);
        const a         = document.createElement("a");

        a.href          = url;
        a.download      = "품목관리_양식.xlsx";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // 엑셀양식업로드
    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newItems: Item[] = rows.slice(1)
                .filter(row => row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')).map(row => ({
                    chk          : '1',
                    srvcCd       : String(row[0]  ?? selectSrvcCd).trim(),
                    whCd         : String(row[1]  ?? selectWhCd).trim(),
                    prodCd       : String(row[2]  ?? '').trim(),
                    prodNm       : String(row[3]  ?? '').trim(),
                    steitemNo    : String(row[4]  ?? '').trim(),
                    prodCategory : String(row[5]  ?? '').trim(),
                    prodShape    : String(row[6]  ?? '').trim(),
                    prodType     : String(row[7]  ?? '').trim(),
                    createTime   : '',
                    useYn        : 'Y',
                    fifoYn       : 'Y',
                    price        : String(row[8]  ?? '').trim(),
                    innerpack    : String(row[9]  ?? '').trim(),
                    prodUnit     : String(row[10] ?? '').trim(),
                    weight       : String(row[11] ?? '').trim(),
                    realWeight   : String(row[12] ?? '').trim(),
                    weightUnit   : String(row[13] ?? '').trim(),
                    prodSpec     : String(row[14] ?? '').trim(),
                    regId        : '',
                    regDate      : '',
                    updId        : '',
                    updDate      : '',
                    isNew        : true,
                    isDirty      : false,
                    uploadStatus : '검증중...',
                }));

            setItemList(newItems);

            getCheckList(
                { prodList: newItems.map(v => ({
                    prodCd     : v.prodCd,
                    price      : v.price,
                    innerpack  : v.innerpack,
                    weight     : v.weight,
                    realWeight : v.realWeight,
                }))},
                (res) => {
                    const results: CheckResult[] = res.data ?? [];
                    setItemList(prev => prev.map((v, i) => {
                        const r = results.find(r => r.rowIndex === i);
                        return { ...v, uploadStatus: r ? (r.isValid ? 'OK' : r.errors.join(' / ')) : v.uploadStatus };
                    }));
                    setIsUploading(false);
                },
                (err) => {
                    setItemList([]);
                    showAlert("유효성 검증 실패: " + err?.message);
                    setIsUploading(false);
                }
            );
        };

        reader.onerror = () => {
            showAlert("엑셀 파일 업로드 실패");
            setIsUploading(false);
        };

        reader.readAsArrayBuffer(file);
        e.target.value = "";
    };

     // 인라인 컬럼 편집
    const handleCellChange = (idx: number, field: keyof Item, value: string) => {
        setItemList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true, chk : '1' } : v));
    };

    return (
        <>
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        {/* Title and Main Actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">품목관리</h3>
                                <p className="mt-1 text-sm text-muted">등록된 품목의 상세 정보를 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary} onClick={handleSearch}>
                                    <span className="material-symbols-outlined">search</span>
                                    조회
                                </button>
                                <button className={btnOutline} onClick={handleSave}>
                                    <span className="material-symbols-outlined">save</span>
                                    저장
                                </button>
                                <button className={btnDanger} onClick={handleDelete}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
                                </button>
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Search Filter Box */}
                        <div className={`${filterBox} mt-4`}>
                            <div className="grid grid-cols-4 gap-4">
                                {/* 고객사 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect} value={searchSrvcCd} onChange={(e) => setSearchSrvcCd(e.target.value)}>
                                        { srvcList.map( s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect} value={searchWhCd} onChange={(e) => setSearchWhCd(e.target.value)}>
                                        { whList.map( w => <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>)}
                                    </select>
                                </div>
                                {/* 품목코드 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>품목번호</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className={filterInputSearchOnly} value={searchProdCd} onChange={(e) => { setSearchProdCd(e.target.value); setSearchProdNm(''); }} />
                                        <button className={filterSearchBtn} onClick={() => openProdSearch((prodCd, prodNm) => { setSearchProdCd(prodCd); setSearchProdNm(prodNm); }, searchProdCd)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchProdNm} onChange={(e) => setSearchProdNm(e.target.value) } readOnly />
                                    </div>
                                </div>
                                {/* 사용여부 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>사용여부</label>
                                    <select className={filterSelect} value={searchUseYn} onChange={(e) => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                                {/* 품목카테고리 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>품목카테고리</label>
                                    <input type="text" className={filterInput} value={searchProdCategory} onChange={(e) => setSearchProdCategory(e.target.value)}/>
                                </div>
                                {/* 품목형태 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>품목형태</label>
                                    <input type="text" className={filterInput} value={searchProdShape} onChange={(e) => setSearchProdShape(e.target.value)}/>
                                </div>
                                {/* 설계품목코드 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>설계품목코드</label>
                                    <input type="text" className={filterInput} value={searchSteItemNo} onChange={(e) => setSearchSteItemNo(e.target.value)}/>
                                </div>
                            </div>
                        </div>

                        {/* Functional Toolbar */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button className={btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '16px' }}>add</span>
                                    행추가
                                </button>
                                <button className={btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '16px' }}>delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnToolbar} onClick={handleTempletDownload}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                                    양식다운로드
                                </button>
                                <button className={btnToolbar} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                                    {isUploading ? "업로드 중..." : "엑셀업로드"}
                                </button>
                                <input type="file" ref={fileInputRef} accept=".xlsx,.xls"
                                    style={{ display: 'none' }} onChange={handleExcelUpload} />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={tableWrapper}>
                        <table className="min-w-[2760px] table-fixed border-separate border-spacing-0 text-xs">
                            <colgroup>
                                {/* 체크박스 */}
                                <col style={{ width: '40px' }} />
                                {/* 고객사 */}
                                <col style={{ width: '120px' }} />
                                {/* 센터 */}
                                <col style={{ width: '140px' }} />
                                {/* 품번 */}
                                <col style={{ width: '180px' }} />
                                {/* 품명 */}
                                <col style={{ width: '250px' }} />
                                {/* 설계품번 */}
                                <col style={{ width: '180px' }} />
                                {/* 품목구분 */}
                                <col style={{ width: '100px' }} />
                                {/* 품목형태 */}
                                <col style={{ width: '100px' }} />
                                {/* 품목타입 */}
                                <col style={{ width: '100px' }} />
                                {/* 생성일자 */}
                                <col style={{ width: '90px' }} />
                                {/* 사용여부 */}
                                <col style={{ width: '90px' }} />
                                {/* 선입선출 여부 */}
                                <col style={{ width: '90px' }} />
                                {/* 단가 */}
                                <col style={{ width: '120px' }} />
                                {/* 용기수량 */}
                                <col style={{ width: '80px' }} />
                                {/* 용기단위 */}
                                <col style={{ width: '80px' }} />
                                {/* 무게중량 */}
                                <col style={{ width: '90px' }} />
                                {/* 무게실중량 */}
                                <col style={{ width: '90px' }} />
                                {/* 무게단위 */}
                                <col style={{ width: '90px' }} />
                                {/* 사양 */}
                                <col style={{ width: '450px' }} />
                                {/* 등록자 */}
                                <col style={{ width: '90px' }} />
                                {/* 등록일자 */}
                                <col style={{ width: '120px' }} />
                                {/* 수정자 */}
                                <col style={{ width: '90px' }} />
                                {/* 수정일자 */}
                                <col style={{ width: '120px' }} />
                                {/* 업로드결과 */}
                                <col style={{ width: '300px' }} />
                            </colgroup>
                            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500">
                                <tr>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">
                                        <input type="checkbox" className="customCheckbox" onChange={handleSelectAll} checked={itemList.length > 0 &&
                                            itemList.every(v => v.chk === '1')}/>
                                    </th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">고객사</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">센터</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">품목번호</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">품목명</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">설계품번<br />(고객품번)</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">품목카테고리</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">품목형태</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">품목타입</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">생성일자</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">사용여부</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">선입선출<br/>여부</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">단가</th>
                                    <th colSpan={2} className="px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupStyle}>용기</th>
                                    <th colSpan={3} className="px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupAltStyle}>무게</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">사양</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">등록자</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">등록일자</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">수정자</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">수정일자</th>
                                    <th rowSpan={2} className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">업로드결과</th>
                                </tr>
                                <tr>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupSubStyle}>수량</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupSubStyle}>단위</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupSubAltStyle}>중량</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupSubAltStyle}>실중량</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide" style={thGroupSubAltStyle}>단위</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                {searched && itemList.length === 0 ? (
                                    <tr>
                                        <td colSpan={23} className="px-4 py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined block text-4xl">inbox</span>
                                            <p className="mt-2 text-sm">조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : itemList.map((item, index) => (
                                    <tr key={index} onClick={() => handleSelectRow(index)} className="hover:bg-slate-50">
                                        <td className={cellCenter}>
                                            <input type="checkbox" className="customCheckbox" onChange={() => {}} checked={item.chk === '1'}/>
                                        </td>
                                        <td className={cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : item.srvcCd)(srvcList.find( s => s.srvcCd === item.srvcCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : item.whCd)(whList.find( w => w.whCd === item.whCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            {item.isNew
                                                ? <input type="text" className={cellInput} value={item.prodCd}
                                                   onChange={e => handleCellChange(index, "prodCd", e.target.value)}
                                                   onClick={e => e.stopPropagation()} placeholder="품목번호"
                                                   ref={setCellRef(index, "prodCd") as any}/>
                                                : item.prodCd}
                                        </td>
                                        <td className={cellMedium}>
                                            <input type="text" className={cellInput} value={item.prodNm}
                                             onChange={e => handleCellChange(index, "prodNm", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type="text" className={cellInput} value={item.steitemNo}
                                             onChange={e => handleCellChange(index, "steitemNo", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type="text" className={cellInput} value={item.prodCategory}
                                             onChange={e => handleCellChange(index, "prodCategory", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type="text" className={cellInput} value={item.prodShape}
                                             onChange={e => handleCellChange(index, "prodShape", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type="text" className={cellInput} value={item.prodType}
                                             onChange={e => handleCellChange(index, "prodType", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>{item.createTime}</td>
                                        <td className={cellCenter}>
                                            <select className={cellInput} value={item.useYn}
                                                onChange={e => handleCellChange(index, "useYn", e.target.value)}
                                                onClick={e => e.stopPropagation()}>
                                                <option value="Y">사용</option>
                                                <option value="N">미사용</option>
                                            </select>
                                        </td>
                                        <td className={cellCenter}>
                                            <select className={cellInput} value={item.fifoYn}
                                                onChange={e => handleCellChange(index, "fifoYn", e.target.value)}
                                                onClick={e => e.stopPropagation()}>
                                                <option value="Y">적용</option>
                                                <option value="N">미적용</option>
                                            </select>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type="text" className={cellInput} value={item.price}
                                             onChange={e => { const value = e.target.value.replace(/[^0-9.]/g, ''); handleCellChange(index, "price", value)}}
                                             onClick={e => e.stopPropagation()}
                                             ref={setCellRef(index, "price") as any}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupStyle}>
                                            <input type="text" className={cellInput} value={item.innerpack}
                                             onChange={e => { const value = e.target.value.replace(/[^0-9.]/g, ''); handleCellChange(index, "innerpack", value)}}
                                             onClick={e => e.stopPropagation()}
                                             ref={setCellRef(index, "innerpack") as any}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupStyle}>
                                            <input type="text" className={cellInput} value={item.prodUnit}
                                             onChange={e => handleCellChange(index, "prodUnit", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupAltStyle}>
                                            <input type="text" className={cellInput} value={item.weight}
                                             onChange={e => { const value = e.target.value.replace(/[^0-9.]/g, ''); handleCellChange(index, "weight", value)}}
                                             onClick={e => e.stopPropagation()}
                                             ref={setCellRef(index, "weight") as any}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupAltStyle}>
                                            <input type="text" className={cellInput} value={item.realWeight}
                                             onChange={e => { const value = e.target.value.replace(/[^0-9.]/g, ''); handleCellChange(index, "realWeight", value)}}
                                             onClick={e => e.stopPropagation()}
                                             ref={setCellRef(index, "realWeight") as any}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupAltStyle}>
                                            <input type="text" className={cellInput} value={item.weightUnit}
                                             onChange={e => handleCellChange(index, "weightUnit", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter} style={cellGroupAltStyle}>
                                            <input type="text" className={cellInput} value={item.prodSpec}
                                             onChange={e => handleCellChange(index, "prodSpec", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={cellCenter}>{item.regId}</td>
                                        <td className={cellCenter}>{item.regDate}</td>
                                        <td className={cellCenter}>{item.updId}</td>
                                        <td className={cellCenter}>{item.updDate}</td>
                                        <td className={cellCenter}>
                                            {item.uploadStatus === 'OK' ? (
                                                <span className={chipOk}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                                                    OK
                                                </span>
                                            ) : item.uploadStatus && item.uploadStatus !== '검증중...' ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {item.uploadStatus.split(' / ').filter(Boolean).map((err, i) => (
                                                        <span key={i} className={chipError}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>error</span>
                                                            {err.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : item.uploadStatus}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 건수 표시 */}
                    <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                        <span>
                            총 <span className="font-bold text-slate-800">{itemList.length.toLocaleString()}</span> 건
                        </span>
                        <span>
                            선택 <span className="font-bold text-primary">{itemList.filter(v => v.chk === '1').length.toLocaleString()}</span> 건
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0030;
