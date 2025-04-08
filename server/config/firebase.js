import dotenv from 'dotenv';
dotenv.config();

// Disable Firebase for now
// import admin from 'firebase-admin';

// Initialize Firebase Admin with service account
/*
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}
*/

// Export a dummy object instead of the Firebase admin
export default {
  auth: () => ({
    generatePasswordResetLink: async (email) => {
      console.log('Firebase disabled: generatePasswordResetLink called with', email);
      return `https://example.com/reset-password?oobCode=dummy-code`;
    },
    sendPasswordResetEmail: async (email) => {
      console.log('Firebase disabled: sendPasswordResetEmail called with', email);
      return true;
    },
    verifyPasswordResetCode: async (oobCode) => {
      console.log('Firebase disabled: verifyPasswordResetCode called with', oobCode);
      return 'dummy@example.com';
    },
    confirmPasswordReset: async (oobCode, newPassword) => {
      console.log('Firebase disabled: confirmPasswordReset called with', oobCode);
      return true;
    }
  })
}; 