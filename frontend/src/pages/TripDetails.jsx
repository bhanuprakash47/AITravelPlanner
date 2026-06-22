import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from "../components/Navbar";
import LoadingView from "../components/LoadingView";
import FailureView from "../components/FailureView";

import "../styles/tripDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiStatusList = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const createEmptyActivity = () => ({
  title: "",
  description: "",
  estimatedCostUSD: 0,
  timeOfDay: "Morning",
});

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const TripDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = Cookies.get("jwt_token");

  const [trip, setTrip] = useState(null);
  const [apiStatus, setApiStatus] = useState(apiStatusList.initial);
  const [errorMsg, setErrorMsg] = useState("");

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editableItinerary, setEditableItinerary] = useState([]);
  const [instruction, setInstruction] = useState("");

  const fetchTrip = async () => {
    try {
      setApiStatus(apiStatusList.inProgress);
      setErrorMsg("");
      setActionError("");
      setActionMessage("");

      const response = await axios.get(`${API_BASE_URL}/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedTrip = response.data.trip;
      setTrip(fetchedTrip);
      setEditableItinerary(deepClone(fetchedTrip?.itinerary || []));
      setApiStatus(apiStatusList.success);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to fetch trip.");
      setApiStatus(apiStatusList.failure);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  useEffect(() => {
    if (trip) {
      setEditableItinerary(deepClone(trip.itinerary || []));
    }
  }, [trip]);

  const formatMoney = (value) => {
    if (value === undefined || value === null || value === "") return "$0";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "$0";
    return `$${numericValue.toLocaleString()}`;
  };

  const handleActivityChange = (dayIndex, activityIndex, field, value) => {
    setEditableItinerary((prev) => {
      const updated = deepClone(prev);
      if (!updated?.[dayIndex]?.activities?.[activityIndex]) return prev;

      if (field === "estimatedCostUSD") {
        updated[dayIndex].activities[activityIndex][field] =
          value === "" ? "" : Number(value);
      } else {
        updated[dayIndex].activities[activityIndex][field] = value;
      }

      return updated;
    });
  };

  const addActivity = (dayIndex) => {
    setEditableItinerary((prev) => {
      const updated = deepClone(prev);
      if (!updated?.[dayIndex]) return prev;
      updated[dayIndex].activities = [
        ...(updated[dayIndex].activities || []),
        createEmptyActivity(),
      ];
      return updated;
    });
  };

  const deleteActivity = (dayIndex, activityIndex) => {
    setEditableItinerary((prev) => {
      const updated = deepClone(prev);
      if (!updated?.[dayIndex]?.activities?.length) return prev;
      updated[dayIndex].activities.splice(activityIndex, 1);
      return updated;
    });
  };

  const cancelEditing = () => {
    setEditableItinerary(deepClone(trip?.itinerary || []));
    setIsEditing(false);
    setActionError("");
    setActionMessage("");
  };

  const handleSaveItinerary = async () => {
    try {
      setIsSaving(true);
      setActionError("");
      setActionMessage("");

      const response = await axios.put(
        `${API_BASE_URL}/api/trips/${id}`,
        {
          itinerary: editableItinerary,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTrip = response.data.trip;
      setTrip(updatedTrip);
      setEditableItinerary(deepClone(updatedTrip?.itinerary || []));
      setIsEditing(false);
      setActionMessage("Trip updated successfully.");
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to update trip.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateTrip = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionMessage("");

    if (!instruction.trim()) {
      setActionError("Please enter a regeneration instruction.");
      return;
    }

    try {
      setIsRegenerating(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/trips/${id}/regenerate`,
        { instruction: instruction.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const regeneratedTrip = response.data.trip;
      setTrip(regeneratedTrip);
      setEditableItinerary(deepClone(regeneratedTrip?.itinerary || []));
      setActionMessage("Trip regenerated successfully.");
      setInstruction("");
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to regenerate trip."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteTrip = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    setActionError("");
    setActionMessage("");

    try {
      setIsDeleting(true);

      await axios.delete(`${API_BASE_URL}/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/", { replace: true });
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to delete trip.");
      setIsDeleting(false);
    }
  };

  const renderEditableActivity = (activity, dayIndex, activityIndex) => {
    return (
      <div className="activity-card" key={`${dayIndex}-${activityIndex}`}>
        <div className="activity-header">
          <div className="activity-time-wrap">
            {isEditing ? (
              <select
                className="field-input activity-time-select"
                value={activity.timeOfDay || "Morning"}
                onChange={(e) =>
                  handleActivityChange(
                    dayIndex,
                    activityIndex,
                    "timeOfDay",
                    e.target.value
                  )
                }
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            ) : (
              <span className="activity-time">{activity.timeOfDay}</span>
            )}
          </div>

          {!isEditing ? (
            <h4 className="activity-title">{activity.title}</h4>
          ) : (
            <input
              className="field-input activity-title-input"
              type="text"
              value={activity.title}
              onChange={(e) =>
                handleActivityChange(
                  dayIndex,
                  activityIndex,
                  "title",
                  e.target.value
                )
              }
              placeholder="Activity title"
            />
          )}
        </div>

        {isEditing ? (
          <>
            <div className="activity-edit-grid">
              <div className="field-group full-width">
                <label className="field-label">Description</label>
                <textarea
                  className="field-input activity-description-input"
                  rows="3"
                  value={activity.description || ""}
                  onChange={(e) =>
                    handleActivityChange(
                      dayIndex,
                      activityIndex,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Activity description"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Estimated Cost (USD)</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={activity.estimatedCostUSD ?? 0}
                  onChange={(e) =>
                    handleActivityChange(
                      dayIndex,
                      activityIndex,
                      "estimatedCostUSD",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="activity-edit-actions">
              <button
                type="button"
                className="action-btn danger"
                onClick={() => deleteActivity(dayIndex, activityIndex)}
              >
                Delete Activity
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="activity-description">{activity.description}</p>
            <p className="activity-cost">
              Cost: {formatMoney(activity.estimatedCostUSD)}
            </p>
          </>
        )}
      </div>
    );
  };

  const renderSuccessView = () => {
    if (!trip) return null;

    const budget = trip.estimatedBudget || {};
    const hotels = Array.isArray(trip.hotels) ? trip.hotels : [];
    const itinerary = isEditing ? editableItinerary : trip.itinerary || [];
    const packingList = Array.isArray(trip.packingList) ? trip.packingList : [];

    return (
      <div className="trip-details-stack">
        <div className="top-actions-row">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>

          <div className="top-button-group">
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? "Close Edit Mode" : "Edit Activities"}
            </button>

            <button
              type="button"
              className="action-btn danger"
              onClick={handleDeleteTrip}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Trip"}
            </button>
          </div>
        </div>

        <div className="trip-summary-card">
          <div className="trip-summary-header">
            <div>
              <h1 className="trip-title">{trip.destination}</h1>
              <p className="trip-meta">
                {trip.durationDays} Days • {trip.budgetTier} Budget
              </p>
              <p className="trip-created">
                Created: {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          {actionMessage && <p className="success-msg">{actionMessage}</p>}
          {actionError && <p className="error-msg">{actionError}</p>}

          <div className="interest-tags">
            {trip.interests?.map((interest) => (
              <span key={interest} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Estimated Budget</h2>
          <div className="budget-grid">
            <div className="budget-item">
              <p className="budget-label">Transport</p>
              <h3 className="budget-value">{formatMoney(budget.transport)}</h3>
            </div>
            <div className="budget-item">
              <p className="budget-label">Accommodation</p>
              <h3 className="budget-value">
                {formatMoney(budget.accommodation)}
              </h3>
            </div>
            <div className="budget-item">
              <p className="budget-label">Food</p>
              <h3 className="budget-value">{formatMoney(budget.food)}</h3>
            </div>
            <div className="budget-item">
              <p className="budget-label">Activities</p>
              <h3 className="budget-value">
                {formatMoney(budget.activities)}
              </h3>
            </div>
            <div className="budget-item total">
              <p className="budget-label">Total</p>
              <h3 className="budget-value">{formatMoney(budget.total)}</h3>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Hotels</h2>
          <div className="list-stack">
            {hotels.length > 0 ? (
              hotels.map((hotel, index) => (
                <div key={`${hotel.name}-${index}`} className="hotel-card">
                  <div className="hotel-card-header">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <p className="hotel-tier">{hotel.tier || trip.budgetTier}</p>
                  </div>
                  <p className="hotel-rating">Rating: {hotel.rating || "-"}</p>
                  <p className="hotel-cost">
                    {formatMoney(hotel.estimatedCostNightUSD)}/night
                  </p>
                </div>
              ))
            ) : (
              <p className="empty-text">No hotels available.</p>
            )}
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Itinerary</h2>
          <div className="list-stack">
            {itinerary.length > 0 ? (
              itinerary.map((day, dayIndex) => (
                <div key={day.dayNumber} className="day-card">
                  <div className="day-card-header">
                    <h3 className="day-title">Day {day.dayNumber}</h3>
                    {isEditing && (
                      <button
                        type="button"
                        className="action-btn secondary add-day-activity-btn"
                        onClick={() => addActivity(dayIndex)}
                      >
                        + Add Activity
                      </button>
                    )}
                  </div>

                  <div className="activity-stack">
                    {day.activities?.length > 0 ? (
                      day.activities.map((activity, activityIndex) =>
                        renderEditableActivity(activity, dayIndex, activityIndex)
                      )
                    ) : (
                      <p className="empty-text">No activities for this day.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">No itinerary available.</p>
            )}
          </div>

          {isEditing && (
            <div className="button-row edit-footer-actions">
              <button
                type="button"
                className="action-btn primary"
                onClick={handleSaveItinerary}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="action-btn secondary"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="section-card">
          <h2 className="section-title">Packing List</h2>
        <div className="packing-list">
          {packingList.length > 0 ? (
            <ul className="packing-list-items">
              {packingList.map((item, index) => (
                <li
                  key={`${item.item}-${index}`}
                  className="packing-list-item"
                >
                  <span className="packing-item-name">{item.item}</span>
                      {item.category && (
                        <span className="packing-category">
                          ({item.category})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No packing items available.</p>
              )}
        </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Regenerate Trip</h2>
          <p className="section-note">Tell the AI what should change.</p>

          <form onSubmit={handleRegenerateTrip} className="regenerate-form">
            <textarea
              className="instruction-box"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Example: Regenerate Day 3 with more outdoor activities"
              rows="5"
            />

            <div className="button-row">
              <button
                type="submit"
                className="action-btn primary"
                disabled={isRegenerating}
              >
                {isRegenerating ? "Regenerating..." : "Regenerate Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (apiStatus) {
      case apiStatusList.inProgress:
        return <LoadingView />;
      case apiStatusList.failure:
        return <FailureView message={errorMsg} retry={fetchTrip} />;
      case apiStatusList.success:
        return renderSuccessView();
      default:
        return null;
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="trip-details-page">
      <Navbar />

      <div className="trip-details-content">{renderView()}</div>
    </div>
  );
};

export default TripDetails;
