# Casa da Pampulha Mobile - React Native App

## Project Overview
React Native mobile application for Casa da Pampulha vacation rental management, built with Expo and TypeScript.

## Tech Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Tab)
- **Styling**: NativeWind (Tailwind CSS for RN)
- **State Management**: React Context + AsyncStorage
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Native Toast

## Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
│   ├── auth/       # Login, Register
│   ├── guest/      # Guest dashboard screens
│   ├── staff/      # Staff dashboard screens
│   └── admin/      # Admin dashboard screens
├── navigation/     # Navigation configuration
├── services/       # API services
├── hooks/          # Custom hooks
├── contexts/       # React contexts (Auth, Theme)
├── types/          # TypeScript types
├── utils/          # Utility functions
└── assets/         # Images, fonts
```

## Setup Checklist
- [x] Create copilot-instructions.md
- [ ] Scaffold React Native project with Expo
- [ ] Install dependencies
- [ ] Configure project structure
- [ ] Create navigation structure
- [ ] Build core screens
- [ ] Set up API services
- [ ] Update README

## Development Commands
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## API Configuration
The app connects to the existing Casa da Pampulha API. Configure the API base URL in `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```
