// components/Sidebar.jsx
import Link from "next/link";
import { useRouter } from "next/router";

const nav = [
  { label: "Intro", href: "/intro", icon: "📘" },
  { label: "Overview", href: "/", icon: "📊" },
  { label: "Patients", href: "/patient", icon: "🧑‍⚕️" },
  { label: "Doctors", href: "/doctors", icon: "🩺" },
  { label: "Hospital", href: "/hospital", icon: "🏥" },
  { label: "Finance", href: "/finance", icon: "💳" },
];

export default function Sidebar() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logoMark">+</div>
        <div>
          <div className="brandTitle">FHIR Patient Viewer</div>
          <div className="brandSub">Bootstrap EHR • FHIR-inspired</div>
        </div>
      </div>

      <div className="menuTitle">MENU</div>

      <nav className="menu">
        {nav.map((item) => {
          const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`menuItem ${active ? "active" : ""}`}>
              <span className="menuIcon">{item.icon}</span>
              <span className="menuText">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebarFooter">
        <div className="footerBox">
          <div className="footerTitle">Help & Center</div>
          <div className="footerSub">Demo UI • local JSON • FHIR-style</div>
        </div>
      </div>
    </aside>
  );
}
