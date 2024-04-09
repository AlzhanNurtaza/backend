import { Context } from 'koa';
import { authenticateWithLDAP, issueJWT } from '../services/auth';

const { sanitizeEntity } = require('strapi-utils');

export default {
  async login(ctx: Context) {
    const { email, password } = ctx.request.body;



    try {
      // Attempt to authenticate against LDAP
      const isAuthenticated = await authenticateWithLDAP(email, password);
      if (!isAuthenticated) {
        return ctx.badRequest('Authentication failed.');
      }

      // Assuming LDAP authentication was successful, now check if the user exists in Strapi's database
      
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email }, populate: true });


      if (!user) {
        return ctx.notFound('User not found.'); // More specific error indicating user doesn't exist
      }
      
      

      // If user exists, issue a JWT for them
      // Use Strapi's built-in functionality to issue JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id, // Ensure you are using the user's id from your database
      });

      // Send back the JWT and sanitized user data
      ctx.body = {
        jwt,
        user: sanitizeEntity(user, { model: strapi.getModel('plugin::users-permissions.user') }),
        //sanitizeEntity(user, { model: strapi.getModel('plugin::users-permissions.user') });
      };
    } catch (error) {
      // Log the error for server-side debugging
      console.error('Login error:', error.message);

      // Determine the type of error and respond accordingly
      if (error.message === 'LDAP connection error') {
        // If the error is specifically about LDAP connection
        ctx.internalServerError('Cannot connect to authentication server.');
      } else if (error.message === 'Authentication failed') {
        // If authentication fails (wrong credentials)
        ctx.unauthorized('Incorrect username or password.');
      } else {
        // For all other types of errors
        ctx.internalServerError('An error occurred during the login process.');
      }
    }
  },
};
