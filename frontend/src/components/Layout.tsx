import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

export default function Layout() {
  const { username, role, isAdmin, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">{t("brand")}</span>
        <nav>
          <NavLink to="/" end>{t("nav.overview")}</NavLink>
          <NavLink to="/billing">{t("nav.billing")}</NavLink>
          <NavLink to="/water">{t("nav.water")}</NavLink>
        </nav>
        <span className="spacer" />
        <div className="lang-switch">
          {LANGUAGES.map((code) => (
            <button
              key={code}
              className={"lang-btn" + (lang === code ? " active" : "")}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="user">
          {username}
          <span className={"badge " + (isAdmin ? "" : "reader")}>{role}</span>
        </span>
        <button className="secondary small" onClick={handleLogout}>{t("action.signOut")}</button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
