import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <Link to="/">Empire</Link>
      <Link to="/shortTerm">Short Term</Link>
      <Link to="/longTerm">Long Term</Link>
      <Link to="/setting">Setting</Link>
    </div>
  );
}
