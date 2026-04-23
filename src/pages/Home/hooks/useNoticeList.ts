import { useState, useMemo, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { getList, saveNotice, deleteNotice, type Notice } from "../../../api/home/home_0010Service";

interface Params {
    editor: Editor | null;
    userId: string;
    showAlert: (message: string) => void;
    showConfirm: (message: string, onConfirm: () => void) => void;
    closePopup: () => void;
}

export const useNoticeList = ({ editor, userId, showAlert, showConfirm, closePopup }: Params) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const selectedNotice = useMemo(() =>
        notices.find(n => n.board_id === selectedNoticeId) || null,
        [notices, selectedNoticeId]
    );

    // 에디터 수정 상태 변경
    useEffect(() => {
        if (editor) editor.setEditable(isEditing);
    }, [isEditing, editor]);

    // 공지사항 목록 조회
    useEffect(() => {
        fetchList();
    }, []);

    // 선택된 공지사항 내용 에디터에 표시
    useEffect(() => {
        if (!editor || selectedNoticeId === null) return;
        const notice = notices.find(n => n.board_id === selectedNoticeId);
        if (notice) editor.commands.setContent(notice.content ?? "");
    }, [selectedNoticeId, editor, notices]);

    // 공지사항 목록 조회
    const fetchList = () => {
        getList(
            {},
            (res) => {
                if (res.resultCode === "0000" && res.data) {
                    setNotices(res.data);
                    if (res.data.length > 0) setSelectedNoticeId(res.data[0].board_id);
                }
            },
            (err) => console.error("공지사항 목록 조회 실패", err)
        );
    };

    // 공지사항 신규등록
    const handleNew = () => {
        setSelectedNoticeId(null);
        setIsEditing(true);
        setCheckedIds([]);
        editor?.commands.setContent("");
    };

    // 공지사항 내용 선택(상세보기)
    const handleSelect = (id: number) => {
        setSelectedNoticeId(id);
        setIsEditing(false);
    };

    // 체크박스 선택
    const handleCheckItem = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // 체크박스 전체선택
    const handleCheckAll = () => {
        if (notices.length > 0 && checkedIds.length === notices.length) {
            setCheckedIds([]);
        } else {
            setCheckedIds(notices.map(n => n.board_id));
        }
    };

    const handleSave = (title: string, onSaved?: (boardId: number) => void) => {
        if (!title.trim()) { showAlert("제목을 입력해주세요."); return; }
        saveNotice(
            { boardId: selectedNoticeId, title: title.trim(), content: editor?.getHTML() ?? "", boardType: "00", userId },
            (res) => {
                if (res.resultCode === "0000") {
                    const boardId = (res.data as any)?.[0]?.board_id as number | undefined;
                    if (onSaved && boardId) onSaved(boardId);
                    showAlert("저장되었습니다.");
                    setIsEditing(false);
                    fetchList();
                } else {
                    showAlert(res.resultMessage ?? "저장 실패");
                }
            },
            () => showAlert("저장 중 오류가 발생했습니다.")
        );
    };

    // 공지사항 삭제
    const handleDelete = () => {
        if (checkedIds.length === 0 && !selectedNoticeId) {
            showAlert("삭제할 항목을 선택해주세요.");
            return;
        }
        const idsToDelete = checkedIds.length > 0 ? checkedIds : [selectedNoticeId!];
        showConfirm(`${idsToDelete.length}개의 항목을 삭제하시겠습니까?`, () => {
            deleteNotice(
                { boardIds: idsToDelete, userId },
                (res) => {
                    if (res.resultCode === "0000") {
                        setNotices(prev => prev.filter(n => !idsToDelete.includes(n.board_id)));
                        setCheckedIds([]);
                        setSelectedNoticeId(null);
                        setIsEditing(false);
                        editor?.commands.setContent("");
                    } else {
                        showAlert(res.resultMessage ?? "삭제 실패");
                    }
                    closePopup();
                },
                (err) => {
                    showAlert(err?.response?.data?.resultMessage ?? "삭제 중 오류가 발생했습니다.");
                    closePopup();
                }
            );
        });
    };

    // 신규 공지사항 여부 확인
    const isNew = (date: string) => Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;

    return {
        notices, selectedNoticeId, selectedNotice, checkedIds, isEditing,
        setIsEditing, fetchList, handleNew, handleSelect,
        handleCheckItem, handleCheckAll, handleSave, handleDelete, isNew,
    };
};
