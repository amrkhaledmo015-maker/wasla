
import { Bell, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useWaslaContext } from "../lib/AppContext";
import { Badge } from "./ui/badge";

export function Notifications() {
  const { notifications, currentUser } = useWaslaContext();
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">الإشعارات</h4>
            <p className="text-sm text-muted-foreground">
              لديك {unreadCount} إشعارات غير مقروءة.
            </p>
          </div>
          <div className="grid gap-2">
            {userNotifications.length > 0 ? (
                userNotifications.map(n => (
                    <div key={n.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-accent">
                        {getIcon(n.type)}
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{n.message}</p>
                            <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات جديدة.</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
