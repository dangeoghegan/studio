import { PageTitle } from '@/components/page-title';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Palette, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  // Placeholder state for theme - implement with actual theme switching logic
  // const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <PageWrapper>
      <PageTitle title="Settings" subtitle="Manage your application preferences and account details." />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Settings Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-3 h-6 w-6 text-primary" /> Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <Button className="w-full">Save Profile Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-3 h-6 w-6 text-primary" /> Notifications</CardTitle>
            <CardDescription>Configure your notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive updates and alerts via email.
                </span>
              </Label>
              <Switch id="email-notifications" aria-label="Toggle email notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                <span>Push Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Get real-time alerts on your device. (Coming soon!)
                </span>
              </Label>
              <Switch id="push-notifications" disabled aria-label="Toggle push notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-3 h-6 w-6 text-primary" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Switch to a darker color scheme.
                </span>
              </Label>
              {/* Add actual theme switching logic here */}
              <Switch id="dark-mode" aria-label="Toggle dark mode" />
            </div>
            <p className="text-sm text-muted-foreground">More appearance settings coming soon!</p>
          </CardContent>
        </Card>
        
        {/* Security Settings Card - Placeholder */}
        <Card className="shadow-lg md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><ShieldCheck className="mr-3 h-6 w-6 text-primary" /> Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <Label htmlFor="password">Change Password</Label>
              <Input id="password" type="password" placeholder="New Password" />
            </div>
             <Button className="w-full" variant="outline">Update Password</Button>
             <p className="text-sm text-muted-foreground">Two-factor authentication and other security features coming soon.</p>
          </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
}
