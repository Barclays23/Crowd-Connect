// Liskov Substitution Principle



// The Violation (Breaking the Principle)

interface Notification2 {
  send(message: string, target: string): void;
}

class EmailNotification2 implements Notification2 {
  send(message: string, target: string): void {
    console.log(`Sending Email to ${target}: ${message}`);
  }
}

class InAppNotification2 implements Notification2 {
  send(message: string, target: string): void {
    // BUG: In-app notifications don't use an email/phone number. 
    // They are tied to a User ID internally. 
    // The 'target' parameter is useless or misleading here.
    if (!target) throw new Error("Target required!"); 
    console.log(`Displaying alert for user: ${message}`);
  }
}




// ===============================================================




// Define a base with the absolute bare minimum shared logic
interface IAppNotification {
  send(message: string, address?: string): void;
}

// Sub-interface for notifications that require an external address
interface ExternalNotification extends IAppNotification {
  send(message: string, address: string): void;
}


class EmailService implements ExternalNotification {
  send(message: string, address: string): void {
    console.log(`Email sent to ${address}: ${message}`);
  }
}


class InAppService implements IAppNotification {
  // This only needs the message because the 'target' is handled by the session
  send(message: string): void {
    console.log(`App alert: ${message}`);
  }
}


// Usage
const notifyUser = (service: IAppNotification, msg: string) => {
  service.send(msg); // This is safe for ANY notification
};