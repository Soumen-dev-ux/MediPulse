import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import {
  Stethoscope,
  Power,
  LogOut,
} from "lucide-react";

import { db } from "../../firebase/config";

import useAuth from "../../Context/useAuth";

import { logoutUser } from "../../firebase/auth";

import { useNavigate } from "react-router-dom";


export default function DoctorDashboard() {

  const { user, userData } = useAuth();

  const navigate = useNavigate();

  const [available, setAvailable] =
    useState(false);


  useEffect(() => {

    if (!user) return;

    const doctorRef = doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe =
      onSnapshot(
        doctorRef,
        (snapshot) => {

          if (snapshot.exists()) {

            setAvailable(
              snapshot.data()
                .availableForConsultation || false
            );

          }

        }
      );

    return unsubscribe;

  }, [user]);


  const toggleAvailability =
    async () => {

      if (!user) return;

      const doctorRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(
        doctorRef,
        {
          availableForConsultation:
            !available,
        }
      );

    };


  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };


  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <p className="eyebrow">
            DOCTOR PORTAL
          </p>

          <h1>
            Welcome,{" "}
            {userData?.name || "Doctor"} 👋
          </h1>

        </div>


        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </header>


      <div className="doctor-status-card">

        <div className="doctor-icon">
          <Stethoscope size={30} />
        </div>

        <div>

          <p className="eyebrow">
            CONSULTATION STATUS
          </p>

          <h2>
            {available
              ? "Available for Consultation"
              : "Currently Offline"}
          </h2>

          <p>
            Patients can see your
            availability status.
          </p>

        </div>


        <button
          className={
            available
              ? "status-toggle active"
              : "status-toggle"
          }
          onClick={toggleAvailability}
        >

          <Power size={18} />

          {available
            ? "Available"
            : "Go Available"}

        </button>

      </div>


      <section className="dashboard-section">

        <p className="eyebrow">
          CONSULTATIONS
        </p>

        <h2>
          Consultation Queue
        </h2>

        <div className="empty-state">
          No consultation requests yet.
        </div>

      </section>

    </div>
  );
}