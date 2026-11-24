self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Ta-da!";
  const options = {
    body: data.body || "Time to log your wins for today!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
