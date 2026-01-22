// Dependency Inversion Principle
// High-level modules should not depend on low-level modules.
// Both should depend on abstractions.
// Abstractions should not depend on details.
// Details should depend on abstractions.




const DeveloperBonusPercentage = 0.10
const HRBonusPercentage = 0.15
const TesterBonusPercentage = 0.7
const ManagerBonusPercentage = 0.15
const ABCBonusPercentage = 0.20


interface IBonusCalculator {
    // ✔ “Abstractions should not depend on details.”
    // Interface contains no implementation. and not depending on details
    calculateBonus(salary:number):number;
}

// ✔ Low-level depends on abstraction (IBonusCalculator interface)
// ✔ “Details should depend on abstractions.”
// Concrete implementations (details) depend on the interface
// If IBonusCalculator changes → implementations must adapt
class DeveloperBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * DeveloperBonusPercentage;
    }
}

// ✔ Low-level depends on abstraction (IBonusCalculator interface)
class ManagerBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * ManagerBonusPercentage;
    }
}

// ✔ Low-level depends on abstraction (IBonusCalculator interface)
class TesterBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * TesterBonusPercentage;
    }
}


// ✔ Low-level depends on abstraction (IBonusCalculator interface)
class HRBonusCalculator implements IBonusCalculator {
    calculateBonus(salary: number): number {
        return salary * ABCBonusPercentage;
    }
}



class BonusService {
    constructor(
        private _bonusCalculators: Map<string, IBonusCalculator>,
    ) {}
    // BonusService is the high-level module
    // It does NOT depend on:
    // DeveloperBonusCalculator
    // ManagerBonusCalculator
    // HRBonusCalculator
    // It depends only on IBonusCalculator (abstraction with interface)
    // ✔ High-level depends on abstraction


    calculateBonus (role: string, salary: number): number {
        const calculator = this._bonusCalculators.get(role);

        if (!calculator) throw Error

        const bonus = calculator?.calculateBonus(salary);
        return bonus;
    }
}
