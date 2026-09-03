
import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Clock, Users, Bus, AlertTriangle, UserCog, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"


const StatCard = ({ title, value, icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

import { Transition } from "@headlessui/react";

const PendingPayments = () => {
    const { payments, bookings, users, approvePayment } = useWaslaContext();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const pending = payments.filter(p => p.status === 'submitted');

    if (pending.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="mx-auto w-12 h-12 text-green-500 mb-2" />
                <p>لا توجد عمليات دفع في انتظار المراجعة.</p>
            </div>
        )
    }

    const handleApprove = async (paymentId: string) => {
        setIsSubmitting(paymentId);
        try {
            await approvePayment(paymentId);
        } catch (error) {
            console.error("Failed to approve payment:", error);
            setIsSubmitting(null);
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>رقم الحجز</TableHead>
                    <TableHead>الراكب</TableHead>
                    <TableHead>رقم المحفظة</TableHead>
                    <TableHead>الإجراء</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map(payment => {
                    const booking = bookings.find(b => b.id === payment.bookingId);
                    const user = users.find(u => u.id === booking?.passengerId);
                    const isPending = payment.status === 'submitted';

                    return (
                        <Transition
                            as={TableRow}
                            key={payment.id}
                            show={isPending}
                            leave="transition-opacity duration-500"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <TableCell className="font-mono">{booking?.bookingCode}</TableCell>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell className="font-mono text-left" dir="ltr">{payment.walletNumber}</TableCell>
                            <TableCell>
                                <Button size="sm" onClick={() => handleApprove(payment.id)} disabled={isSubmitting === payment.id}>
                                    {isSubmitting === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 ms-2" />}
                                    تأكيد الاستلام
                                </Button>
                            </TableCell>
                        </Transition>
                    )
                })}
            </TableBody>
        </Table>
    )
}

const DriverManagement = () => {
    const { drivers, users, approveDriver } = useWaslaContext();

    const getStatusBadge = (status) => {
        switch(status) {
            case 'verified': return <Badge className="bg-green-500">موثق</Badge>
            case 'pending-verification': return <Badge variant="secondary">قيد التوثيق</Badge>
            case 'rejected': return <Badge variant="destructive">مرفوض</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>اسم السائق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراء</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {drivers.map(driver => {
                    const user = users.find(u => u.id === driver.userId);
                    return (
                        <TableRow key={driver.id}>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{getStatusBadge(driver.verificationStatus)}</TableCell>
                            <TableCell className="flex gap-2">
                                {driver.verificationStatus === 'pending-verification' && (
                                    <>
                                        <Button size="sm" variant="outline" onClick={() => approveDriver(driver.id, true)}><Check className="w-4 h-4 ms-1" /> قبول</Button>
                                        <Button size="sm" variant="destructive" onClick={() => approveDriver(driver.id, false)}><X className="w-4 h-4 ms-1" /> رفض</Button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

const VehicleManagement = () => {
    const { vehicles, drivers, users, assignDriverToVehicle } = useWaslaContext();
    const availableDrivers = drivers.filter(d => d.verificationStatus === 'verified' && !vehicles.some(v => v.driverId === d.id));

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>رقم السيارة</TableHead>
                    <TableHead>السائق الحالي</TableHead>
                    <TableHead>تعيين سائق</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {vehicles.map(vehicle => {
                    const driver = drivers.find(d => d.id === vehicle.driverId);
                    const driverUser = users.find(u => u.id === driver?.userId);
                    return (
                        <TableRow key={vehicle.id}>
                            <TableCell className="font-bold">{vehicle.vehicleNumber}</TableCell>
                            <TableCell>{driverUser?.name || <span className="text-muted-foreground">غير معين</span>}</TableCell>
                            <TableCell>
                                <Select onValueChange={(driverId) => assignDriverToVehicle(driverId, vehicle.id)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="اختر سائق" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDrivers.map(d => {
                                            const u = users.find(user => user.id === d.userId);
                                            return <SelectItem key={d.id} value={d.id}>{u?.name}</SelectItem>
                                        })}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default function StationManagerDashboard() {
    const { vehicles, trips } = useWaslaContext();

    const vehiclesAtStation = vehicles.filter(v => v.status === 'at-station' || v.status === 'loading').length;
    const vehiclesEnRoute = vehicles.filter(v => v.status === 'en-route').length;
    const totalPassengers = trips.reduce((acc, trip) => acc + trip.passengers.length, 0);
    const overdueVehicles = 0; // Placeholder

    return (
        <div className="container py-8">
            <h2 className="text-3xl font-extrabold mb-6">لوحة تحكم مدير المحطة</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="السيارات في المحطة" value={vehiclesAtStation} icon={<Bus className="h-4 w-4 text-muted-foreground" />} description="سيارات جاهزة أو تملأ الركاب" />
                <StatCard title="السيارات على الطريق" value={vehiclesEnRoute} icon={<Bus className="h-4 w-4 text-muted-foreground" />} description="سيارات متجهة إلى وجهتها" />
                <StatCard title="إجمالي الركاب اليوم" value={totalPassengers} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="عدد الركاب في جميع الرحلات" />
                <StatCard title="سيارات متأخرة" value={overdueVehicles} icon={<AlertTriangle className="h-4 w-4 text-red-500" />} description="سيارات لم تصل في موعدها" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="w-6 h-6 text-primary" /> مراجعة الدفع</CardTitle>
                        <CardDescription>تأكيد استلام تحويلات المحافظ الإلكترونية.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PendingPayments />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCog className="w-6 h-6 text-primary" /> إدارة السائقين</CardTitle>
                        <CardDescription>توثيق السائقين الجدد أو رفضهم.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DriverManagement />
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bus className="w-6 h-6 text-primary" /> إدارة السيارات</CardTitle>
                        <CardDescription>تعيين سائقين للسيارات المتاحة.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VehicleManagement />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
