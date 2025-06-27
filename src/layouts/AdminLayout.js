import React from "react";
import SideBar from "./SideBar";
import Nav from "./Nav";

function AdminLayout({ Content, children }) {
  return (
    <div className="flex flex-col">
      <Nav />
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <aside className="xl:w-64 lg:w-44 h-full border-r bg-white sticky top-0">
          <SideBar />
        </aside>
        {/* Content area */}
        <main className="flex-1   p-4">
          {Content || children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
