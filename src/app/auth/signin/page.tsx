'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

declare global {
  interface Window {
    google: any;
    googleAuth: any;
    gapi: any;
  }
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';

  useEffect(() => {
    // Check if this is a Telegram Mini App and auto-redirect
    if (typeof window !== 'undefined') {
      const isTelegramMiniApp = window.Telegram?.WebApp ||
        window.location.href.includes('telegram') ||
        window.location.href.includes('t.me') ||
        document.referrer.includes('telegram') ||
        document.referrer.includes('t.me') ||
        window.location.search.includes('tg');

      if (isTelegramMiniApp) {
        console.log("🔍 Detected Telegram Mini App on signin page, redirecting to dashboard");
        window.location.href = '/dashboard';
        return;
      }
    }

    // Initialize Google Sign-In
    if (typeof window !== 'undefined') {
      const initGoogleSignIn = () => {
        if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            use_fedcm_for_prompt: false,
          });

          setGoogleReady(true);
        }
      };

      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleSignIn;
        document.head.appendChild(script);
      } else {
        initGoogleSignIn();
      }
    }
  }, []);

  const checkEnvironment = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }
    console.log('Google Client ID found:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  };

  const loadGoogleScript = () => {
    // Load Google Identity Services script (modern API)
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleAuth();
    };

    script.onerror = () => {
      setError('Failed to load Google authentication. Please check your internet connection.');
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  };

  const initializeGoogleAuth = () => {
    if (!window.google) {
      setError('Google Identity Services not loaded');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setGoogleReady(true);
      console.log('✅ Google Identity Services initialized');
    } catch (error) {
      console.error('❌ Google initialization error:', error);
      setError('Failed to initialize Google authentication');
    }
  };

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Google callback response:', response);

      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user info
      const decoded = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('Decoded Google user:', decoded);

      const userInfo = {
        id: decoded.sub,
        email: decoded.email,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        picture: decoded.picture,
        name: decoded.name,
      };

      // Send to our auth endpoint
      const authResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleUser: userInfo,
        }),
      });

      const result = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      console.log('✅ Auth successful:', result);
      
      // Store user info in localStorage for the session
      localStorage.setItem('adGenius_user', JSON.stringify(result.user));
      localStorage.setItem('adGenius_auth_method', 'google');

      // Set a cookie for middleware
      document.cookie = `adGenius_auth=true; path=/; max-age=86400`; // 24 hours

      // Redirect to dashboard or intended page
      router.push(redirectTo);

    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      setError(error.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!googleReady) {
      setError('Google authentication is not ready. Please refresh the page.');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not displayed, falling back to popup');
          // Fallback to popup if One Tap doesn't work
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
            }
          );
        }
      });
    } catch (error) {
      console.error('Error triggering Google sign-in:', error);
      setError('Failed to start Google sign-in process');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ad Genius</CardTitle>
          <CardDescription>
            AI-Powered Advertising Optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Sign in to your account</h2>
            <p className="text-sm text-gray-600 mb-6">
              Access your advertising analytics and AI insights
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || !googleReady}
              className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              variant="outline"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Signing in...
                </div>
              ) : !googleReady ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Loading Google...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </div>
              )}
            </Button>

            {/* Hidden button for Google's fallback rendering */}
            <div id="google-signin-button" className="hidden"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-gray-500">Or use Telegram</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Already using our Telegram bot?
                  </p>
                  <p className="text-xs text-blue-700">
                    You're automatically signed in when using the bot!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 border-t pt-2">
              <p>Debug: Google Ready: {googleReady ? '✅' : '❌'}</p>
              <p>Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅' : '❌'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 