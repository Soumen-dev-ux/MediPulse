import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  MapPin,
  Clock,
  Stethoscope,
  LogOut,
} from "lucide-react";

import { db } from "../../firebase/config";

import useAuth from "../../Context/useAuth";

import { logoutUser } from "../../firebase/auth";

import { useNavigate } from "react-router-dom";


export default function PatientDashboard() {

  const { user, userData } = useAuth();

  const navigate = useNavigate();

  const [facility, setFacility] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    // DEMO FACILITY
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

          setLoading(false);

        },
        (error) => {

          console.error(
            "Facility listener error:",
            error
          );

          setLoading(false);

        }
      );


    return unsubscribe;

  }, []);


  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };


  if (loading) {

    return (
      <div className="loading-screen">
        Loading healthcare facilities...
      </div>
    );

  }


  const doctorPresent =
    facility?.isDoctorPresent;


  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <p className="eyebrow">
            PATIENT PORTAL
          </p>

          <h1>
            Good morning,{" "}
            {userData?.name ||
              user?.email?.split("@")[0] ||
              "Patient"}{" "}
            👋
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


      <section className="stats-grid">

        <div className="stat-card">

          <MapPin size={24} />

          <div>
            <span>
              Nearby Facilities
            </span>

            <strong>1</strong>
          </div>

        </div>


        <div className="stat-card">

          <Clock size={24} />

          <div>
            <span>
              Current Token
            </span>

            <strong>
              #{facility?.currentToken || 0}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <Stethoscope size={24} />

          <div>
            <span>
              Doctor Status
            </span>

            <strong>
              {doctorPresent
                ? "Present"
                : "Away"}
            </strong>
          </div>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              NEARBY HEALTHCARE
            </p>

            <h2>
              Find a doctor
            </h2>
          </div>

        </div>


        {facility ? (

          <div className="facility-card">

            <div className="facility-top">

              <div>

                <span className="facility-category">
                  CLINIC
                </span>

                <h3>
                  {facility.name}
                </h3>

                <p>
                  <MapPin size={15} />
                  {facility.address}
                </p>

              </div>


              <div
                className={
                  doctorPresent
                    ? "status present"
                    : "status away"
                }
              >

                <span></span>

                {doctorPresent
                  ? "Doctor Present"
                  : "Doctor Away"}

              </div>

            </div>


            <div className="doctor-info">

              <div className="doctor-avatar">
                {facility.currentDoctor
                  ? facility.currentDoctor
                      .charAt(0)
                      .toUpperCase()
                  : "D"}
              </div>

              <div>

                <strong>
                  {facility.currentDoctor ||
                    "No doctor assigned"}
                </strong>

                <p>
                  General Physician
                </p>

              </div>

            </div>


            <div className="queue-info">

              <div>
                <span>
                  Now Serving
                </span>

                <strong>
                  #{facility.currentToken || 0}
                </strong>
              </div>

              <div>
                <span>
                  Queue
                </span>

                <strong>
                  {facility.lastToken || 0}
                  {" "}people
                </strong>
              </div>

            </div>


            <button
              className="primary-button"
              disabled={!doctorPresent}
            >
              {doctorPresent
                ? "Get Serial Number"
                : "Doctor Currently Away"}
            </button>

          </div>

        ) : (

          <div className="empty-state">
            No healthcare facilities found.
          </div>

        )}

      </section>

    </div>
  );
}