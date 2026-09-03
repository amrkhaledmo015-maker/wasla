
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useWaslaContext } from '../lib/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingConfirmationPage() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [searchParams] = useSearchParams();
    const { bookings, trips, vehicles, currentUser } = useWaslaContext();
    const [isLoading, setIsLoading] = useState(true);

    const booking = bookings.find(b => b.id === bookingId);
    const trip = trips.find(t => t.id === booking?.tripId);
    const vehicle = vehicles.find(v => v.id === trip?.vehicleId);

    const paymentStatus = searchParams.get('status');

    useEffect(() => {
        if (booking && booking.status === 'confirmed') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [booking]);

    useEffect(() => {
        // Simulate loading to allow context to populate
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading || !booking || !trip || !vehicle || !currentUser) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ms-4 text-lg">جاري تحميل تفاصيل الحجز...</p>
            </div>
        );
    }

    const renderStatus = () => {
        if (paymentStatus === 'pending' && booking.status !== 'confirmed') {
            return (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6">
                    <div className="flex items-center">
                        <Clock className="w-6 h-6 me-3" />
                        <div>
                            <p className="font-bold">الدفع قيد المراجعة</p>
                            <p className="text-sm">سيتم تأكيد حجزك بمجرد تحقق مدير المحطة من عملية التحويل.</p>
                        </div>
                    </div>
                </div>
            );
        }
        if (booking.status === 'confirmed') {
            return (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
                    <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 me-3" />
                        <div>
                            <p className="font-bold">تم تأكيد الحجز بنجاح!</p>
                            <p className="text-sm">احتفظ برمز QR هذا لإظهاره عند الصعود.</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container py-8 max-w-2xl mx-auto">
            {renderStatus()}
            <Card className="overflow-hidden">
                <CardHeader className='bg-slate-50 dark:bg-slate-800/50 border-b'>
                    <CardTitle className="text-2xl">تأكيد الحجز</CardTitle>
                    <CardDescription>رقم الحجز الخاص بك: <span className='font-bold text-primary'>{booking.bookingCode}</span></CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="grid gap-4">
                        <InfoItem label="الراكب" value={currentUser.name} />
                        <InfoItem label="الرحلة" value={`${trip.origin} ← ${trip.destination}`} />
                        <InfoItem label="السيارة" value={vehicle.vehicleNumber} />
                        <InfoItem label="المقعد" value={booking.seatNumber.toString()} />
                        <InfoItem label="محطة الصعود" value={booking.boardingStation} />
                        <InfoItem label="موعد المغادرة" value={new Date(trip.departureTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} />
                    </div>
                    <div className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md">
                        <QRCode value={booking.bookingCode} size={200} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between border-b pb-2">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-semibold">{value}</span>
    </div>
);
