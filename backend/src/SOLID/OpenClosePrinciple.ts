import { error } from "console";
import { number } from "zod";

public class BonusCalculator {
    public decimal Calculate(string role, decimal salary) {
        if (role == "Developer")
            return salary * 0.10m;
        else if (role == "Manager")
            return salary * 0.20m;
        else if (role == "Tester")
            return salary * 0.08m;

        throw new Exception("Invalid role");
    }
}



const DeveloperBonusPercentage = 0.10
const HRBonusPercentage = 0.15
const TesterBonusPercentage = 0.7
const ManagerBonusPercentage = 0.15
const ABCBonusPercentage = 0.20


interface IBonusCalculator {
    calculateBonus(salary:number):number;
}

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
        return salary * ABCBonusPercentage;
    }
}


class BonusService {

    constructor(
        private _bonusCalculators: Map<string, IBonusCalculator>,
    ) {}


    calculateBonus (role: string, salary: number): number {
        const calculator = this._bonusCalculators.get(role);

        if (!calculator) throw Error

        const bonus = calculator?.calculateBonus(salary);
        return bonus;
    }
}
