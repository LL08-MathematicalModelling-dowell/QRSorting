import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Phone, ArrowRight, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import {adminAPI } from '@/lib/api';

type VerificationState = 'input' | 'verifying' | 'not_found';

const MerchantVerify = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState<VerificationState>('input');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 10 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    // Reset state if user modifies the number after not_found
    if (state === 'not_found') {
      setState('input');
    }
  };

  const handleVerify = async () => {
    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setState('verifying');

    try {
      const result = await adminAPI.verifyMerchant(phoneNumber);
      
      if (result.success) {
        console.log("Verification result:", result);
        const businessName = result.merchantDetails[0].businessName
        const mechantAddress = result.merchantDetails[0].address
        // Merchant exists, navigate to template selection
        toast({
          title: "Verified",
          description: `Welcome back, ${businessName || 'Merchant'}!`,
        });
        // Store merchant info in sessionStorage for use in subsequent pages
        sessionStorage.setItem('merchantPhone', phoneNumber);
        if (businessName && mechantAddress) {
          sessionStorage.setItem('businessName', businessName);
          sessionStorage.setItem('merchantAddress', mechantAddress);
        }
        navigate('/order/merchant/templates');
      } else {
        // Merchant not found
        setState('not_found');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify mobile number. Please try again.",
        variant: "destructive",
      });
      setState('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to registration with the phone number
    navigate(`/order/merchant/register?phone=${phoneNumber}`);
  };

  const handleTryAnother = () => {
    setPhoneNumber('');
    setState('input');
  };

  return (
    <div className="min-h-[100svh] bg-background">
      {/* Header */}

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 gradient-merchant"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 text-merchant-foreground">
            <Package className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">DoWell Smart Labelling</h1>
              <p className="text-sm opacity-90">Order Management</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}

      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col gap-6 px-4 py-6">
        <div className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-merchant/10">
            <Phone className="h-8 w-8 text-merchant" />
          </div>
          <h1 className="text-2xl font-bold">Merchant Verification</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your registered mobile number to continue
          </p>
        </div>

        <Card className="flex-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Mobile Number</CardTitle>
            <CardDescription>
              We'll verify your registration status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {state === 'not_found' && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertDescription>
                  This mobile number is not registered. You can register as a new merchant or try a different number.
                </AlertDescription>
              </Alert>
            )}

            {state === 'not_found' ? (
              <div className="space-y-3 pt-2">
                <Button
                  size="lg"
                  className="w-full gradient-merchant text-merchant-foreground font-semibold"
                  onClick={handleRegister}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register as New Merchant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleTryAnother}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Different Number
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full gradient-merchant text-merchant-foreground font-semibold"
                onClick={handleVerify}
                disabled={phoneNumber.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MerchantVerify;