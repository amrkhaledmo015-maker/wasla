
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useWaslaContext } from "../lib/AppContext";
import { SeatMap } from "../components/SeatMap";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { EnrichedTrip, Seat } from "../lib/types";

type TripDetails = EnrichedTrip & { seats: Seat[] };

export default function SeatSelectionPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { createBooking, currentUser } = useWaslaContext();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    const fetchTrip = async () => {
      setIsLoading(true);
      try {
        const tripData = await api.getTripById(tripId);
        setTrip(tripData);
      } catch (e) {
        setError("حدث خطأ أثناء تحميل بيانات الرحلة.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeat(seatNumber === selectedSeat ? null : seatNumber);
  };

  const handleBooking = async () => {
    if (!tripId || !selectedSeat || !currentUser) return;
    setIsBooking(true);
    setError(null);
    try {
      const { booking, payment } = await createBooking(tripId, selectedSeat);
      // Redirect to the payment page with booking and payment IDs
      navigate(`/payment/${booking.id}/${payment.id}`);
    } catch (e: any) {
      setError(e.message || "فشل حجز المقعد. قد يكون محجوزاً بالفعل.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ms-4 text-lg">جاري تحميل خريطة المقاعد...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        لم يتم العثور على الرحلة.
      </div>
    );
  }

  return (
    <div className="container py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-semibold text-primary hover:underline">
        <ArrowRight className="w-4 h-4" />
        العودة إلى قائمة الرحلات
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">اختر مقعدك في الميكروباص</CardTitle>
                    <CardDescription>اختر مقعدًا متاحًا للمتابعة إلى الدفع.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SeatMap
                        seats={trip.seats}
                        selectedSeat={selectedSeat}
                        onSeatSelect={handleSeatSelect}
                        capacity={trip.capacity}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>ملخص الحجز</CardTitle>
              <CardDescription>تأكد من تفاصيل رحلتك قبل المتابعة.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرحلة:</span>
                <span className="font-semibold">{trip.origin} ← {trip.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">السيارة:</span>
                <span className="font-semibold">{trip.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المقعد المختار:</span>
                {selectedSeat ? (
                  <span className="font-bold text-primary text-lg">{selectedSeat}</span>
                ) : (
                  <span className="text-sm text-red-500">اختر مقعداً</span>
                )}
              </div>
              <div className="flex justify-between items-center border-t pt-4 mt-2">
                <span className="text-muted-foreground">الإجمالي:</span>
                <span className="text-2xl font-bold text-primary">50 جنيهًا</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2">
              <Button
                size="lg"
                className="w-full font-bold"
                disabled={!selectedSeat || isBooking}
                onClick={handleBooking}
              >
                {isBooking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "تأكيد الحجز والمتابعة للدفع"
                )}
              </Button>
              {error && (
                <p className="text-sm text-red-500 text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
