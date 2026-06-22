import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from "../components/Navbar";
import "../styles/tripForm.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TripForm = () => {
  const navigate = useNavigate();
  const token = Cookies.get("jwt_token");

  const [formData, setFormData] = useState({
    destination: "",
    durationDays: "",
    budgetTier: "",
    interests: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    const { destination, durationDays, budgetTier, interests } = formData;

    if (
      !destination.trim() ||
      !durationDays.trim() ||
      !budgetTier.trim() ||
      !interests.trim()
    ) {
      setErrorMsg("All fields are required.");
      return;
    }

    const duration = Number(durationDays);

    if (!Number.isInteger(duration) || duration < 1) {
      setErrorMsg("Duration must be a valid number greater than 0.");
      return;
    }

    const interestsArray = interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (interestsArray.length === 0) {
      setErrorMsg("Please enter at least one interest.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/trips/new`,
        {
          destination: destination.trim(),
          durationDays: duration,
          budgetTier,
          interests: interestsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Failed to create trip."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="trip-form-page">
      <Navbar />

      <div className="trip-form-page-content">
        <form className="trip-form-container" onSubmit={handleSubmit}>
          <h2 className="trip-form-title">Create New Trip</h2>

          <div className="trip-form-grid">
            <div className="form-group">
              <label htmlFor="destination" className="form-label">
                Destination
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                className="form-input"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter destination"
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationDays" className="form-label">
                Number of Days
              </label>
              <input
                id="durationDays"
                name="durationDays"
                type="number"
                min="1"
                className="form-input"
                value={formData.durationDays}
                onChange={handleChange}
                placeholder="Enter duration"
              />
            </div>

            <div className="form-group">
              <label htmlFor="budgetTier" className="form-label">
                Budget Type
              </label>
              <select
                id="budgetTier"
                name="budgetTier"
                className="form-input"
                value={formData.budgetTier}
                onChange={handleChange}
              >
                <option value="">Select Budget</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="interests" className="form-label">
                Interests
              </label>
              <input
                id="interests"
                name="interests"
                type="text"
                className="form-input"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Food, Adventure, Culture"
              />
            </div>
          </div>

          {errorMsg && <p className="trip-form-error">{errorMsg}</p>}

          <button type="submit" className="trip-form-btn" disabled={loading}>
            {loading ? "Please wait..." : "Generate Trip"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripForm;