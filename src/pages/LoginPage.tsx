
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useWaslaContext } from '../lib/AppContext';
import { UserRole } from '../lib/types';

export default function LoginPage() {
  const { login } = useWaslaContext();

  const handleLogin = (role: UserRole) => {
    // In a real app, you would validate credentials here.
    login(role);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="flex items-center gap-4 mb-8">
            <img src="/wasla-logo.png" alt="Wasla Logo" className="h-16" />
            <h1 className="text-4xl font-bold text-primary">وصلة | Wasla</h1>
        </div>
      <Tabs defaultValue="passenger" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="passenger">راكب</TabsTrigger>
          <TabsTrigger value="driver">سائق</TabsTrigger>
          <TabsTrigger value="station-manager">مدير موقف</TabsTrigger>
        </TabsList>
        <TabsContent value="passenger">
          <Card>
            <CardHeader>
              <CardTitle>تسجيل دخول راكب</CardTitle>
              <CardDescription>أدخل اسمك ورقمك ورمزك للدخول إلى حسابك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" placeholder="مثال: أحمد محمود" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الموبايل</Label>
                <Input id="phone" type="tel" placeholder="01xxxxxxxxx" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">الرمز السري</Label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold" onClick={() => handleLogin('passenger')}>دخول</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="driver">
          <Card>
            <CardHeader>
              <CardTitle>تسجيل دخول سائق</CardTitle>
              <CardDescription>مرحباً بك مجدداً! أدخل بياناتك للمتابعة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driver-email">البريد الإلكتروني أو رقم الموبايل</Label>
                <Input id="driver-email" placeholder="driver@wasla.app" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-password">الرمز السري</Label>
                <Input id="driver-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold" onClick={() => handleLogin('driver')}>دخول</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="station-manager">
          <Card>
            <CardHeader>
              <CardTitle>دخول مدير الموقف</CardTitle>
              <CardDescription>الرجاء إدخال بيانات الاعتماد الخاصة بك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manager-email">البريد الإلكتروني</Label>
                <Input id="manager-email" placeholder="manager@wasla.app" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager-password">الرمز السري</Label>
                <Input id="manager-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold" onClick={() => handleLogin('station-manager')}>دخول</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
