import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import {
  Activity,
  UserRound,
  Power,
  Users,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { db } from "../../firebase/config";

import useAuth from "../../Context/useAuth";

import { logoutUser } from "../../firebase/auth";


export default function AdminDashboard() {

  const {
    userData,
  } = useAuth();

  const navigate = useNavigate();


  const [facility, setFacility] =
    useState(null);

  const [updating, setUpdating] =
    useState(false);


  useEffect(() => {

    const facilityRef = doc(
      db,
      "facilities",
      "city-care-clinic"
    );


    const unsubscribe =
      onSnapshot(
        facilityRef,
        (snapshot) => {

          if (snapshot.exists()) {

            setFacility({
              id: snapshot.id,
              ...snapshot.data(),
            });

          }

        },
        (error) => {

          console.error(
            "Facility error:",
            error
          );

        }
      );


    return unsubscribe;

  }, []);


  const toggleDoctorStatus =
    async () => {

      if (!facility) return;

      setUpdating(true);

      try {

        const facilityRef = doc(
          db,
          "facilities",
          "city-care-clinic"
        );

        await updateDoc(
          facilityRef,
          {
            isDoctorPresent:
              !facility.isDoctorPresent,
          }
        );

      } catch (error) {

        console.error(
          "Unable to update doctor status:",
          error
        );

      } finally {

        setUpdating(false);

      }

    };


  const serveNextPatient =
    async () => {

      if (!facility) return;

      const facilityRef = doc(
        db,
        "facilities",
        "city-care-clinic"
      );

      const nextToken =
        (facility.currentToken || 0) + 1;

      await updateDoc(
        facilityRef,
        {
          currentToken: nextToken,
        }
      );

    };


  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };


  if (!facility) {

    return (
      <div className="loading-screen">
        <p>
          Loading facility control center...
        </p>
      </div>
    );

  }


  const doctorPresent =
    facility.isDoctorPresent;


  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <p className="eyebrow">
            FACILITY ADMIN
          </p>

          <h1>
            Control Center
          </h1>

          <p className="dashboard-subtitle">
            {facility.name}
          </p>

        </div>


        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </header>


      <section className="admin-grid">


        {/* DOCTOR STATUS */}

        <div className="admin-card">

          <div className="card-header">

            <div className="card-icon">
              <UserRound size={22} />
            </div>

            <div>

              <p className="eyebrow">
                LIVE PRESENCE
              </p>

              <h2>
                Doctor Status
              </h2>

            </div>

          </div>


          <div
            className={
              doctorPresent
                ? "large-status present"
                : "large-status away"
            }
          >

            <span></span>

            {doctorPresent
              ? "Doctor Present"
              : "Doctor Away"}

          </div>


          <div className="assigned-doctor">

            <div className="doctor-avatar">
              {facility.currentDoctor
                ?.charAt(0)
                .toUpperCase() || "D"}
            </div>

            <div>

              <strong>
                {facility.currentDoctor ||
                  "Dr. Arindam Sen"}
              </strong>

              <p>
                General Physician
              </p>

            </div>

          </div>


          <button
            className={
              doctorPresent
                ? "danger-button"
                : "primary-button full"
            }
            onClick={toggleDoctorStatus}
            disabled={updating}
          >

            <Power size={18} />

            {updating
              ? "Updating..."
              : doctorPresent
                ? "Mark Doctor Away"
                : "Mark Doctor Present"}

          </button>

        </div>


        {/* QUEUE */}

        <div className="admin-card">

          <div className="card-header">

            <div className="card-icon">
              <Users size={22} />
            </div>

            <div>

              <p className="eyebrow">
                QUEUE MANAGEMENT
              </p>

              <h2>
                Live Queue
              </h2>

            </div>

          </div>


          <div className="queue-number">

            <span>
              NOW SERVING
            </span>

            <strong>
              #{facility.currentToken || 0}
            </strong>

          </div>


          <div className="queue-meta">

            <div>
              <span>
                Total Tokens
              </span>

              <strong>
                #{facility.lastToken || 0}
              </strong>
            </div>

            <div>
              <span>
                Doctor
              </span>

              <strong>
                {doctorPresent
                  ? "Present"
                  : "Away"}
              </strong>
            </div>

          </div>


          <button
            className="primary-button full"
            onClick={serveNextPatient}
            disabled={!doctorPresent}
          >
            <Activity size={18} />

            Serve Next Patient
          </button>

        </div>

      </section>


      <section className="admin-card phone-patient-card">

        <div>

          <p className="eyebrow">
            PHONE QUEUE
          </p>

          <h2>
            Add Phone Patient
          </h2>

          <p>
            Add patients who cannot use the
            application to the same queue.
          </p>

        </div>


        <button
          className="secondary-button"
        >
          Add Phone Patient
        </button>

      </section>

    </div>
  );
}