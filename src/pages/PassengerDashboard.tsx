
import { Link } from "react-router-dom";
import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeftRight, Users, Clock, Bus, Armchair, QrCode, Star } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import { differenceInSeconds, format } from "date-fns";
import { cn } from "../lib/utils";
import { Booking } from "../lib/types";

const TripCard = ({ trip }) => {
    const { id, vehicleNumber, origin, destination, driverName, capacity, passengers, departureTime, status } = trip;
    const bookedSeats = passengers.length;
    const availableSeats = capacity - bookedSeats;

    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        const calculateCountdown = () => {
            const departure = new Date(departureTime);
            const now = new Date();
            const diffSeconds = differenceInSeconds(departure, now);

            if (diffSeconds <= 0 || status !== 'boarding') {
                if (status === 'ready-to-depart') return "جاهز للإنطلاق";
                if (status === 'departed') return "انطلق بالفعل";
                return "اكتمل أو متأخر";
            }

            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const timer = setInterval(calculateCountdown, 1000);
        calculateCountdown(); // Initial call

        return () => clearInterval(timer);
    }, [departureTime, status, setCountdown]);

    const statusBadge = () => {
        switch (status) {
            case 'boarding': return <Badge variant="default" className="bg-blue-500">يتم ملء الركاب</Badge>;
            case 'ready-to-depart': return <Badge variant="default" className="bg-green-500">جاهز للإنطلاق</Badge>;
            case 'departed': return <Badge variant="secondary">على الطريق</Badge>;
            default: return <Badge variant="outline">مجدول</Badge>;
        }
    }

    const canBook = availableSeats > 0 && status === 'boarding';

    return (
        <Card className={cn("h-full flex flex-col transform transition-all hover:shadow-xl", canBook && "hover:scale-[1.02]")}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                            <Bus className="w-7 h-7 text-primary" />
                            {vehicleNumber}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                            {origin} <ArrowLeftRight className="w-4 h-4" /> {destination}
                        </CardDescription>
                    </div>
                    {statusBadge()}
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 flex-grow">
                <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <div className="font-bold text-lg text-primary">مغادرة خلال:</div>
                    <div className="font-mono text-2xl font-bold text-red-500 tracking-wider">{countdown}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> <span>السائق: {driverName}</span></div>
                    <div className="flex items-center gap-2"><Armchair className="w-4 h-4 text-muted-foreground" /> <span>المقاعد المتاحة: <span className="font-bold">{availableSeats}</span></span></div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> <span>الركاب: <span className="font-bold">{bookedSeats} / {capacity}</span></span></div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full font-bold text-lg" disabled={!canBook}>
                   <Link to={`/trip/${id}`}>اختر مقعدك واحجز الآن</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

const MyBookingCard = ({ booking }: { booking: Booking }) => {
    const { trips } = useWaslaContext();
    const trip = trips.find(t => t.id === booking.tripId);

    if (!trip) return null;

    const statusText = {
        'pending-payment': 'في انتظار الدفع',
        'confirmed': 'مؤكد',
        'cancelled': 'ملغي',
        'no-show': 'لم يحضر',
        'completed': 'مكتمل'
    }

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{trip.origin} ← {trip.destination}</span>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={cn(booking.status === 'confirmed' && 'bg-green-600')}>
                        {statusText[booking.status]}
                    </Badge>
                </CardTitle>
                <CardDescription>{format(new Date(booking.createdAt), 'PPP p', { locale: require('date-fns/locale/ar-SA') })}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <p><strong>السيارة:</strong> {trip.vehicleNumber}</p>
                    <p><strong>المقعد:</strong> {booking.seatNumber}</p>
                </div>
                <Button asChild variant="ghost" size="icon">
                    <Link to={`/booking/${booking.id}`}><QrCode className="w-6 h-6 text-primary" /></Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default function PassengerDashboard() {
  const { trips, bookings, isLoading } = useWaslaContext();

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل الرحلات المتاحة...</div>;
  }

  const availableTrips = trips.filter(t => t.status === 'boarding');
  const scheduledTrips = trips.filter(t => t.status === 'scheduled');

  return (
    <div className="container py-8">
        {bookings && bookings.length > 0 && (
            <div className="mb-12">
                <h2 className="text-3xl font-extrabold mb-4 text-center">حجوزاتي الحالية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending-payment').map(booking => (
                        <MyBookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            </div>
        )}

        <h2 className="text-3xl font-extrabold mb-2 text-center">اختر رحلتك</h2>
        <p className="text-muted-foreground text-center mb-8">الرحلات المتاحة حالياً على خط الفيوم ↔ بني سويف</p>
        
        {availableTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-800/20">
                <h3 className="text-xl font-semibold">لا توجد سيارات متاحة للحجز حاليًا.</h3>
                <p className="text-muted-foreground mt-2">يتم ملء السيارات حالياً، يرجى المحاولة مرة أخرى قريباً.</p>
            </div>
        )}

        {scheduledTrips.length > 0 && (
            <div className="mt-16">
                <h3 className="text-2xl font-bold mb-4 text-center">رحلات مجدولة قادمة</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                    {scheduledTrips.map(trip => (
                        <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
