import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function Root() {
  return (
    <div>
      <Header />
      <div className="px-3 py-2">
        <Outlet />
      </div>
    </div>
  );
}
