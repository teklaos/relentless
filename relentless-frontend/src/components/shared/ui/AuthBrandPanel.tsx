export default function AuthBrandPanel() {
  return (
    <div className="auth-left">
      <div className="auth-brand">
        <div className="auth-mark">
          <div className="auth-mark-text">
            RELENT<span style={{ color: "var(--accent)" }}>LESS</span>
          </div>
        </div>
      </div>

      <div className="auth-pitch">
        <h1 className="auth-pitch-h">
          Book the space
          <br />
          <em>Make the work</em>
        </h1>
        <p className="auth-pitch-p">Studios, courts and halls. No membership.</p>
      </div>
    </div>
  );
}
