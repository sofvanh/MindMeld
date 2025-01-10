import { useEffect } from "react";
import { Link } from "react-router-dom";
import SignInOutButton from "./SignInOutButton";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

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
    // We need to overflow-x-hidden because the Google Login button, for some reason, makes the header overflow slightly on smaller screens
    <header className="bg-white border-b border-stone-200 px-2 sm:px-6 h-16 overflow-x-hidden">
      <div className="w-full h-full flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 hover:text-stone-700 m-0" style={{ fontFamily: 'Bricolage Grotesque' }}>
              MindMeld
            </h3>
            <span className="hidden sm:inline text-sm text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              Work in progress
            </span>
          </Link>
        </div>
        {user && (
          <div className="flex items-center">
            <span className="text-stone-600 mx-2 sm:mx-4 text-sm sm:text-base">
              {nickname}
            </span>
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