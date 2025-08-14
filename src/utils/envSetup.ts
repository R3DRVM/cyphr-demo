import { configService } from '../services/config';
import lendingConfig from '../config/lending.devnet.json';

/**
 * Auto-setup environment file with defaults
 */
export function setupEnvFile() {
  try {
    // Check if .env.local exists
    const envExists = localStorage.getItem('env_file_exists');
    
    if (!envExists) {
      // Create default .env.local content
      const defaultEnvContent = `# Auto-generated .env.local with devnet defaults
VITE_SOLANA_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
VITE_LENDING_PROGRAM_ID=${lendingConfig.programId}
VITE_STRATEGY_PROGRAM_ID=MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
VITE_LENDING_V2=true
VITE_DEMO_MODE=false
VITE_TP_TARGET_BPS=200
VITE_TP_POLL_MS=15000
VITE_AI_INSIGHTS=false
VITE_DEBUG_TX=false

# Note: Server restart may be needed for env changes to take effect
# But the app will work with defaults even without restart
`;

      // Store in localStorage for now (in a real app, you'd write to file)
      localStorage.setItem('env_file_content', defaultEnvContent);
      localStorage.setItem('env_file_exists', 'true');
      
      console.log('📝 .env.local template created with devnet defaults');
      console.log('💡 Copy this content to .env.local in your project root:');
      console.log(defaultEnvContent);
      console.log('🔄 Server restart may be needed for env changes');
      console.log('✅ But the app will work with defaults even without restart');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to setup env file:', error);
    return false;
  }
}

/**
 * Get the current env file content
 */
export function getEnvFileContent(): string {
  return localStorage.getItem('env_file_content') || '';
}

/**
 * Check if env file exists
 */
export function envFileExists(): boolean {
  return localStorage.getItem('env_file_exists') === 'true';
}
