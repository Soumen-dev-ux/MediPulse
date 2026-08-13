import {
  LayoutDashboard,
  MapPin,
  Clock,
  Pill,
  Bot,
  AlertTriangle,
  Info,
} from "lucide-react";

import { NavLink } from "react-router-dom";


export default function Sidebar({
  role = "patient",
}) {

  const patientLinks = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/patient",
    },
    {
      label: "Find Healthcare",
      icon: MapPin,
      path: "/patient",
    },
    {
      label: "My Queue",
      icon: Clock,
      path: "/patient",
    },
    {
      label: "Medicine",
      icon: Pill,
      path: "/patient",
    },
    {
      label: "AI Assistant",
      icon: Bot,
      path: "/patient",
    },
    {
      label: "Emergency",
      icon: AlertTriangle,
      path: "/patient",
    },
  ];


  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        MediPulse
      </div>


      <div className="sidebar-label">
        MENU
      </div>


      {role === "patient" &&
        patientLinks.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className="sidebar-link"
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );

        })}


      <NavLink
        to="/about"
        className="sidebar-link"
      >
        <Info size={19} />
        About
      </NavLink>

    </aside>
  );
}