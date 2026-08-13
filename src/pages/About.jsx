import { Link } from "react-router-dom";

import {
  Activity,
  MapPin,
  HeartPulse,
  Users,
  ArrowLeft,
} from "lucide-react";


export default function About() {

  return (
    <div className="about-page">

      <Link
        to="/"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>


      <div className="about-hero">

        <div className="hero-badge">
          <Activity size={16} />
          About MediPulse
        </div>

        <h1>
          Healthcare shouldn't
          begin with waiting.
        </h1>

        <p>
          MediPulse connects patients,
          doctors and healthcare facilities
          through real-time availability,
          queue tracking and accessible
          healthcare assistance.
        </p>

      </div>


      <div className="about-grid">

        <div className="about-card">

          <MapPin size={28} />

          <h3>
            Know Before You Go
          </h3>

          <p>
            Patients can check whether a
            doctor is currently present before
            travelling to a facility.
          </p>

        </div>


        <div className="about-card">

          <HeartPulse size={28} />

          <h3>
            Connected Healthcare
          </h3>

          <p>
            Patients, doctors and facility
            administrators work through a
            unified platform.
          </p>

        </div>


        <div className="about-card">

          <Users size={28} />

          <h3>
            Inclusive Queue
          </h3>

          <p>
            Digital and phone patients can
            share the same queue.
          </p>

        </div>

      </div>


      <div className="map-placeholder">

        <MapPin size={40} />

        <h2>
          Healthcare Network Map
        </h2>

        <p>
          Interactive facility map coming
          in Day 2.
        </p>

      </div>

    </div>
  );
}