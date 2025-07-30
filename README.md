# Cyphr Demo Website

A professional trading intelligence platform demo showcasing real-time cryptocurrency data, advanced charting, and AI-powered insights.

## 🌟 Features

### 🚀 Real-Time Trading Terminal
- **Live Token Search** - Search any cryptocurrency by symbol or contract address
- **Real-Time Data** - Live prices, volume, and market cap from CoinGecko API
- **Professional Charts** - Interactive candlestick charts with grid backgrounds
- **AI Insights** - Machine learning-powered trading recommendations
- **Risk Assessment** - Dynamic risk level analysis

### 📊 Advanced Analytics
- **Holder Distribution** - Token holder analysis and whale tracking
- **Liquidity Events** - Real-time liquidity movement monitoring
- **Smart Money Flow** - Institutional and whale activity tracking
- **Technical Indicators** - RSI, MACD, and momentum analysis

### 🎨 Professional UI/UX
- **Bloomberg Terminal Inspired** - Professional trading platform design
- **Dark Theme** - Easy on the eyes for extended trading sessions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-Time Updates** - Live data feeds and dynamic content

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS3 with custom animations
- **Build Tool**: Vite
- **Data API**: CoinGecko (free tier)
- **Charts**: Custom SVG-based candlestick charts
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cyphr-demo.git
   cd cyphr-demo/demo-website/cyphr-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🌐 Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment with a custom domain:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cyphr-demo.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` → `/demo-website/cyphr-app/dist`
   - Save

3. **Custom Domain**
   - The CNAME file is already configured for `demo.cyphr.trade`
   - Add the domain in GitHub Pages settings
   - Update your DNS to point to GitHub Pages

## 📁 Project Structure

```
demo-website/cyphr-app/
├── public/
│   ├── CNAME                 # Custom domain configuration
│   ├── index.html           # Main HTML file
│   └── assets/              # Static assets
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   │   ├── ProTerminal.tsx # Main trading terminal
│   │   └── ProTerminal.css # Terminal styling
│   ├── contexts/           # React contexts
│   └── App.tsx             # Main app component
├── package.json            # Dependencies and scripts
└── vite.config.ts         # Vite configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### Customization

- **Colors**: Edit CSS variables in `src/index.css`
- **API**: Modify API endpoints in `src/pages/ProTerminal.tsx`
- **Styling**: Update `src/pages/ProTerminal.css`

## 📊 API Integration

The demo uses the CoinGecko API for real-time cryptocurrency data:

- **Search**: `/search?query={token}`
- **Prices**: `/simple/price?ids={ids}&vs_currencies=usd`
- **Market Data**: Includes 24h change, volume, market cap

### Rate Limits
- CoinGecko free tier: 50 calls/minute
- Consider upgrading for production use

## 🎯 Demo Features

### Search Functionality
- Type any cryptocurrency symbol (BTC, ETH, PEPE, etc.)
- Search by full name or contract address
- Real-time results with live pricing
- Click to load detailed analysis

### Chart Features
- Interactive candlestick charts
- Professional grid background
- Price and time labels
- Zoom and pan functionality
- Multiple timeframes (1H, 4H, 1D, 1W, 1M)

### AI Insights
- Bullish/Bearish sentiment analysis
- Confidence scoring
- Technical analysis recommendations
- Risk level assessment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CoinGecko** for providing free cryptocurrency data
- **Bloomberg Terminal** for UI/UX inspiration
- **React Community** for the amazing framework
- **Vite** for the fast build tool

## 📞 Support

For support, email support@cyphr.trade or create an issue in this repository.

---

**Live Demo**: [demo.cyphr.trade](https://demo.cyphr.trade)

Built with ❤️ by the Cyphr Team 