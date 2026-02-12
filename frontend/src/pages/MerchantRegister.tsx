import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Store, Phone, MapPin, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

const MerchantRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPhone = searchParams.get('phone') || '';

  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: prefillPhone,
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const isFormValid =
    formData.businessName.trim().length > 0 &&
    formData.phoneNumber.length === 10 &&
    formData.address.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const result = await adminAPI.registerMerchant({
        businessName: formData.businessName.trim(),
        phoneNumber: formData.phoneNumber,
        address: formData.address.trim(),
      });

      if (result.success) {
        setIsSuccess(true);
        // Store merchant info for prefilling
        sessionStorage.setItem('businessName', formData.businessName.trim());
        sessionStorage.setItem('merchantPhone', formData.phoneNumber);
        sessionStorage.setItem('merchantAddress', formData.address.trim());

        toast({
          title: 'Registration Successful',
          description: 'Welcome! Redirecting to order creation...',
        });

        setTimeout(() => {
          navigate('/order/merchant/templates');
        }, 1500);
      } else {
        toast({
          title: 'Registration Failed',
          description: result.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'Unable to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[100svh] bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-merchant/10">
              <CheckCircle className="h-8 w-8 text-merchant" />
            </div>
            <h2 className="text-xl font-bold">Registration Successful!</h2>
            <p className="text-sm text-muted-foreground">
              Redirecting you to start creating orders...
            </p>
            <div className="w-8 h-8 border-4 border-merchant border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-background">
      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col gap-6 px-4 py-6">
        <div className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-merchant/10">
            <Store className="h-8 w-8 text-merchant" />
          </div>
          <h1 className="text-2xl font-bold">New Merchant Registration</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your business details to get started
          </p>
        </div>

        <Card className="flex-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Business Details</CardTitle>
            <CardDescription>
              Fill in your information to register as a merchant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                    className="pl-10"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter 10-digit number"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your full business address"
                    className="pl-10 min-h-[80px]"
                    maxLength={500}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-merchant text-merchant-foreground font-semibold mt-6"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MerchantRegister;