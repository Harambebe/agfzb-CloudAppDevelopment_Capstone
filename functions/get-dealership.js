    const express = require('express');
    const app = express();
    const port = process.env.PORT || 3000;
    const Cloudant = require('@cloudant/cloudant');
    // Initialize Cloudant connection with IAM authentication
    async function dbCloudantConnect() {
        try {
            const cloudant = Cloudant({
                plugins: { iamauth: { iamApiKey: 'K5sdke3D6rykobmaoFnaxZDrchcPVTv565sXZmnr5crl' } }, // Replace with your IAM API key
                url: 'https://487140ad-b943-47b8-8c78-87a716814ab7-bluemix.cloudantnosqldb.appdomain.cloud', // Replace with your Cloudant URL
            });
            const db = cloudant.use('dealerships');
            console.info('Connect success! Connected to DB');
            return db;
        } catch (err) {
            console.error('Connect failure: ' + err.message + ' for Cloudant DB');
            throw err;
        }
    }
    let db;
    (async () => {
        db = await dbCloudantConnect();
    })();
    app.use(express.json());
    // Define a route to get all dealerships with optional state and ID filters
    app.get('/dealerships/get', (req, res) => {
        const { state, id } = req.query;
        // Create a selector object based on query parameters
        const selector = {};
        if (state) {
            selector.state = state;
        }
        
        if (id) {
            selector.id = parseInt(id); // Filter by "id" with a value of 1
        }
        const queryOptions = {
            selector,
            limit: 10, // Limit the number of documents returned to 10
        };
        db.find(queryOptions, (err, body) => {
            if (err) {
                console.error('Error fetching dealerships:', err);
                res.status(500).json({ error: 'An error occurred while fetching dealerships.' });
            } else {
                const dealerships = body.docs;
                res.json(dealerships);
            }
        });
    });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
