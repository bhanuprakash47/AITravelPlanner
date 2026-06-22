import { useNavigate } from "react-router-dom";

import "../styles/tripCard.css";

const TripCard = ({ trip }) => {
  const navigate = useNavigate();

  const {
    _id,
    destination,
    durationDays,
    budgetTier,
    interests,
    estimatedBudget,
    createdAt,
  } = trip;

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="trip-card">

      <div className="trip-card-header">

        <h2 className="trip-destination">
          {destination}
        </h2>

        <p className="trip-budget-tier">
          {budgetTier} Budget
        </p>

      </div>

      <p className="trip-duration">
        {durationDays} Days
      </p>

      <div className="trip-interests">

        {interests.map((interest) => (
          <span
            key={interest}
            className="interest-tag"
          >
            {interest}
          </span>
        ))}

      </div>

      <div className="trip-budget">

        <p className="budget-label">
          Estimated Budget
        </p>

        <h3 className="budget-amount">
          ${estimatedBudget.total}
        </h3>

      </div>

      <p className="trip-date">
        Created: {formattedDate}
      </p>

      <button
        type="button"
        className="details-btn"
        onClick={() => navigate(`/trip/${_id}`)}
      >
        View Details
      </button>

    </div>
  );
};

export default TripCard;