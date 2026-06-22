import "../styles/loadingView.css"

const LoadingView=()=>{
        return(
            <div className="spinner-container">
                <p className="loading-para">Loading...</p>
                <div className="loading-spinner"></div>
            </div>
        )
    }

export default LoadingView