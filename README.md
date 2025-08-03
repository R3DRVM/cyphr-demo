# Cyphr Trading Platform

A modern, feature-rich trading platform built with React, TypeScript, and Vite. Features include strategy building, portfolio management, and real-time market data visualization.

## Features

- **Strategy Builder**: Drag-and-drop interface for creating trading strategies
- **Portfolio Management**: Track and manage your trading positions
- **Real-time Data**: Live market data and price feeds
- **Wallet Integration**: Connect with Web3 wallets via WalletConnect
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern dark UI with customizable accent colors

## Project Structure

```
demo-cyphr/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Color, etc.)
│   ├── pages/             # Page components
│   ├── providers/         # Web3 providers
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── docs/                  # Built files for GitHub Pages
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/R3DRVM/cyphr-demo.git
cd cyphr-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up WalletConnect (optional):
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your project ID
   - Create a `.env` file in the root directory:
   ```
   VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

### Wallet Integration

The platform uses WalletConnect for secure wallet connections. This supports:
- MetaMask
- WalletConnect compatible wallets
- Injected wallets (Phantom, etc.)

To enable wallet features:
1. Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Add it to your `.env` file as `VITE_WALLET_CONNECT_PROJECT_ID`
3. The wallet connection will appear in the header

### Customization

#### Colors
The platform uses a color context system. You can customize the accent color by:
1. Opening the color picker in the footer
2. Selecting your preferred color
3. The change will be applied globally

#### Styling
All styles are in CSS files with responsive design. The main styles are:
- `src/App.css` - Global styles
- `src/components/*.css` - Component-specific styles
- `src/pages/*.css` - Page-specific styles

## Deploy to GitHub Pages

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `docs/` folder

3. Push to GitHub:
```bash
git add docs
git commit -m "Deploy to GitHub Pages"
git push
```

4. Configure GitHub Pages to deploy from the `docs` folder

## Live Demo

Visit the live demo at: [https://demo.cyphr.trade](https://demo.cyphr.trade)

## Design

The platform features a modern, dark theme with:
- Gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Responsive design
- Custom typography

## Pages

- **Dashboard**: Overview of trading activity
- **Discover**: Explore new trading opportunities
- **Portfolio**: Manage your positions
- **Spot**: Spot trading interface
- **Perpetuals**: Perpetual futures trading
- **Orders**: Order management
- **Tracker**: Market insights and analytics
- **Strategy Builder**: Create and test trading strategies
- **Pro Terminal**: Advanced trading terminal

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with custom properties
- **Routing**: React Router v6
- **State Management**: React Context API
- **Web3**: WalletConnect, Wagmi, Viem
- **Charts**: Chart.js with React wrapper
- **Flow**: React Flow for strategy builder
- **Deployment**: GitHub Pages

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ by the Cyphr team
