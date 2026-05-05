// backend/src/utils/transaction.utils.ts

import mongoose, { ClientSession } from "mongoose";

/**
 * Executes a MongoDB transaction with automatic retries for transient write conflicts.
 * * @param operation - The database operations to execute within the transaction session.
 * @param maxRetries - Maximum number of retry attempts (default: 3).
 * @returns The result of the operation.
 */
export async function executeWithTransactionRetry<T>(
    operation: (session: ClientSession) => Promise<T>, 
    maxRetries = 3
): Promise<T> {
    let attempt = 1;

    while (true) {
        // Create session directly from the global mongoose connection
        const session = await mongoose.connection.startSession();
        session.startTransaction();

        try {
            const result = await operation(session);
            await session.commitTransaction();
            
            return result; // Exit loop and return result on success
            
        } catch (error: any) {
            await session.abortTransaction();
                
            // Check if MongoDB tells us this is a temporary conflict
            const isTransient = error.errorLabels && error.errorLabels.includes('TransientTransactionError');
            
            if (isTransient && attempt <= maxRetries) {
                console.warn(`[DB Write Conflict] Retrying transaction... (Attempt ${attempt} of ${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 250 * attempt)); // Exponential backoff
                attempt++;
            } else {
                throw error; // Throw if it's a real error (e.g., validation) or out of retries
            }
        } finally {
            session.endSession();
        }
    }
}