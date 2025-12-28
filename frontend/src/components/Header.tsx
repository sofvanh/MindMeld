import { useEffect } from "react";
import { Link } from "react-router-dom";
import SignInOutButton from "./SignInOutButton";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { tagStyles, tooltipClasses } from "../styles/defaultStyles";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (user) {
      setNickname(user.email.split('@')[0]);
    } else {
      setNickname('');
    }
  }, [user]);

  return (
    <header className="flex bg-white border-b border-stone-200 px-2 sm:px-6 py-2 items-center">
      <div className="w-full h-full flex justify-between items-center">
        <div className="flex items-center flex-wrap justify-start ">
          <Link to="/" className="flex items-center gap-2 sm:gap-4">
            <h1
              className="nexus-logo m-0"
            >
              Nexus
            </h1>
          </Link>
        </div>
        {user && (
          <div className="flex items-center flex-wrap justify-end">
            <span className="text-stone-600 mx-2 sm:mx-4 text-sm sm:text-base">
              {nickname}
            </span>
            {user.role && <span className={tagStyles.amber}>
              {user.role}
            </span>}
            <SignInOutButton />
          </div>
        )}
        {!user && (
          <div className="ml-2 sm:ml-4">
            <SignInOutButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
