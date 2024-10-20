import { randomBytes } from "crypto";

/**
 * It generates a random 6 digit number
 * @returns A function that returns a random number between 100000 and 900000.
 */
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

/**
 * It creates a random token of a given size
 * @param {number} size - The size of the token in bytes.
 * @returns A random token
 */
export const createRandomToken = (size: number) => {
    const token = randomBytes(size).toString('hex');
    return token;
};

/**
 * It checks if the current time is less than expire timw
 * @param {Date} expiresIn - The time when the OTP is expected to expire.
 * @returns A boolean value indicating whether the OTP has expired or not.
 */
export const otpExpired = (expiresIn: Date): boolean => {
    const currentTimeInMillis = Date.now(); // Get current time in milliseconds
    const expiresInMillis = expiresIn.getTime(); // Convert expiresIn to milliseconds

    // Check if expiresIn has expired
    return currentTimeInMillis > expiresInMillis; // Return true if expired
};
  