// src/pages/Notifications.tsx (New: List notifications)
import { useEffect } from "react";
import useNotifications from "../../hooks/useNotifications";
import { Eye } from "lucide-react";
import { Button } from "../../components/ui/button";

const Notifications = () => {
  const { notifications, unreadCount, markRead, fetchNotifications } =
    useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications ({unreadCount})</h1>
      <div className="space-y-4">
        {notifications.map((notif: any) => (
          <div
            key={notif.id}
            className={`p-4 border rounded ${
              notif.isRead ? "bg-muted" : "bg-primary/10"
            }`}
          >
            <h3 className="font-semibold">{notif.title}</h3>
            <p>{notif.message}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(notif.createdAt).toLocaleString()}
            </p>
            {!notif.isRead && (
              <Button variant="ghost" onClick={() => markRead(notif.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
