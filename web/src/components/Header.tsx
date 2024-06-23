import { Link } from "react-router-dom";
import { GiWhiteTower } from "react-icons/gi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useFetchCurrentUserQuery } from "../store";

const LoginStatus: React.FC = () => {
  const { data, error, isLoading } = useFetchCurrentUserQuery(null);
  return (
    <div className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
      {isLoading ? (
        <AiOutlineLoading3Quarters className="h-5" />
      ) : data ? (
        <a href="/auth/logout">Logout</a>
      ) : (
        <a href="/auth/google">Login</a>
      )}
    </div>
  );
};

export default function Header() {
  return (
    <div>
      <div className="flex justify-between px-4 border-b">
        <Link
          className="text-gray-300 hover:text-black rounded-md px-3 py-2 text-sm font-medium"
          to="/"
        >
          <GiWhiteTower className="h-5" />
        </Link>
        <Link
          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          to="/shortTerm"
        >
          Short Term
        </Link>
        <Link
          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          to="/longTerm"
        >
          Long Term
        </Link>
        <Link
          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          to="/setting"
        >
          Setting
        </Link>
        <LoginStatus />
      </div>
    </div>
  );
}
