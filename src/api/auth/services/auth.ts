import * as ldap from 'ldapjs';
import jwt from 'jsonwebtoken';

export const authenticateWithLDAP = async (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Create LDAP client
    const client = ldap.createClient({ url: 'ldap://kmg.kz/DC=kmg,DC=kz' });

    // Handle connection errors gracefully
    client.on('error', (err) => {
      console.error('LDAP connection error client:', err);
      reject(new Error('LDAP connection error client')); // Reject the promise with a meaningful error
    });

    // Attempt to bind using the provided credentials
    client.bind(`${email}`, password, (err) => {
      // Unbind/close connection after attempt
      client.unbind();

      if (err) {
        console.error('LDAP authentication error:', err);
        // It's often a good idea to reject with a generic error message
        // to avoid giving too much information about the nature of the failure.
        reject(new Error('Authentication failed'));
      } else {
        resolve(true); // Authentication was successful
      }
    });
  });
};

export const issueJWT = async (user: any): Promise<string> => {
  return jwt.sign({ id: user.id, email: user.email }, 'MY_SECRET_KEY_STRAPI', { expiresIn: '1h' });
};
