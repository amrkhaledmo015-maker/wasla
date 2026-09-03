
import { UserRole } from "../lib/types";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useWaslaContext } from "../lib/AppContext";
import { Users, BusFront, Building } from "lucide-react";

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  {
    value: "passenger",
    label: "مسافر (Passenger)",
    icon: <Users className="w-4 h-4 ms-2" />,
  },
  {
    value: "driver",
    label: "سائق (Driver)",
    icon: <BusFront className="w-4 h-4 ms-2" />,
  },
  {
    value: "station-manager",
    label: "مدير محطة (Manager)",
    icon: <Building className="w-4 h-4 ms-2" />,
  },
];

export function RoleSwitcher() {
  const { currentRole, setRole, currentUser } = useWaslaContext();

  return (
    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg shadow-inner">
      <Select dir="rtl" value={currentRole} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger className="w-[220px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
          <div className="flex items-center">
            <SelectValue placeholder="Select a role" />
            {roleOptions.find(r => r.value === currentRole)?.icon}
          </div>
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {option.icon}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentUser && (
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">مرحباً, {currentUser.name}</span>
        </div>
      )}
    </div>
  );
}
