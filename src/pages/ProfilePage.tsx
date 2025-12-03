import { useSearchParams } from "react-router-dom";
import UserProfile from "../components/UserProfile";

function ProfilePage() {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? parseInt(userIdParam, 10) : null;

  return <UserProfile userId={userId} />;
}

export default ProfilePage;
