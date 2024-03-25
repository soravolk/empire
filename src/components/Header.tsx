import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <div className="flex justify-between px-4 border-b">
        <Link
          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          to="/"
        >
          Empire
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
      </div>
    </div>
  );
}
