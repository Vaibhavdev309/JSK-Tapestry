import React from "react";
import { NavLink } from "react-router-dom";
import { AddIcon, OrderIcon, ContactIcon } from "../utils/icons.jsx";

const Sidebar = ({ closeSidebar, isMobile, counts = { orders: 0, chats: 0, priceRequests: 0, contactMessages: 0 } }) => {
  const activeStyle = "bg-blue-50 border-blue-300 font-semibold text-blue-700";
  const normalStyle = "hover:bg-gray-50 border-gray-200 text-gray-700";

  // Helper to render dot indicator
  const renderDot = (count) => {
    if (count > 0) {
      return (
        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div className="flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4">
        <NavLink
          to="/add"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <AddIcon className="w-5 h-5" />
          <span className="text-sm lg:text-base">Add Items</span>
        </NavLink>

        <NavLink
          to="/list"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <OrderIcon className="w-5 h-5" />
          <span className="text-sm lg:text-base">List Items</span>
        </NavLink>

        <NavLink
          to="/orders"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <div className="flex items-center gap-3">
            <OrderIcon className="w-5 h-5" />
            <span className="text-sm lg:text-base">Orders</span>
          </div>
          {renderDot(counts.orders)}
        </NavLink>

        <NavLink
          to="/chats"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <div className="flex items-center gap-3">
            <OrderIcon className="w-5 h-5" />
            <span className="text-sm lg:text-base">Chats</span>
          </div>
          {renderDot(counts.chats)}
        </NavLink>
        <NavLink
          to="/request"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <div className="flex items-center gap-3">
            <OrderIcon className="w-5 h-5" />
            <span className="text-sm lg:text-base">Request</span>
          </div>
          {renderDot(counts.priceRequests)}
        </NavLink>
        <NavLink
          to="/contact"
          onClick={isMobile ? closeSidebar : null}
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
            ${isActive ? activeStyle : normalStyle}`
          }
        >
          <div className="flex items-center gap-3">
            <ContactIcon className="w-5 h-5" />
            <span className="text-sm lg:text-base">Contact Messages</span>
          </div>
          {renderDot(counts.contactMessages)}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
