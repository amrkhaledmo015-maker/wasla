
import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Bus, Clock, Users, Check, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { cn } from "../lib/utils";

import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Bus, Clock, Users, Check, UserCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { cn } from "../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const PassengerList = ({ trip }) => {
    const { updatePassengerStatus, cancelBooking } = useWaslaContext();

    const handleStatusUpdate = (bookingId: string, status: "arrived" | "boarded") => {
        updatePassengerStatus(trip.id, bookingId, status);
    };

    const handleCancel = (bookingId: string) => {
        // In a real app, you'd provide a reason.
        cancelBooking(bookingId, "no-show");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'reserved':
                return <Badge variant="outline">محجوز</Badge>;
            case 'arrived':
                return <Badge className="bg-blue-500 text-white">وصل للمحطة</Badge>;
            case 'boarded':
                return <Badge className="bg-green-500 text-white">صعد للسيارة</Badge>;
            case 'no-show':
                return <Badge variant="destructive">لم يحضر</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>المقعد</TableHead>
                    <TableHead>اسم الراكب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراء</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...trip.passengers].sort((a, b) => a.seatNumber - b.seatNumber).map(p => (
                    <TableRow key={p.bookingId}>
                        <TableCell className="font-bold text-lg">{p.seatNumber}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={p.status !== 'reserved'}
                                onClick={() => handleStatusUpdate(p.bookingId, 'arrived')}
                            >
                                <Check className="w-4 h-4 ms-1" />
                                وصل
                            </Button>
                            <Button
                                size="sm"
                                disabled={p.status === 'boarded'}
                                onClick={() => handleStatusUpdate(p.bookingId, 'boarded')}
                            >
                                <UserCheck className="w-4 h-4 ms-1" />
                                صعد
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" disabled={p.status === 'boarded' || p.status === 'no-show'}>
                                    <XCircle className="w-4 h-4 ms-1" />
                                    إلغاء
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد من إلغاء حجز هذا الراكب؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    سيتم تحديد هذا الراكب على أنه "لم يحضر"، وسيتم إتاحة مقعده للحجز مرة أخرى. ستبدأ عملية استرداد المبلغ المدفوع.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>تراجع</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancel(p.bookingId)}>نعم، قم بالإلغاء</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function DriverDashboard() {
    const { currentUser, trips, drivers } = useWaslaContext();
    const [countdown, setCountdown] = useState("");

    const driver = drivers.find(d => d.userId === currentUser?.id);
    const assignedTrip = trips.find(t => t.driverName === currentUser?.name); // Simplified logic for demo

    useEffect(() => {
        if (!assignedTrip) return;

        const calculateCountdown = () => {
            const departure = new Date(assignedTrip.departureTime);
            const now = new Date();
            const diffSeconds = differenceInSeconds(departure, now);

            if (diffSeconds <= 0) {
                return "انتهى الوقت";
            }

            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const timer = setInterval(calculateCountdown, 1000);
        calculateCountdown();

        return () => clearInterval(timer);
    }, [assignedTrip, setCountdown]);

    if (!assignedTrip) {
        return <div className="p-8 text-center">ليس لديك رحلات معينة حالياً.</div>;
    }

    const booked = assignedTrip.passengers.length;
    const arrived = assignedTrip.passengers.filter(p => p.status === 'arrived' || p.status === 'boarded').length;
    const boarded = assignedTrip.passengers.filter(p => p.status === 'boarded').length;

    return (
        <div className="container py-8">
            <h2 className="text-3xl font-extrabold mb-6">لوحة تحكم السائق</h2>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl">رحلتك الحالية</CardTitle>
                    <CardDescription>{assignedTrip.origin} ← {assignedTrip.destination}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-muted-foreground">السيارة</p>
                        <p className="text-lg font-bold flex items-center gap-2"><Bus className="w-5 h-5 text-primary" /> {assignedTrip.vehicleNumber}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-muted-foreground">مغادرة خلال</p>
                        <p className="text-lg font-bold font-mono text-red-500"><Clock className="w-5 h-5 inline-block me-2" />{countdown}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-muted-foreground">الركاب</p>
                        <p className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> {booked} / {assignedTrip.capacity}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-muted-foreground">صعد للسيارة</p>
                        <p className="text-lg font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-green-500" /> {boarded} / {booked}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الركاب</CardTitle>
                    <CardDescription>قم بتحديث حالة الركاب عند وصولهم وصعودهم للسيارة.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PassengerList trip={assignedTrip} />
                </CardContent>
            </Card>
        </div>
    );
}
