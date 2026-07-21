import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { username, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">🔥 Wärmepumpe</span>
        <nav>
          <NavLink to="/" end>Übersicht</NavLink>
          <NavLink to="/billing">Strom / Heizung</NavLink>
          <NavLink to="/water">Wasser</NavLink>
        </nav>
        <span className="spacer" />
        <span className="user">
          {username}
          <span className={"badge " + (isAdmin ? "" : "reader")}>{role}</span>
        </span>
        <button className="secondary small" onClick={handleLogout}>Abmelden</button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
