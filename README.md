# AI Travel Planner

## Project Overview

AI Travel Planner is a full stack web application that helps users
generate complete travel plans using AI. A user can create an account,
login, generate a trip, view previous trips, edit itinerary activities,
regenerate the trip using natural language instructions and delete
trips.

The main goal was to build a secure multi-user application
where every user only sees and manages their own trips.

## Tech Stack

### Frontend

-   React (Vite)
-   React Router DOM
-   Axios
-   CSS
-   js-cookie

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcrypt

### AI

-   Google Gemini 2.5 Flash

## Technical Justification

- ### React & Hooks: 
        I chose React to maintain a lightweight, single-page application (SPA) structure. By utilizing React Hooks (useState, useEffect, useContext), I maintained strict control over state management. This approach kept the component logic clean, modular, and easy to trace without the abstraction overhead of server-side routing, allowing for highly interactive, UI updates.

- ### CSS Flexbox:
        I implemented the layout using standard CSS with Flexbox. This decision reflects a commitment to understanding core web fundamentals rather than relying on external styling frameworks. Building with raw Flexbox ensures a minimal, dependency-free bundle size and demonstrates an ability to architect a custom, responsive design system from scratch.


## Features

-   User Registration
-   User Login
-   JWT Authentication
-   Protected Routes
-   Multi-user support
-   AI Trip Generation
-   Budget Estimation
-   Hotel Suggestions
-   AI Generated Packing List
-   View Trips
-   Edit Activities
-   Add Activities
-   Remove Activities
-   Regenerate Trip
-   Delete Trip

## Folder Structure

``` text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── tripController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Trip.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── tripRoutes.js
├── server.js
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── FailureView.jsx
│   │   ├── LoadingView.jsx
│   │   ├── Navbar.jsx
│   │   └── TripCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── TripDetails.jsx
│   │   └── TripForm.jsx
│   ├── styles/
│   │   ├── failureView.css
│   │   ├── home.css
│   │   ├── loadingView.css
│   │   ├── login.css
│   │   ├── navbar.css
│   │   ├── register.css
│   │   ├── tripCard.css
│   │   ├── tripDetails.css
│   │   └── tripForm.css
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## High Level Architecture

``` text
React Frontend
      |
Express REST API
      |
JWT Middleware
      |
MongoDB
      |
Google Gemini API
```

## Authentication & Authorization

-   Passwords are hashed using bcrypt.
-   JWT is generated after login.
-   Protected APIs verify the JWT.
-   Every trip is linked with the logged in user.
-   Users cannot access another user's trips.

## AI Agent

The backend prepares a prompt using destination, duration, budget and
interests. Gemini returns structured JSON containing itinerary, hotels,
estimated budget and packing list. The response is validated and stored
in MongoDB.


## Creative Feature: Automatic Retry Mechanism

    One custom feature I added is an automatic retry mechanism while generating AI trips.

    Sometimes the Gemini API can fail because of temporary network issues or rate limits. Instead of immediately showing an error to the user, the backend retries the request a few times before returning a failure response.

    I added this because AI APIs are not always reliable. Retrying improves the overall user experience and reduces unnecessary failures without requiring the user to submit the request again.

    This makes the application more reliable, especially when using external AI services.

## API Endpoints

    POST /api/auth/register

    POST /api/auth/login

    GET /api/trips

    GET /api/trips/:id

    POST /api/trips/new

    PUT /api/trips/:id

    POST /api/trips/:id/regenerate

    DELETE /api/trips/:id

## Environment Variables

### Backend

    PORT

    MONGO_URI

    JWT_SECRET_KEY

    GEMINI_API_KEY

### Frontend

    VITE_API_BASE_URL

## Local Setup

### Backend


    npm install

    node server.js

### Frontend

    npm install

    npm run dev

## Design Decisions

-   Used MongoDB because nested trip data fits well in document
    databases.
-   Used JWT for stateless authentication.
-   Added retry logic for Gemini API.
-   Stored generated trips instead of generating every request.

## Trade-offs

-   Trip regeneration updates the complete trip.
-   AI responses may differ slightly.
-   Budget values depend on AI estimates.

## Known Limitations

-   Gemini free tier rate limits.
-   No password reset.
-   No trip sharing.

## Future Improvements

-   Search trips
-   Export PDF
-   Weather integration
-   Maps
-   Expense tracking

