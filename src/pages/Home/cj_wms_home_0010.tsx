import React, { useState, useMemo, useEffect, useRef } from "react";
import Popup from "../../components/common/Popup";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import styles from "./cj_wms_home_0010.module.css";

const CJ_WMS_HOME_0010: React.FC = () => {
    // 1. Data State (Mock)
    const [notices, setNotices] = useState([
        { id: "01", title: "Q4 재고 실사 - 인천GSC센터 유지보수 일정 안내", author: "관리자 (김재원)", date: "2024-11-20", isNew: true },
        { id: "02", title: "추석 연휴 기간 센터 운영 시간 변경 공지", author: "운영본부", date: "2024-09-10", isNew: false },
        { id: "03", title: "시스템 업데이트 (v2.4) 작업 완료 안내", author: "IT지원팀", date: "2024-08-25", isNew: false },
        { id: "04", title: "신규 보안 가이드라인 준수 요청", author: "보안팀", date: "2024-08-10", isNew: false },
        { id: "05", title: "여름 휴가 집중 기간 인력 운영 계획", author: "인사팀", date: "2024-07-15", isNew: false },
    ]);

    // 2. Interaction State
    const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>("01");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    
    // 3. Popup State
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        type: "alert" | "confirm";
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, type: "alert", message: "", onConfirm: () => {} });

    const closePopup = () => setPopup(p => ({ ...p, isOpen: false }));

    const showAlert = (message: string) =>
        setPopup({ isOpen: true, type: "alert", message, onConfirm: closePopup });

    const showConfirm = (message: string, onConfirm: () => void) =>
        setPopup({ isOpen: true, type: "confirm", message, onConfirm, });

    // 4. File Attachment State
    interface AttachedFile {
        id: string;
        name: string;
        size: string;
        type: string;
    }
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (20,971,520 bytes)

    // 4. Tiptap Editor Initialization
    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
        ],
        content: notices[0] ? `<strong>[공지내역]</strong><br/>${notices[0].title}에 대한 세부 공지입니다.<br/><br/>업무에 참고하시기 바랍니다.<br/><br/>- ${notices[0].author} 배상` : "",
        editable: false,
    });

    // 5. Computed State
    const selectedNotice = useMemo(() =>
        notices.find(n => n.id === selectedNoticeId) || null,
        [notices, selectedNoticeId]
    );

    // 6. Effects
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);

    // 7. Handlers
    const handleNew = () => {
        setSelectedNoticeId(null);
        setIsEditing(true);
        setCheckedIds([]);
        setAttachedFiles([]);
        editor?.commands.setContent("");
    };

    const handleSelect = (id: string) => {
        setSelectedNoticeId(id);
        setIsEditing(false);
        const notice = notices.find(n => n.id === id);
        if (editor && notice) {
            editor.commands.setContent(`<strong>[공지내역]</strong><br/>${notice.title}에 대한 세부 공지입니다.<br/><br/>업무에 참고하시기 바랍니다.<br/><br/>- ${notice.author} 배상`);
        }
        setAttachedFiles([{ id: 'f1', name: 'manual_update.pdf', size: '1.2 MB', type: 'pdf' }]);
    };

    const handleCheckItem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCheckedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCheckAll = () => {
        if (notices.length > 0 && checkedIds.length === notices.length) {
            setCheckedIds([]);
        } else {
            setCheckedIds(notices.map(n => n.id));
        }
    };

    const handleDelete = () => {
        if (checkedIds.length === 0) {
            showAlert("삭제할 항목을 선택해주세요.");
            return;
        }
        showConfirm(`${checkedIds.length}개의 항목을 삭제하시겠습니까?`, () => {
            setNotices(prev => prev.filter(n => !checkedIds.includes(n.id)));
            setCheckedIds([]);
            setSelectedNoticeId(null);
            setIsEditing(false);
            editor?.commands.setContent("");
            closePopup();
        });
    };

    // 8. File Attachment Handlers
    const handleAddFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        console.warn("---> [File Attachment] checking files...", files);

        const filesArray = Array.from(files);
        const oversizedFiles = filesArray.filter(file => {
            console.log(`Checking file: ${file.name}, size: ${file.size} bytes (Limit: ${MAX_FILE_SIZE})`);
            return file.size > MAX_FILE_SIZE;
        });

        if (oversizedFiles.length > 0) {
            const fileNames = oversizedFiles.map(f => f.name).join('\n');
            showAlert(`다음 파일은 20MB를 초과하여\n첨부할 수 없습니다.\n\n${fileNames}`);
        }

        const validFiles = filesArray.filter(file => file.size <= MAX_FILE_SIZE).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            type: file.name.split('.').pop()?.toLowerCase() || 'file'
        }));

        if (validFiles.length > 0) {
            setAttachedFiles(prev => [...prev, ...validFiles]);
        }
        
        // 동일 파일 다시 선택 가능하도록 초기화
        e.target.value = '';
    };

    const removeFile = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id));
    };

    // 9. Toolbar Command Handlers
    const toggleBold = () => editor?.chain().focus().toggleBold().run();
    const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
    const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
    const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();

    return (
        <div className={styles.pageContainer}>
            <Popup
                isOpen={popup.isOpen}
                type={popup.type}
                message={popup.message}
                onConfirm={popup.onConfirm}
                onCancel={closePopup}
            />
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleFileChange}
            />

            <div className={styles.headerRow}>
                <div className={styles.titleArea}>
                    <h1>공지사항 관리</h1>
                    <p>시스템 공지 및 센터 운영 업데이트를 관리합니다.</p>
                </div>
                <div className={styles.actionButtons}>
                    <button className={`${styles.btn} ${styles.btnSecondary}`}>
                        <span className="material-symbols-outlined">search</span> 조회
                    </button>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleNew}>
                        <span className="material-symbols-outlined">add</span> 신규
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                        <span className="material-symbols-outlined">save</span> 저장
                    </button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                        <span className="material-symbols-outlined">delete</span> 삭제
                    </button>
                </div>
            </div>

            <div className={styles.splitView}>
                <div className={styles.noticeListSidebar}>
                    <div className={styles.listHeader}>
                        <div className={styles.checkboxArea}>
                            <input
                                type="checkbox"
                                className={styles.customCheckbox}
                                checked={notices.length > 0 && checkedIds.length === notices.length}
                                onChange={handleCheckAll}
                                disabled={notices.length === 0}
                            />
                        </div>
                        <h3>공지사항 목록 {checkedIds.length > 0 && `(${checkedIds.length} 선택)`}</h3>
                    </div>
                    <div className={styles.scrollArea}>
                        {notices.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={`material-symbols-outlined ${styles.emptyIcon}`}>inventory_2</span>
                                <p>등록된 공지사항이 없습니다.</p>
                            </div>
                        ) : (
                            notices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className={`${styles.noticeItem} ${selectedNoticeId === notice.id ? styles.noticeItemActive : ""}`}
                                    onClick={() => handleSelect(notice.id)}
                                >
                                    <div className={styles.itemCheckArea}>
                                        <input
                                            type="checkbox"
                                            className={styles.customCheckbox}
                                            checked={checkedIds.includes(notice.id)}
                                            onClick={(e) => handleCheckItem(e, notice.id)}
                                            onChange={() => { }}
                                        />
                                    </div>
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemTop}>
                                            <span className={styles.itemNo}>NO. {notice.id}</span>
                                            <span className={styles.itemDate}>{notice.date}</span>
                                        </div>
                                        <span className={styles.itemTitle}>
                                            {notice.title}
                                            {notice.isNew && <span className={styles.newBadge}>NEW</span>}
                                        </span>
                                        <span className={styles.itemAuthor}>{notice.author}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.detailContentArea} key={selectedNoticeId || 'new'}>
                    <div className={styles.detailHeader}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <label className={styles.inputLabel}>
                                {selectedNoticeId ? '상세 정보' : '새 공지 작성'}
                            </label>
                            {selectedNoticeId && (
                                <button
                                    className={`${styles.btn} ${isEditing ? styles.btnEditActive : styles.btnEdit}`}
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{ padding: '4px 10px', fontSize: '11px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                        {isEditing ? 'lock_open' : 'lock'}
                                    </span>
                                    {isEditing ? '편집 중' : '수정하기'}
                                </button>
                            )}
                        </div>
                        <input
                            className={`${styles.detailTitleInput} ${isEditing ? styles.inputEditable : ""}`}
                            type="text"
                            defaultValue={selectedNotice?.title || ""}
                            readOnly={!isEditing}
                            placeholder="공지 제목을 입력하세요..."
                        />
                    </div>

                    <div className={styles.detailBody}>
                        <div className={styles.editorSection}>
                            <div className={styles.editorToolbar}>
                                <button
                                    onClick={toggleBold}
                                    className={editor?.isActive('bold') ? styles.btnActive : ""}
                                    type="button"
                                >
                                    <span className={`material-symbols-outlined ${styles.toolbarIcon}`}>format_bold</span>
                                </button>
                                <button
                                    onClick={toggleItalic}
                                    className={editor?.isActive('italic') ? styles.btnActive : ""}
                                    type="button"
                                >
                                    <span className={`material-symbols-outlined ${styles.toolbarIcon}`}>format_italic</span>
                                </button>
                                <button
                                    onClick={toggleOrderedList}
                                    className={editor?.isActive('orderedList') ? styles.btnActive : ""}
                                    type="button"
                                >
                                    <span className={`material-symbols-outlined ${styles.toolbarIcon}`}>format_list_numbered</span>
                                </button>
                                <button
                                    onClick={toggleBulletList}
                                    className={editor?.isActive('bulletList') ? styles.btnActive : ""}
                                    type="button"
                                >
                                    <span className={`material-symbols-outlined ${styles.toolbarIcon}`}>format_list_bulleted</span>
                                </button>
                            </div>

                            <div className={`${styles.editorWrapper} ${isEditing ? styles.textareaEditable : styles.textareaReadOnly}`}>
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        <div className={styles.attachmentSidebar}>
                            <div className={styles.sidebarTitleRow}>
                                <h3>첨부 파일</h3>
                                {isEditing && (
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ cursor: 'pointer', color: '#003f87', fontSize: '18px' }}
                                        onClick={handleAddFileClick}
                                    >
                                        add_circle
                                    </span>
                                )}
                            </div>
                            <div className={styles.fileList}>
                                {attachedFiles.length > 0 ? (
                                    attachedFiles.map(file => (
                                        <div key={file.id} className={styles.fileItem}>
                                            <div className={styles.fileIconBox}>
                                                <span className={`material-symbols-outlined ${file.type === 'pdf' ? styles.fileIconPdf : styles.fileIconExcel}`}>
                                                    {file.type === 'pdf' ? 'picture_as_pdf' : (['jpg', 'png', 'jpeg'].includes(file.type) ? 'image' : 'description')}
                                                </span>
                                            </div>
                                            <div className={styles.fileMeta}>
                                                <p className={styles.fileName}>{file.name}</p>
                                                <p className={styles.fileSize}>{file.size}</p>
                                            </div>
                                            {isEditing && (
                                                <span 
                                                    className="material-symbols-outlined" 
                                                    style={{ fontSize: '16px', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto' }}
                                                    onClick={() => removeFile(file.id)}
                                                >
                                                    cancel
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
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
