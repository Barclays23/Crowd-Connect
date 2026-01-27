// Interface Segragation Principle

// The "Don't Force Me" Principle.


// -------------------------------------------- QUESTION 1 ------------------------------------
interface PaymentProcessor0 {
    processPayment(amount: number): void;
    refund(amount: number): void;
    checkBalance(): void;
}

class CreditCardProcessor0 implements PaymentProcessor0 {
    processPayment(amount: number) { /* logic */ }
    refund(amount: number) { /* logic */ }
    checkBalance() { /* logic */ }
}

class GiftCardProcessor0 implements PaymentProcessor0 {
    processPayment(amount: number) { /* logic */ }
    refund(amount: number) { 
        throw new Error("Gift cards cannot be refunded!"); 
    }
    checkBalance() { /* logic */ }
}


// Problem: Violating ISP
// A Payment interface that forces a Gift Card to have a Refund button
// (Gift cards usually can't be refunded).


// Solution: 
// Create a Payable interface and a Refundable interface. 
// The Credit Card takes both. 
// The Gift Card only takes Payable.




// -------------------------------------------- ANSWER 1 ------------------------------------
interface IPayable {
    processPayment(amount: number): void;
}
interface IRefundable {
    processRefund(amount: number): void;
}
interface ICheckable {
    checkBalance(): number;
}


// Credit Cards can do everything
class CreditCardProcessor1 implements IPayable, IRefundable, ICheckable {
    processPayment(amount: number) { /* logic */ }
    processRefund(amount: number) { /* logic */ }
    checkBalance():number { /* logic */ return 500; }
}

// Gift Cards can only pay and check balance
class GiftCardProcessor1 implements IPayable, ICheckable {
    processPayment(amount: number) { /* logic */ }
    checkBalance():number { /* logic */ return 500; }
}



class CheckoutService {
    constructor(private _paymentProvider: IPayable) {}

    completePurchase (amount: number){
        this._paymentProvider.processPayment(amount);
    }
}


class CustomerService {
    constructor(private _refundProvider: IRefundable) {}

    issueRefund (amount: number) {
        this._refundProvider.processRefund(amount);
    }
}

class BalanceService {
    constructor(private _balanceProvider: ICheckable) {}

    checkBalance (): number {
        const balance = this._balanceProvider.checkBalance();
        return balance;
    }
}