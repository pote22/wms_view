import { useState, useEffect } from "react";
import { mainService, type Notice } from "../../api/main/mainService";

const Main : React.FC = () => {
    useEffect(() => {
        console.log("사용자 고객사 리스트");
        console.log("사용자 센터 리스트");
        console.log("고객사 입출고 대시보드"); 
    });

    return (
        <div>
            <p> 메인 페이지 </p>
        </div>
    )
} 

export default Main;