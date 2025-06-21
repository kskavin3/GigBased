# GigBased - Blockchain Project Platform

A modern gig-based project platform where stakeholders/project owners can host their project ideas and stake project budgets on the Base Chain. The platform provides comprehensive controls for specifying project stages and budget percentages per stage.

## Features

### SignUp Page
- **Email/Password Authentication**: Traditional signup with email, password, and confirm password
- **Google Account Integration**: One-click Google account linking
- **MetaMask Wallet Connection**: Seamless integration with MetaMask for blockchain interactions
- **GitHub Username Integration**: Connect your GitHub profile for developer verification

### Project Management
- **Project Creation**: Define project requirements and specifications
- **Budget Staking**: Lock project budgets on Base Chain using smart contracts
- **Stage Management**: Break down projects into stages with budget allocations
- **Developer Hiring**: Find and hire developers for specific project stages

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Blockchain**: Ethers.js for Ethereum/Base Chain integration
- **Wallet**: MetaMask integration
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Google account (for Google authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GigBased
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Google OAuth (for production)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base Chain Configuration
VITE_BASE_CHAIN_ID=8453
VITE_BASE_CHAIN_RPC_URL=https://mainnet.base.org

# Backend API (when implemented)
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout wrapper
├── pages/              # Page components
│   ├── SignUp.tsx      # Signup page with all integrations
│   └── Dashboard.tsx   # Main dashboard after authentication
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component with routing
├── main.tsx            # React entry point
└── index.css           # Global styles
```

## Key Features Implementation

### MetaMask Integration
The platform integrates with MetaMask for:
- Wallet connection and account management
- Transaction signing for budget staking
- Base Chain network switching

### Google Authentication
Google OAuth integration for:
- One-click account creation
- Profile information retrieval
- Seamless login experience

### GitHub Integration
GitHub username integration for:
- Developer profile verification
- Portfolio showcase
- Skill assessment

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Blockchain Integration

### Base Chain Support
The platform is designed to work with Base Chain:
- Smart contract deployment
- Budget staking and management
- Stage-based payment releases
- Escrow functionality

### Smart Contracts (Future Implementation)
- Project creation and management
- Budget staking and escrow
- Stage completion verification
- Payment distribution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 