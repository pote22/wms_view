import React, { useState, useMemo, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import "./cj_wms_home_0010.css";
import { getTokenPayload } from "../../utils/auth";
import { getList, saveNotice, deleteNotice, getFileList, uploadFile, downloadFile, deleteFile, type Notice, type AttachedFile } from "../../api/home/home_0010Service";
import { usePopupContext } from "../../components/common/PopupProvider";

// ── Tailwind 상수 ──────────────────────────────────────────────
const btn           = "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition";
const btnSecondary  = `${btn} bg-slate-200 text-blue-700 hover:bg-slate-300`;
const btnPrimary    = `${btn} bg-gradient-to-r from-primary to-primary-hover text-white shadow-sm hover:opacity-90`;
const btnDanger     = `${btn} bg-red-100 text-danger hover:bg-red-200`;
// ───────────────────────────────────────────────────────────────

const CJ_WMS_HOME_0010: React.FC = () => {
    const payload                                        = getTokenPayload();
    const userId                                        = payload?.userId ?? "";
    const isAdmin                                       = payload?.adminYn === 'Y';
    const MAX_FILE_SIZE                                 = 20 * 1024 * 1024;
    const { showAlert, showConfirm } = usePopupContext();

    const [attachedFiles,  setAttachedFiles]            = useState<AttachedFile[]>([]);
    const [noticeList,     setNoticeList]               = useState<Notice[]>([]);
    const [selNoticeId,    setSelNoticeId]              = useState<number | null>(null);
    const [checkedIdList,  setCheckedIdList]            = useState<number[]>([]);
    const [isEditing,      setIsEditing]                = useState(false);

    const fileInputRef                                  = useRef<HTMLInputElement>(null);
    const titleInputRef                                 = useRef<HTMLInputElement>(null);

    // 신규 여부
    const isNew                                         = (date: string) => Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;

    // 에디터 초기화
    const editor = useEditor({
        extensions: [StarterKit, Bold, Italic],
        content: "",
        editable: false,
    });

    // 선택된 공지사항 이벤트
    const selectedNotice = useMemo(() =>
        noticeList.find(notice => notice.boardId === selNoticeId) || null, [noticeList, selNoticeId]
    );
    
    // 에디터 편집 가능 여부 설정
    useEffect(() => {
        if (editor) editor.setEditable(isEditing);
    }, [isEditing, editor]);

    // 선택된 공지사항이 바뀔 때 에디터 내용 업데이트
    useEffect(() => {
        if (!editor || selNoticeId === null) {
            return;
        }

        const notice = noticeList.find(notice => notice.boardId === selNoticeId);
        
        if (notice) {
            editor.commands.setContent(notice.content ?? "");
        } 
    }, [selNoticeId, editor, noticeList]);


    // 초기 데이터 로드
    useEffect(() => {
        // 공지사항 리스트 조회
        getNoticeList();
    }, []);

    // 공지사항 리스트 조회
    const getNoticeList = () => {
        getList(
            {},
            (res) => {
                if (res.resultCode === "0000" && res.data) {
                    const notice : Notice[] = (res.data ?? []).map((v: any) => ({
                        boardId     : v.board_id    ?? null,
                        title       : v.title       ?? "",
                        content     : v.content     ?? "",
                        vwCnt       : v.vw_cnt      ?? 0,
                        boardType   : v.board_type  ?? "",
                        userId      : v.user_id     ?? "",
                        regId       : v.reg_id      ?? "",
                        regDate     : v.reg_date    ?? "",
                        updId       : v.upd_id      ?? "",
                        updDate     : v.upd_date    ?? "",
                    }));

                    setNoticeList(notice);

                    if (res.data.length > 0) {
                        setSelNoticeId(res.data[0].board_id);
                    } else {
                        setSelNoticeId(null);
                        editor?.commands.setContent("");
                        if (titleInputRef.current) titleInputRef.current.value = "";
                    }
                    
                    setIsEditing(false);
                    setCheckedIdList([]);
                }
            },
            (err) => console.error("공지사항 목록 조회 실패", err)
        );
    };

    // 공지사항 전체 체크 선택
    const handleCheckAll = () => {
        if (noticeList.length > 0 && (checkedIdList.length === noticeList.length)) {
            setCheckedIdList([]);
        } else {
            setCheckedIdList(noticeList.map(notice => notice.boardId));
        }
    }

    // 공지사항 내용 체크
    const handleCheckItem = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setCheckedIdList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // 공지사항 항목 선택 (선택된 공지사항 ID 업데이트와 동시에 편집모드 해제)
    const handleSelect = (id: number) => {
        setSelNoticeId(id); 
        setIsEditing(false);
    };

    // 공지사항 조회
    const handleSearch = () => {
        getNoticeList();
    };

    // 공지사항 신규 작성
    const handleNew = () => {
        setSelNoticeId(null);
        setIsEditing(true);
        setCheckedIdList([]);
        editor?.commands.setContent("");
    };
    
    // 공지사항 저장
    const handleSave = (title: string, onSaved?: (boardId: number) => void) => {
        if (!title.trim()) { 
            showAlert("제목을 입력해주세요."); 
            return; 
        }

        saveNotice(
            { 
                boardId : selNoticeId, 
                  title : title.trim(), 
                content : editor?.getHTML() ?? "", 
              boardType : "00", 
                 userId : userId 
            },
            (res) => {
                if (res.resultCode === "0000") {
                    const boardId = (res.data as any)?.[0]?.board_id as number | undefined;

                    if (onSaved && boardId) {
                        onSaved(boardId);
                    } 

                    showAlert("저장되었습니다.");
                    setIsEditing(false);
                    getNoticeList();
                } else {
                    showAlert(res.resultMessage ?? "저장 실패");
                }
            },
            () => showAlert("저장 중 오류가 발생했습니다.")
        );
        
    }

    // 공지사항 삭제
    const handleDelete = () => {
        if (checkedIdList.length === 0 && !selNoticeId) {
            showAlert("삭제할 항목을 선택해주세요.");
            return;
        }

        const chkIdList = checkedIdList.length > 0 ? checkedIdList : [selNoticeId!];

        showConfirm(`${ chkIdList.length }개의 항목을 삭제하시겠습니까?`, () => {
            deleteNotice(
                { boardIds: chkIdList, userId },
                (res) => {
                    if (res.resultCode === "0000") {
                        setNoticeList(prev => prev.filter(n => !chkIdList.includes(n.boardId)));
                        setCheckedIdList([]);
                        setSelNoticeId(null);
                        setIsEditing(false);
                        editor?.commands.setContent("");
                    } else {
                        showAlert(res.resultMessage ?? "삭제 실패");
                    }
                    
                },
                (err) => {
                    showAlert(err?.response?.data?.resultMessage ?? "삭제 중 오류가 발생했습니다.");
                }
            );
        });
    };

    // 공지 선택 시 첨부파일 조회
    useEffect(() => {
        if (selNoticeId !== null) {
            loadFileList(selNoticeId);
        } else {
            setAttachedFiles([]);
        }
    }, [selNoticeId]);

    // 파일 첨부 관련 이벤트
    const handleAddFileClick = () => fileInputRef.current?.click();

    // 첨부파일 리스트 조회
    const loadFileList = (boardId: number) => {
        getFileList(
            { boardId },
            (res) => {
                if (res.resultCode === "0000" && res.data) {
                    setAttachedFiles(res.data.map((v : any) => ({
                        id      : v.file_id.toString(),
                        fileId  : v.file_id,
                        name    : v.file_nm,
                        size    : v.file_size,
                        type    : v.file_nm.split('.').pop()?.toLowerCase() || 'file',
                    })));
                } else {
                    setAttachedFiles([]);
                }
            },
            () => setAttachedFiles([])
        );
    };

    // 파일 선택 이벤트
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        const oversizedFiles = filesArray.filter(file => file.size > MAX_FILE_SIZE);

        if (oversizedFiles.length > 0) {
            const fileNames = oversizedFiles.map(f => f.name).join('\n');
            showAlert(`다음 파일은 20MB를 초과하여\n첨부할 수 없습니다.\n\n${fileNames}`);
        }

        const validFiles = filesArray.filter(file => file.size <= MAX_FILE_SIZE).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            type: file.name.split('.').pop()?.toLowerCase() || 'file',
            pendingFile: file,
        }));

        if (validFiles.length > 0) setAttachedFiles(prev => [...prev, ...validFiles]);
        e.target.value = '';
    };
    
    // 파일 다운로드
    const handleFileDownload = (file: AttachedFile) => {
        if (!file.fileId) {
            return;
        } 

        downloadFile(file.fileId, file.name).catch(() => showAlert("파일 다운로드 중 오류가 발생했습니다."));
    };

    // 파일 삭제
    const removeFile = (file: AttachedFile) => {
        if (file.fileId) {
            deleteFile(
                { fileId: file.fileId, userId },
                (res) => {
                    if (res.resultCode === "0000") {
                        setAttachedFiles(prev => prev.filter(f => f.id !== file.id));
                    } else {
                        showAlert(res.resultMessage ?? "파일 삭제 실패");
                    }
                },
                () => showAlert("파일 삭제 중 오류가 발생했습니다.")
            );
        } else {
            setAttachedFiles(prev => prev.filter(f => f.id !== file.id));
        }
    };

    // 저장(게시글, 첨부파일 전체 저장)
    const handleSaveClick = () => {
        handleSave(titleInputRef.current?.value ?? "", (boardId) => {
            const pendingFiles = attachedFiles.filter(f => f.pendingFile);
            
            if (pendingFiles.length === 0) {
                return;
            } 

            const formData = new FormData();
            formData.append('boardId', boardId.toString());
            formData.append('userId', userId);
            pendingFiles.forEach(f => formData.append('files', f.pendingFile!));
            uploadFile(
                formData,
                (res) => {
                    if (res.resultCode === "0000") {
                        loadFileList(boardId);
                    } else {
                        showAlert(res.resultMessage ?? "파일 업로드 실패");
                    }
                },
                () => showAlert("파일 업로드 중 오류가 발생했습니다.")
            );
        });
    };

    const toggleBold        = () => editor?.chain().focus().toggleBold().run();             // 에디터에서 굵게 토글
    const toggleItalic      = () => editor?.chain().focus().toggleItalic().run();           // 에디터에서 기울임 토글
    const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();      // 에디터에서 순서 있는 목록 토글
    const toggleBulletList  = () => editor?.chain().focus().toggleBulletList().run();       // 에디터에서 순서 없는 목록 토글

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface px-[15px] pb-[15px]">
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

            {/* 헤더 행 */}
            <div className="flex shrink-0 items-center justify-between px-[5px] py-5">
                <div>
                    <h1 className="font-display text-2xl font-extrabold text-slate-950">공지사항 관리</h1>
                    <p className="mt-1 text-sm text-muted">시스템 공지 및 센터 운영 업데이트를 관리합니다.</p>
                </div>
                <div className="flex gap-2.5">
                    <button className={btnSecondary} onClick={handleSearch}>
                        <span className="material-symbols-outlined">search</span> 조회
                    </button>
                    {isAdmin && (
                        <>
                            <button className={btnSecondary} onClick={handleNew}>
                                <span className="material-symbols-outlined">add</span> 신규
                            </button>
                            <button className={btnPrimary} onClick={handleSaveClick}>
                                <span className="material-symbols-outlined">save</span> 저장
                            </button>
                            <button className={btnDanger} onClick={handleDelete}>
                                <span className="material-symbols-outlined">delete</span> 삭제
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 분할 뷰 */}
            <div className="flex flex-1 gap-5 overflow-hidden">

                {/* 좌: 공지 목록 사이드바 (35%) */}
                <div className="flex w-[35%] flex-none flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-sm">
                    <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-[15px]">
                        {isAdmin && (
                            <div className="flex size-[18px] items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="customCheckbox size-[18px] cursor-pointer appearance-none rounded border-[1.5px] border-slate-300 bg-white relative transition-all checked:bg-primary checked:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                    checked={noticeList.length > 0 && checkedIdList.length === noticeList.length}
                                    onChange={handleCheckAll}
                                    disabled={noticeList.length === 0}
                                />
                            </div>
                        )}
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            공지사항 목록 {checkedIdList.length > 0 && `(${checkedIdList.length} 선택)`}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2.5">
                        {noticeList.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center text-slate-400">
                                <span className="material-symbols-outlined text-[48px] opacity-50">inventory_2</span>
                                <p>등록된 공지사항이 없습니다.</p>
                            </div>
                        ) : (
                            noticeList.map((notice, idx)  => (
                                <div
                                    key={notice.boardId}
                                    className={`relative flex cursor-pointer items-start gap-[15px] border-b border-slate-50 px-5 py-[15px] transition-colors hover:bg-slate-50 ${selNoticeId === notice.boardId ? 'border-l-4 border-l-primary bg-blue-50' : ''}`}
                                    onClick={() => handleSelect(notice.boardId)}
                                >
                                    {isAdmin && (
                                        <div className="pt-0.5">
                                            <input
                                                type="checkbox"
                                                className="customCheckbox size-[18px] cursor-pointer appearance-none rounded border-[1.5px] border-slate-300 bg-white relative transition-all checked:bg-primary checked:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                                checked={checkedIdList.includes(notice.boardId)}
                                                onClick={(e) => handleCheckItem(e, notice.boardId)}
                                                onChange={() => { }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 flex justify-between">
                                            <span className="text-[11px] font-bold text-slate-400">NO. { noticeList.length - idx }</span>
                                            <span className="text-[11px] text-muted">{notice.regDate}</span>
                                        </div>
                                        <span className="mb-1 block text-sm font-semibold leading-snug text-slate-800">
                                            {notice.title}
                                            {isNew(notice.regDate) && (
                                                <span className="ml-1.5 inline-block rounded bg-primary px-1 py-px text-[9px] font-extrabold text-white">NEW</span>
                                            )}
                                        </span>
                                        <span className="text-xs text-muted">{notice.userId}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 우: 상세 컨텐츠 영역 (65%) */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-sm" key={selNoticeId ?? 'new'}>
                    <div className="shrink-0 border-b border-slate-100 px-[30px] py-[25px]">
                        <div className="flex items-start justify-between">
                            <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {selNoticeId ? '상세 정보' : '새 공지 작성'}
                            </label>
                            {isAdmin && selNoticeId && (
                                <button
                                    className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-semibold ${isEditing ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    <span className="material-symbols-outlined text-[14px]">
                                        {isEditing ? 'lock_open' : 'lock'}
                                    </span>
                                    {isEditing ? '편집 중' : '수정하기'}
                                </button>
                            )}
                        </div>
                        <input
                            ref={titleInputRef}
                            className={`w-full rounded-md bg-transparent px-3 py-2 font-display text-[22px] font-bold text-slate-950 outline-none transition-colors ${isEditing ? 'border border-slate-200 bg-slate-50' : ''}`}
                            type="text"
                            defaultValue={selectedNotice?.title || ""}
                            readOnly={!isEditing}
                            placeholder={isEditing ? "제목을 입력하세요" : ""}
                        />
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* 에디터 섹션 */}
                        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-100">
                            <div className="flex shrink-0 gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-2.5">
                                <button
                                    onClick={toggleBold}
                                    className={`rounded p-1 text-muted transition-colors hover:bg-slate-100 ${editor?.isActive('bold') ? 'btnActive' : ''}`}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined toolbarIcon">format_bold</span>
                                </button>
                                <button
                                    onClick={toggleItalic}
                                    className={`rounded p-1 text-muted transition-colors hover:bg-slate-100 ${editor?.isActive('italic') ? 'btnActive' : ''}`}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined toolbarIcon">format_italic</span>
                                </button>
                                <button
                                    onClick={toggleOrderedList}
                                    className={`rounded p-1 text-muted transition-colors hover:bg-slate-100 ${editor?.isActive('orderedList') ? 'btnActive' : ''}`}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined toolbarIcon">format_list_numbered</span>
                                </button>
                                <button
                                    onClick={toggleBulletList}
                                    className={`rounded p-1 text-muted transition-colors hover:bg-slate-100 ${editor?.isActive('bulletList') ? 'btnActive' : ''}`}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined toolbarIcon">format_list_bulleted</span>
                                </button>
                            </div>
                            <div className={`editorWrapper ${isEditing ? 'textareaEditable' : 'textareaReadOnly'}`}>
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* 첨부파일 사이드바 */}
                        <div className="flex w-[280px] shrink-0 flex-col gap-5 bg-slate-50/80 p-[25px]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase text-slate-500">첨부 파일</h3>
                                {isEditing && (
                                    <span className="material-symbols-outlined cursor-pointer text-primary text-[18px]" onClick={ handleAddFileClick } >
                                        add_circle
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {attachedFiles.length > 0 ? (
                                    attachedFiles.map(file => (
                                        <div key={file.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:-translate-y-px">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50">
                                                <span className={`material-symbols-outlined ${file.type === 'pdf' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {file.type === 'pdf' ? 'picture_as_pdf' : (['jpg', 'png', 'jpeg'].includes(file.type) ? 'image' : 'description')}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="truncate text-[11px] font-bold text-slate-700"
                                                    style={{ cursor: file.fileId ? 'pointer' : 'default' }}
                                                    onClick={() => handleFileDownload(file)}
                                                >
                                                    {file.name}
                                                    {file.pendingFile && (
                                                        <span className="ml-1 text-[10px] text-slate-400">(저장 대기)</span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{file.size}</p>
                                            </div>
                                            {isEditing && (
                                                <span
                                                    className="material-symbols-outlined ml-auto cursor-pointer text-[16px] text-slate-400"
                                                    onClick={() => removeFile(file)}
                                                >
                                                    cancel
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-5 text-center text-[11px] text-slate-400">
                                        {isEditing ? '파일을 추가하려면 클릭하세요 (첨부파일은 20MB 이하로 첨부)' : '첨부된 파일이 없습니다.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CJ_WMS_HOME_0010;
