import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FileText, Mic, QrCode, Fingerprint, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type TemplateCategory = 'text' | 'audio';
type TextTemplate = 'common' | 'unique';

const MerchantLanding = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<TemplateCategory>('text');
  const [textTemplate, setTextTemplate] = useState<TextTemplate>('common');

  const handleContinue = () => {
    if (category === 'text') {
      if (textTemplate === 'common') {
        navigate('/order/merchant/common');
      } else {
        navigate('/order/merchant/unique');
      }
    } else {
      navigate('/order/merchant/common');
    }
  };

  return (
    <div className="min-h-[100svh] bg-background">
      
      {/* Main Content */}
      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Select Template Type</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you want to input order details
          </p>
        </div>

        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as TemplateCategory)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Text Input
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-2">
              <Mic className="h-4 w-4" />
              Audio Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">QR Code Type</CardTitle>
                <CardDescription>
                  Select the type of QR code you're using
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={textTemplate}
                  onValueChange={(v) => setTextTemplate(v as TextTemplate)}
                  className="gap-4"
                >
                  <div 
                    className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setTextTemplate('common')}
                  >
                    <RadioGroupItem value="common" id="common" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="common" className="flex items-center gap-2 cursor-pointer font-medium">
                        <QrCode className="h-4 w-4 text-merchant" />
                        Common QR Code
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Scan any QR code or manually enter the order ID to create or update orders.
                      </p>
                    </div>
                  </div>

                  <div 
                    className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setTextTemplate('unique')}
                  >
                    <RadioGroupItem value="unique" id="unique" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="unique" className="flex items-center gap-2 cursor-pointer font-medium">
                        <Fingerprint className="h-4 w-4 text-merchant" />
                        Unique QR Code
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Scan a unique encrypted QR code. The order ID will be automatically extracted and decrypted.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="flex-1 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Audio Input</CardTitle>
                <CardDescription>
                  Record voice notes for order details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <Mic className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 bg-background pt-2 pb-4 -mx-4 px-4 mt-auto">
          <Button
            size="lg"
            className="w-full gradient-merchant text-merchant-foreground font-semibold"
            onClick={handleContinue}
            disabled={category === 'audio'}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MerchantLanding;