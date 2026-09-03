
import { cn } from "../lib/utils";
import { Armchair, User, X } from "lucide-react";
import { Seat, SeatStatus } from "../lib/types";

interface SeatProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seatNumber: number) => void;
}

const SeatComponent = ({ seat, isSelected, onSelect }: SeatProps) => {
  const { seatNumber, status } = seat;

  const isAvailable = status === "available";
  const isOccupied = status === "occupied";

  const handleClick = () => {
    if (isAvailable) {
      onSelect(seatNumber);
    }
  };

  const seatIcon = () => {
    if (isOccupied) return <User className="w-5 h-5" />;
    if (isSelected) return <Armchair className="w-5 h-5" />;
    return <Armchair className="w-5 h-5" />;
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "relative flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all duration-200 font-bold",
        {
          "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary": isAvailable && !isSelected,
          "bg-primary border-primary text-white shadow-lg scale-110": isSelected,
          "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed": isOccupied,
        }
      )}
    >
      {seatIcon()}
      <span className="text-xs mt-1">{seatNumber}</span>
      {isOccupied && <X className="absolute w-10 h-10 text-slate-400 dark:text-slate-600 opacity-50" />}
    </button>
  );
};


interface SeatMapProps {
    seats: Seat[];
    selectedSeat: number | null;
    onSeatSelect: (seatNumber: number) => void;
    capacity: number;
}

export const SeatMap = ({ seats, selectedSeat, onSeatSelect, capacity }: SeatMapProps) => {
    // Typical 14-seater layout: 1 (next to driver), 3, 3, 3, 4
    const layout = {
        rows: [
            [1, 2, 3, 4],
            [5, 6, 7],
            [8, 9, 10],
            [11, 12, 13, 14]
        ],
        driver: 0
    };

    const renderRow = (rowSeats: number[]) => (
        <div className="flex justify-center gap-2">
            {rowSeats.map(seatNum => {
                const seat = seats.find(s => s.seatNumber === seatNum);
                return seat ? (
                    <SeatComponent
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat === seat.seatNumber}
                        onSelect={onSeatSelect}
                    />
                ) : null;
            })}
        </div>
    );

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 w-full max-w-md mx-auto">
            <div className="flex flex-col gap-2">
                {/* Driver seat */}
                <div className="flex justify-start mb-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M5 12H3"/><path d="M21 12h-2"/><path d="M12 12v9"/><path d="M12 5v-2"/><circle cx="12" cy="12" r="2"/><path d="M12 12a4.5 4.5 0 0 0 4.5 4.5h0a4.5 4.5 0 0 0 4.5-4.5v-4.5A4.5 4.5 0 0 0 16.5 3h0A4.5 4.5 0 0 0 12 7.5v0Z"/></svg>
                        <span className="text-xs mt-1">السائق</span>
                    </div>
                </div>

                {/* Seats layout */}
                <div className="flex flex-col items-center gap-4">
                    {renderRow(layout.rows[0])}
                    <div className="w-full h-2"></div> {/* Aisle */}
                    {renderRow(layout.rows[1])}
                    <div className="w-full h-2"></div> {/* Aisle */}
                    {renderRow(layout.rows[2])}
                    <div className="w-full h-2"></div> {/* Aisle */}
                    {renderRow(layout.rows[3])}
                </div>
            </div>
        </div>
    );
};
