# FitPulse - Fitness Tracking App

A modern React-based fitness application with a backend API for real data persistence.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Dashboard**: View activity progress, recent workouts, and motivational content
- **Workout Tracker**: Browse and track workouts by category (Cardio, Strength, Yoga, HIIT)
- **Progress Tracking**: View charts and analytics of your fitness journey
- **Profile Management**: Update personal information and fitness goals

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js with Express
- SQLite with Better SQLite3
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```
   The server will run on http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The app will run on http://localhost:5173

3. Or run both simultaneously:
   ```bash
   npm run dev:full
   ```

### Database

The app uses SQLite with a local database file (`fitness.db`). The database is automatically created and seeded with workout data when the server starts.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Workouts
- `GET /api/workouts` - Get all workouts (with optional category filter)
- `GET /api/workouts/:id` - Get specific workout

### Sessions
- `POST /api/sessions` - Create workout session
- `GET /api/sessions` - Get user's recent sessions

### Progress
- `POST /api/progress` - Update daily progress
- `GET /api/progress` - Get progress data

### Dashboard
- `GET /api/dashboard` - Get dashboard data

## Project Structure

```
fitness-app/
├── server.js              # Express server
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/            # Page components
│   ├── utils/            # API utilities
│   └── App.jsx           # Main app component
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Development

The app is designed with a focus on user experience and modern web development practices. The backend provides real data persistence, replacing the previous mock data approach.

### Key Improvements from Mock Version:
- Real user authentication
- Persistent data storage
- User-specific progress tracking
- Secure API endpoints
- Proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.