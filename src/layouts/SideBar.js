import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome,faPlus, faFileAlt,faTrash, faFolder, faInbox, faUser, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

function SideBar() {
  const location = useLocation();
  const [islogout,setIsLogout] = useState(false);
  function handleLogout()
  {
    localStorage.clear()
    // setIsLogout(true)
    window.location.reload(false);


  }
  const links = [
    { to: "/Admin/Dashboard", icon: faHome, label: "Dashboard" },
    { to: "/Admin/Accounts", icon: faUser, label: "Accounts" },
    { to: "/Admin/Post/New", icon: faPlus, label: "Create Post" },
    { to: "/Admin/Posts", icon: faFileAlt, label: "All Posts" },
    { to: "/Admin/Categories", icon: faFolder, label: "Categories" },
    { to: "/Admin/DeletedPosts", icon: faTrash, label: "Deleted Posts" },
  //  { to: "/Admin/Categories", icon: faFolder, label: "Categories" },
    // { to: "/Admin/Inbox", icon: faInbox, label: "Inbox" }, 
    // { to: "/Admin/Settings", icon: faCog, label: "Settings" },
    // { to: "/Logout", icon: faSignOutAlt, label: "Logout" },

  ];

  return (
    <nav className="border-r bg-white h-screen p-4 w-64 pt-10">
      {links.map((link) => (
        <Link key={link.to} to={link.to} aria-label={link.label}>
          <div
            className={`flex items-center text-black-300 hover:text-blue-500 cursor-pointer rounded-md p-2 mb-2 ${
              location.pathname === link.to ||
              (location.pathname === "/Admin" && link.to === "/Admin/Dashboard") ? "bg-gray-200" : ""
            }`}
          >
            <FontAwesomeIcon icon={link.icon} className="mr-3 text-indigo-500" />
            <span>{link.label}</span>
          </div>
        </Link>
      ))}
      {/* <p onClick={handleLogout}>Logout</p> */}
      
          <div
            className={`flex items-center text-black-300 hover:text-blue-500 cursor-pointer rounded-md p-2 mb-2`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-indigo-500" />
            <button onClick={handleLogout}>{"Logout"}</button>
            {/* {islogout ? <Navigate to="/Login" /> :''} */}
          </div>
    </nav>
  );
}

export default SideBar;
