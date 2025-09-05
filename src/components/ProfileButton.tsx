import { Navigate, useNavigate } from 'react-router-dom';

const ProfileButton = () => {
    const navigate = useNavigate();
    const handleProfileClick = () => {
        navigate("/profile-page");
    }

    return (
        <button onClick={handleProfileClick}>
            Profile
        </button>
    );
};

export default ProfileButton;
