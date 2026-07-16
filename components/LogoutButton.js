"use client";

export default function LogoutButton() {
  return (
    <button
      className="logout-btn"
      type="button"
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Log out
    </button>
  );
}
