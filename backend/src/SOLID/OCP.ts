public class LoanInterestCalculator
{
    public double Calculate(string loanType, double amount)
    {
        if (loanType == "Home")
            return amount * 0.07;
        else if (loanType == "Car")
            return amount * 0.09;
        else if (loanType == "Personal")
            return amount * 0.12;
        else
            return 0;
    }
}


interface ILoanCalculator {
    calculate (amount: number): number;
}


class HomeLoanCalculator implements ILoanCalculator {
    constructor() {
        
    }

    calculate(amount: number): number {
        return amount * 0.07;
    }
}


class CarLoanCalculator implements ILoanCalculator {
    constructor() {
        
    }

    calculate(amount: number): number {
        return amount * 0.07;
    }
}


class PersonalLoanCalculator implements ILoanCalculator {
    constructor() {
        
    }

    calculate(amount: number): number {
        return amount * 0.07;
    }
}



class LoanServices {
    constructor(private _loanCalculators: Map<string, ILoanCalculator>) {
        
    }

    calculateLoan (loanType: string): number {
        const calculator = this._loanCalculators.get(loanType);

        const loanAmount = calculator?.calculate();

        return loanAmount;

    }
}



// factory pattern and strategy pattern