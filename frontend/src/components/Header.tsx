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
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-slate-900 hover:text-slate-700 m-0" style={{ fontFamily: 'Bricolage Grotesque' }}>
              MindMeld
            </h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Work in progress
            </span>
          </Link>
        </div>
        {user && (
          <div className="flex items-center">
            <span className="text-slate-600 mx-4">
              {nickname}
            </span>
            <SignInOutButton />
          </div>
        )}
        {!user && (
          <div className="ml-4">
            <SignInOutButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;