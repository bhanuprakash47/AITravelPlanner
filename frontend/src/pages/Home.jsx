import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";

import LoadingView from "../components/LoadingView";
import FailureView from "../components/FailureView";

import "../styles/home.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiStatusList = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Home = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusList.initial);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setApiStatus(apiStatusList.inProgress);

      const response = await axios.get(
        `${API_BASE_URL}/api/trips`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("jwt_token")}`,
          },
        }
      );

      setTrips(response.data.tripsList);

      setApiStatus(apiStatusList.success);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        "Failed to fetch trips."
      );

      setApiStatus(apiStatusList.failure);
    }
  };

  const renderSuccessView = () => {
    return (
      <>
        <div className="home-header">

          <div>
            <h1 className="home-heading">
              My Trips
            </h1>

            <p className="home-description">
              Manage all your AI generated trips.
            </p>
          </div>

          <button
            className="create-trip-btn"
            onClick={() => navigate("/trip/new")}
          >
            + Create Trip
          </button>

        </div>

        {trips.length === 0 ? (
          <div className="empty-container">
            <h2>No Trips Found</h2>

            <p>
              Start by creating your first AI generated trip.
            </p>
          </div>
        ) : (
          <div className="trip-list">

            {trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
              />
            ))}

          </div>
        )}
      </>
    );
  };

  const renderView = () => {
    switch (apiStatus) {
      case apiStatusList.inProgress:
        return <LoadingView />;

      case apiStatusList.failure:
        return (
          <FailureView
            message={errorMsg}
            retry={fetchTrips}
          />
        );

      case apiStatusList.success:
        return renderSuccessView();

      default:
        return null;
    }
  };

  if (!Cookies.get("jwt_token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="home-container">

      <Navbar />

      <div className="home-content">

        {renderView()}

      </div>

    </div>
  );
};

export default Home