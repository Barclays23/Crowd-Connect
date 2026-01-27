// Open Close Principle

// The Open-Closed Principle is one of the five SOLID principles of object-oriented design.
// It states that software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification.

// Open for extension: 
    // You can add new behavior to the system (like adding a "Designer" or "Executive" bonus).

// Closed for modification: 
    // You can add that new behavior without changing the existing, tested source code of the main service.


// -------------------------------------------- QUESTION 1 ------------------------------------
class BonusCalculator {
  calculate(role: string, salary: number): number {
    if (role === "Developer") {
      return salary * 0.10;
    } else if (role === "Manager") {
      return salary * 0.20;
    } else if (role === "Tester") {
      return salary * 0.08;
    }

    throw new Error("Invalid role");
  }
}




// ----------------------------- ANSWER 1 -----------------------------------
interface IBonusCalculator {
    calculateBonus(salary:number):number;
}



const TesterBonusPercentage = 0.08
const DeveloperBonusPercentage = 0.10
const ManagerBonusPercentage = 0.20
const HRBonusPercentage = 0.15
const ABCBonusPercentage = 0.20

// The "Open" Part (Extension) using Polymorphism.
// If you need a new bonus type tomorrow, you simply create a new class.
// You aren't "breaking into" an existing function to add logic;
// you are extending the system by adding new blocks.
class DeveloperBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * DeveloperBonusPercentage;
    }
}

class ManagerBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * ManagerBonusPercentage;
    }
}

class TesterBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * TesterBonusPercentage;
    }
}


class HRBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * HRBonusPercentage;
    }
}




// The "Closed" Part (Modification)
// The BonusService is now Closed for Modification. 
// Notice that it doesn't care how many roles exist or how their math works. 
// It only cares that whatever it gets from the Map follows the IBonusCalculator interface.
// You could add 100 new roles, and you would never have to change a single line of code inside BonusService again.
class BonusService {
    constructor(
        private _bonusCalculators: Map<string, IBonusCalculator>,
    ) {}


    getBonus (role: string, salary: number): number {
        const calculator = this._bonusCalculators.get(role);

        if (!calculator) throw new Error(`No calculator registered for role: ${role}`)

        const bonus = calculator.calculateBonus(salary);
        return bonus;
    }
}


// Polymorphism is the "engine" that makes the Open-Closed Principle work in Object-Oriented Programming.
// Polymorphism means: "One Name, Many Forms".
// Think of it as "One Interface, Many Behaviors."


// ===============================================================================




// -------------------------------------------- QUESTION 2 ------------------------------------
class NotificationService0 {
    send(message: string, type: string) {
        if (type === "Email") {
            console.log(`Sending Email: ${message}`);
        } else if (type === "SMS") {
            console.log(`Sending SMS: ${message}`);
        } else if (type === "Push") {
            console.log(`Sending Push Notification: ${message}`);
        }
    }
}



// ----------------------------- ANSWER 1 -----------------------------------
interface INotificationService {
    send(message: string): string;
}

class EmailNotification implements INotificationService {
    constructor() {}

    send(message: string): string {
        return message;
    }
}

class SMSNotification implements INotificationService {
    constructor() {}

    send(message: string): string {
        return message;
    }
}

class PushNotification implements INotificationService {
    constructor() {}

    send(message: string): string {
        return message;
    }
}



class NotificationService1 {
    constructor(
        private _notificationServices: Map<string, INotificationService>
    ){}

    sendMessage(message: string, type: string): string {
        const messenger = this._notificationServices.get(type);

        if (!messenger) throw new Error('error message');

        return messenger?.send(message);
    }
}
