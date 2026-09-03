
import { useWaslaContext } from "../lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeftRight, Users, Clock, Bus, Armchair } from "lucide-react";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

const TripCard = ({ trip }) => {
    const { vehicleNumber, origin, destination, driverName, capacity, passengers, departureTime, status } = trip;
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

        setCountdown(calculateCountdown());
        const timer = setInterval(() => setCountdown(calculateCountdown()), 1000);

        return () => clearInterval(timer);
    }, [departureTime, status]);

    const statusBadge = () => {
        switch (status) {
            case 'boarding': return <Badge variant="default" className="bg-blue-500">يتم ملء الركاب</Badge>;
            case 'ready-to-depart': return <Badge variant="default" className="bg-green-500">جاهز للإنطلاق</Badge>;
            case 'departed': return <Badge variant="secondary">على الطريق</Badge>;
            default: return <Badge variant="outline">مجدول</Badge>;
        }
    }

    return (
        <Card className="w-full max-w-sm transform transition-all hover:scale-[1.02] hover:shadow-xl">
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
            <CardContent className="grid gap-4">
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
                <Button className="w-full font-bold text-lg" disabled={availableSeats === 0 || status !== 'boarding'}>
                    اختر مقعدك واحجز الآن
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function PassengerDashboard() {
  const { trips, isLoading } = useWaslaContext();

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل الرحلات المتاحة...</div>;
  }

  const availableTrips = trips.filter(t => t.status === 'boarding' || t.status === 'scheduled');

  return (
    <div className="container py-8">
        <h2 className="text-3xl font-extrabold mb-2 text-center">اختر رحلتك</h2>
        <p className="text-muted-foreground text-center mb-8">الرحلات المتاحة حالياً على خط الفيوم ↔ بني سويف</p>
        
        {availableTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">لا توجد سيارات متاحة حاليًا.</h3>
                <p className="text-muted-foreground mt-2">يرجى المحاولة مرة أخرى في وقت لاحق.</p>
            </div>
        )}
    </div>
  );
}
