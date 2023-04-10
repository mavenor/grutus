// A skeletal Google OAuth 2.0 component to initialise the OAuth2Client
// and handle the callback from Google

const express = require('express');
const router = express.Router();
const oauth2lib = require('@googleapis/oauth2');
const google = require('googleapis').google;
const { OrganizationsClient } = require('@google-cloud/resource-manager').v3;
require('dotenv').config();


// Initialise the OAuth2Client
const oauth2Client = new oauth2lib.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

router.get('/oauth2-callback', (req, res) => {
    if (!req.query.code) {
        res.status(400).send('No code provided!');
        if (req.query.error === 'access_denied') {
            res.status(403).send('Access denied by the user!');
            return;
        }
    }

    const code = req.query.code;
    if (code) {
        oauth2Client.getToken(code).then((tokens) => {
            // if (err) {
            //     // use morgan to log the error
            //     console.error('Error retrieving access token', err);
            //     return;
            // }
            // oauth2Client.setCredentials(tokens);
            // Successfully retrieved the access token!
            // console.log(tokens.tokens);
            // now configuring the OAuth2Client to authenticate the request
            oauth2Client.setCredentials(tokens.tokens);
            oauth2Client.on('tokens', (tokens) => {
                if (tokens.refresh_token) {
                    // store the refresh_token in my database!
                    oauth2Client.setCredentials({
                        refresh_token: tokens.refresh_token
                    });
                }
            });

            // use the token to authenticate the OrganizationsClient request
            const resourceManager = new OrganizationsClient(
                { authClient: oauth2Client }
            );
            resourceManager.searchOrganizations({
                query: 'domain:' + process.env.DOMAIN
            }).then(
                responses => {
                    var domainFound = false;
                    if (responses[0].length > 0)
                        for (const response of responses) {
                            // console.log(response);
                            if (response[0].displayName === process.env.DOMAIN) {
                                domainFound = true;
                                break;
                            }
                        }
                    if (domainFound) {
                        // The user is a member of the domain
                        // Retrieve the user's email address using OAuth2Client
                        // res.send('You are a member of ' + process.env.DOMAIN + '!');
                        console.log('You are a member of ' + process.env.DOMAIN + '!');
                        const oauth2 = google.oauth2({
                            auth: oauth2Client,
                            version: 'v2'
                        });
                        oauth2.userinfo.get((err, resss) => {
                            if (err) {
                                console.error('Error retrieving user email address: ' + err);
                                return;
                            }
                            email = resss.data?.email;
                            exports.email = email;
                            console.log('User email address: ' + email);
                            res.redirect('/webauthn-register?email=' + email);
                        });
                    } else {
                        // The user is not a member of the domain
                        res.status(403).send('Access denied! You are not a member of ' + process.env.DOMAIN + '!');
                    }
                }
            ).catch(err => console.error("Couldn't make GCP call: " + err));
        }).catch((err) => {
            // use morgan to log the error
            // res.send('Error retrieving access token:', err);
            console.error('Error retrieving access token:', err);
            return;
        });
    }

});

module.exports = router;
