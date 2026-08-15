import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="topbar">

      <div>
        <h1>Dashboard</h1>
        <p>
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="topbar-user">

        <div className="avatar">
          {user?.profile_image ? (
            <img
              src={`http://localhost:3000${user.profile_image}`}
              alt={user.name}
            />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>

        <div className="topbar-user-info">
          <strong>{user?.name}</strong>

          <span>
            {user?.role === "admin"
              ? "Administrator"
              : "Staff"}
          </span>
        </div>

      </div>

    </header>
  );
};

export default Topbar;