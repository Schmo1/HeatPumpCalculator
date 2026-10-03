import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

export default function Layout() {
  const { username, role, isAdmin, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">{t("brand")}</span>
        <button
          className="menu-toggle"
          aria-label={t("action.menu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
        </button>
        <div className={"topbar-collapsible" + (menuOpen ? " open" : "")}>
          <nav>
            <NavLink to="/" end onClick={closeMenu}>{t("nav.overview")}</NavLink>
            <NavLink to="/billing" onClick={closeMenu}>{t("nav.billing")}</NavLink>
            <NavLink to="/water" onClick={closeMenu}>{t("nav.water")}</NavLink>
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
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
