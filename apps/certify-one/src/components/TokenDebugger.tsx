import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const TokenDebugger: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<{
    hasToken: boolean;
    tokenLength: number;
    appId: string | null;
    tokenPreview: string;
    isValidJWT: boolean;
    payload: any;
  } | null>(null);

  const checkToken = () => {
    const token = localStorage.getItem('nucleus-app-token');
    const appId = localStorage.getItem('nucleus-app-id');
    
    if (token) {
      try {
        // Check if it's a base64 encoded token (our new format)
        let payload = null;
        let isValidJWT = false;
        
        try {
          // Try to decode as base64
          const decoded = atob(token);
          payload = JSON.parse(decoded);
          isValidJWT = true; // For our purposes, this is valid
        } catch (e) {
          // Fallback: check if it's a traditional JWT
          const tokenParts = token.split('.');
          isValidJWT = tokenParts.length === 3;
          
          if (isValidJWT) {
            try {
              payload = JSON.parse(atob(tokenParts[1]));
            } catch (e2) {
              console.error('Failed to decode payload:', e2);
            }
          }
        }
        
        setTokenInfo({
          hasToken: true,
          tokenLength: token.length,
          appId,
          tokenPreview: token.substring(0, 50) + '...',
          isValidJWT,
          payload
        });
      } catch (error) {
        setTokenInfo({
          hasToken: true,
          tokenLength: token.length,
          appId,
          tokenPreview: token.substring(0, 50) + '...',
          isValidJWT: false,
          payload: null
        });
      }
    } else {
      setTokenInfo({
        hasToken: false,
        tokenLength: 0,
        appId: null,
        tokenPreview: 'none',
        isValidJWT: false,
        payload: null
      });
    }
  };

  useEffect(() => {
    checkToken();
    // Check every 2 seconds
    const interval = setInterval(checkToken, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Token Debugger
          <Button size="sm" onClick={checkToken}>Refresh</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span>Token:</span>
          <Badge variant={tokenInfo.hasToken ? "default" : "destructive"}>
            {tokenInfo.hasToken ? "Present" : "Missing"}
          </Badge>
        </div>
        
        {tokenInfo.hasToken && (
          <>
            <div className="text-sm">
              <strong>Length:</strong> {tokenInfo.tokenLength}
            </div>
            <div className="text-sm">
              <strong>App ID:</strong> {tokenInfo.appId || 'none'}
            </div>
            <div className="text-sm">
              <strong>Preview:</strong> {tokenInfo.tokenPreview}
            </div>
            <div className="flex items-center gap-2">
              <span>JWT Format:</span>
              <Badge variant={tokenInfo.isValidJWT ? "default" : "destructive"}>
                {tokenInfo.isValidJWT ? "Valid" : "Invalid"}
              </Badge>
            </div>
            
            {tokenInfo.payload && (
              <div className="text-sm">
                <strong>Payload:</strong>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(tokenInfo.payload, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

