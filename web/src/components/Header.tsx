import { Link } from "react-router-dom";
import { GiWhiteTower } from "react-icons/gi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useFetchCurrentUserQuery } from "../store";
import classNames from "classnames";

const homeIconClass = classNames(
  "text-gray-400",
  "hover:text-black",
  "rounded-md",
  "px-3",
  "py-2",
  "text-sm",
  "font-medium"
);
const navItemClass = classNames(
  "text-gray-400",
  "hover:bg-gray-700",
  "hover:text-white",
  "rounded-md",
  "px-3",
  "py-2",
  "text-sm",
  "font-medium"
);

const LoginStatus: React.FC = () => {
  const { data, error, isLoading } = useFetchCurrentUserQuery(null);
  return (
    <div className={navItemClass}>
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
        <Link className={homeIconClass} to="/">
          <GiWhiteTower className="h-5" />
        </Link>
        <Link className={navItemClass} to="/shortTerm">
          Short Term
        </Link>
        <Link className={navItemClass} to="/longTerm">
          Long Term
        </Link>
        <Link className={navItemClass} to="/roadmap">
          Roadmap
        </Link>
        <Link className={navItemClass} to="/setting">
          Setting
        </Link>
        <LoginStatus />
      </div>
    </div>
  );
}
