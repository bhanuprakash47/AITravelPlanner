import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import TripDetails from "./pages/TripDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/trip/:id" element={<TripDetails />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;