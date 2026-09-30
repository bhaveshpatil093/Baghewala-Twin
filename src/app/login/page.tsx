import React from 'react';
import LoginScreen from '@/src/components/auth/LoginScreen';

interface LoginPageProps {
  onLoginSuccess?: (userProfile: { name: string; desk: string; role: string; email: string }) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <LoginScreen 
      onLoginSuccess={onLoginSuccess || (() => {})} 
    />
  );
}
