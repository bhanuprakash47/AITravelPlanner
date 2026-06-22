import "../styles/failureView.css";

const FailureView = ({ message, retry }) => {
  return (
    <div className="failure-container">

      <h1 className="failure-heading">
        Something Went Wrong
      </h1>

      <p className="failure-message">
        {message || "Unable to complete your request."}
      </p>

      {retry && (
        <button
          type="button"
          className="retry-btn"
          onClick={retry}
        >
          Retry
        </button>
      )}

    </div>
  );
};

export default FailureView;