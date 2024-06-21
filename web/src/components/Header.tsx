import { Link } from "react-router-dom";
import { GiWhiteTower } from "react-icons/gi";

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
        <a
          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          href="/auth/google"
        >
          Login
        </a>
      </div>
    </div>
  );
}
