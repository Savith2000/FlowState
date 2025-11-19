# FlowState

A research-backed mobile calendar application that uses AI-driven scheduling to optimize productivity while preventing burnout.

## Overview

FlowState reimagines calendar management by integrating behavioral psychology research with intelligent scheduling algorithms. Unlike traditional calendar apps that simply organize your time, FlowState actively helps you balance productivity with mental well-being through personalized task distribution recommendations.

## Features

- **AI-Powered Scheduling Recommendations**: Leverages behavioral psychology research to generate personalized scheduling suggestions that adapt to your individual patterns and workload capacity
- **Burnout Prevention Algorithms**: Intelligent task distribution system that monitors and prevents user burnout by analyzing workload patterns
- **Real-Time Synchronization**: Seamless calendar management across all your devices with Supabase backend infrastructure
- **Intuitive Interface**: Clean, user-friendly design that makes schedule optimization effortless
- **Personalized Adaptation**: Learns from your habits and preferences to provide increasingly tailored recommendations
- **Cross-Platform Support**: Built with React Native for consistent experience on iOS and Android

## Tech Stack

- **Frontend**: React Native
- **Backend**: Supabase
- **Design**: Figma (UI/UX mockups)
- **AI Integration**: Custom prompting system for scheduling optimization

## Target Audience

FlowState is designed for students and professionals who need to manage complex schedules while maintaining their mental health and avoiding burnout.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Savith2000/FlowState.git
cd FlowState
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
# Create a .env file in the root directory
# Add your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the application
```bash
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## How It Works

FlowState uses a sophisticated AI prompting system that:

1. **Analyzes Your Schedule**: Reviews your current tasks, deadlines, and commitments
2. **Assesses Workload**: Evaluates your capacity and identifies potential burnout risks
3. **Generates Recommendations**: Suggests optimal task distribution based on behavioral psychology principles
4. **Adapts Over Time**: Continuously learns from your patterns to provide better suggestions

## Project Structure

```
FlowState/
├── src/
│   ├── components/     # React Native UI components
│   ├── screens/        # Application screens
│   ├── services/       # API and backend services
│   ├── utils/          # Helper functions and utilities
│   └── assets/         # Images, fonts, and static resources
├── App.js              # Main application entry point
└── package.json        # Project dependencies
```

## Research Foundation

FlowState is built on evidence-based behavioral psychology research focused on:
- Optimal task distribution patterns
- Cognitive load management
- Work-rest balance optimization
- Sustainable productivity practices

---

**Built with ❤️ to help you work smarter, not harder**
