import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

// Props 정의
interface Props {
    children: React.ReactNode;
}

// PrivateRoute 컴포넌트
const PrivateRoute: React.FC<Props> = ({ children }) => {
    // 로그인 여부 확인
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    // 로그인 되어 있으면 children 렌더링
    return <>{children}</>;
};

export default PrivateRoute;