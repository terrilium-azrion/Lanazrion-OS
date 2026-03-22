import adminConfig from './constants/adminConfig';

// ... other imports

function handleLogin(email) {
  const access = adminConfig.authorizedEmails.includes(email) ? 'ELITE' : 'MEMBER';
  // ... rest of the logic
}

// ... other code