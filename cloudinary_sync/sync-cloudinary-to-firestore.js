// sync-cloudinary-to-firestore.js
const cloudinary = require('cloudinary').v2;
const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account key JSON
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});
const db = admin.firestore();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'shutrzzz',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET', // Keep private!
});

async function syncCloudinaryToFirestore() {
  try {
    const result = await cloudinary.api.resources({max_results: 500});

    for (const resource of result.resources) {
      const docId = resource.public_id;
      const imageUrl = resource.secure_url;
      const createdAt = new Date(resource.created_at);

      await db.collection('carouselImages').doc(docId).set({
        url: imageUrl,
        title: resource.public_id,
        order: 1,
        createdAt,
      });

      console.log(`Uploaded ${resource.public_id} to Firestore`);
    }

    console.log('Sync complete!');
  } catch (error) {
    console.error('Error syncing Cloudinary images:', error);
  }
}

syncCloudinaryToFirestore();
