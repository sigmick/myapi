const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: 'd4d70c1231b9e5bd37bfe329ca271a04d5a28cd2',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_id: '113245844172173305425',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nlqki%40cu-healthcare.iam.gserviceaccount.com',
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});


// Cloud storage
const bucket = admin.storage().bucket()

module.exports = {
  bucket
}