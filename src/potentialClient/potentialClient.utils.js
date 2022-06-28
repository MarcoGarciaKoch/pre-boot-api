import crypto from 'crypto';

// Create a key for encrypting
const salt = 'client_registration_salt';

/**
 * This function encrypts the received password as a parameter and returns it encrypted
 */

 export const encodePassword = (pass) => {
    //We use the crypto library to encrypt the pass using 1000 iterations.
    return crypto.pbkdf2Sync(pass, salt,1000, 64, `sha512`).toString(`hex`);
}