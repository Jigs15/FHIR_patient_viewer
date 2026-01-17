// components/Topbar.jsx
export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbarLeft">
        <div className="searchWrap">
          <span className="searchIcon">🔎</span>
          <input className="searchInput" placeholder="Search here..." />
        </div>
      </div>

      <div className="topbarRight">
        <button className="btn btn-green">+ Add patient</button>

        <button className="iconBtn" title="Notifications">🔔</button>

        <div className="avatarWrap">
          <div className="avatar">J</div>
          <div className="avatarMeta">
            <div className="avatarName">Admin</div>
            <div className="avatarRole">Hospital Ops</div>
          </div>
        </div>
      </div>
    </div>
  );
}
