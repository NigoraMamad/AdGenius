'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleMockGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock Google user data for testing
      const mockGoogleUser = {
        id: 'test_' + Date.now(),
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://via.placeholder.com/100',
        name: 'Test User',
      };

      console.log('📧 Using mock Google user:', mockGoogleUser);

      // Send to our simplified auth endpoint (no database required)
      const response = await fetch('/api/auth/google-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleUser: mockGoogleUser,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      console.log('✅ Auth successful:', result);
      
      // Store user info in localStorage for the session
      localStorage.setItem('adGenius_user', JSON.stringify(result.user));
      localStorage.setItem('adGenius_auth_method', 'google');

      // Set a cookie for middleware
      document.cookie = `adGenius_auth=true; path=/; max-age=86400`; // 24 hours

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (error: any) {
      console.error('❌ Test sign-in error:', error);
      setError(error.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ad Genius - Test Auth</CardTitle>
          <CardDescription>
            Testing Authentication Flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Test Authentication</h2>
            <p className="text-sm text-gray-600 mb-6">
              This bypasses Google OAuth for testing purposes
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleMockGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Test User...
                </div>
              ) : (
                '🧪 Test Authentication Flow'
              )}
            </Button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Test Mode Active
                  </p>
                  <p className="text-xs text-yellow-700">
                    This creates a mock user to test the auth flow
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => router.push('/auth/signin')}
                variant="outline"
                className="text-sm"
              >
                ← Back to Real Google Auth
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              For testing purposes only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 