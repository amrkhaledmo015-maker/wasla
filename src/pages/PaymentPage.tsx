
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWaslaContext } from "../lib/AppContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { PaymentMethod } from "../lib/types";

export default function PaymentPage() {
    const { bookingId, paymentId } = useParams<{ bookingId: string, paymentId: string }>();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vodafone-cash");
    const [walletNumber, setWalletNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!bookingId || !paymentId) {
        return <div className="p-8 text-center text-red-500">معرف الحجز أو الدفع غير موجود.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (walletNumber.length < 11) {
            setError("الرجاء إدخال رقم محفظة صحيح (11 رقمًا).");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await api.submitPayment(paymentId, paymentMethod, walletNumber);
            if ('error' in result) {
                throw new Error(result.error);
            }
            // On success, navigate to a confirmation page.
            // For now, the manager has to approve. We'll show a pending message.
            navigate(`/booking/${bookingId}?status=pending`);
        } catch (e: any) {
            setError(e.message || "حدث خطأ أثناء إرسال الدفع.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">إتمام عملية الدفع</CardTitle>
                    <CardDescription>لإتمام حجزك، يرجى تحويل مبلغ 50 جنيهًا إلى الرقم التالي ثم تأكيد الدفع.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-primary/10 border-2 border-primary/30 text-primary rounded-lg p-6 text-center mb-6">
                        <Label className="text-lg">رقم التحويل</Label>
                        <p className="text-4xl font-bold tracking-widest mt-2">01127626536</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">اختر شركة المحمول</Label>
                            <Select dir="rtl" value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue placeholder="اختر شركة المحمول" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vodafone-cash">فودافون كاش</SelectItem>
                                    <SelectItem value="etisalat-cash">اتصالات كاش</SelectItem>
                                    <SelectItem value="orange-cash">أورانج كاش</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="walletNumber">رقم محفظتك الذي تم التحويل منه</Label>
                            <Input 
                                id="walletNumber" 
                                type="tel" 
                                placeholder="01xxxxxxxxx" 
                                value={walletNumber}
                                onChange={(e) => setWalletNumber(e.target.value)}
                                required
                                minLength={11}
                                maxLength={11}
                            />
                        </div>

                        <Button type="submit" size="lg" disabled={isSubmitting} className="font-bold">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الدفع"}
                        </Button>

                        {error && (
                            <p className="text-sm text-red-500 text-center flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </p>
                        )}

                        <p className="text-xs text-muted-foreground text-center">بمجرد تأكيد الدفع، سيقوم مدير المحطة بمراجعة التحويل وتأكيد حجزك في غضون دقائق.</p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
