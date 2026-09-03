
import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Clock, Users, Bus, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

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

const PendingPayments = () => {
    const { payments, bookings, users, approvePayment } = useWaslaContext();
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
        try {
            await approvePayment(paymentId);
            // Optionally add a success toast/notification here
        } catch (error) {
            // Optionally add an error toast/notification here
            console.error("Failed to approve payment:", error);
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>رقم الحجز</TableHead>
                    <TableHead>الراكب</TableHead>
                    <TableHead>رقم المحفظة</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الإجراء</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pending.map(payment => {
                    const booking = bookings.find(b => b.id === payment.bookingId);
                    const user = users.find(u => u.id === booking?.passengerId);
                    return (
                        <TableRow key={payment.id}>
                            <TableCell className="font-mono">{booking?.bookingCode}</TableCell>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell className="font-mono text-left" dir="ltr">{payment.walletNumber}</TableCell>
                            <TableCell>{new Date(payment.createdAt).toLocaleTimeString('ar-EG')}</TableCell>
                            <TableCell>
                                <Button size="sm" onClick={() => handleApprove(payment.id)}>
                                    <CheckCircle className="w-4 h-4 ms-2" />
                                    تأكيد الاستلام
                                </Button>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        مراجعة عمليات الدفع المعلقة
                    </CardTitle>
                    <CardDescription>تأكيد استلام تحويلات المحافظ الإلكترونية لتأكيد حجوزات الركاب.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PendingPayments />
                </CardContent>
            </Card>
        </div>
    )
}
