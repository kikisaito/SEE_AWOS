"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMetricsToBigQuery = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const google_auth_library_1 = require("google-auth-library");
const insertMetricsToBigQuery = async (accessToken, rows) => {
    const client = new google_auth_library_1.OAuth2Client();
    client.setCredentials({ access_token: accessToken });
    const bigquery = new bigquery_1.BigQuery({
        projectId: 'data-from-software',
        authClient: client
    });
    const datasetId = 'benchmarking_warehouse';
    const tableId = 'daily_query_metrics';
    try {
        await bigquery.dataset(datasetId).table(tableId).insert(rows);
        return [];
    }
    catch (error) {
        if (error.name === 'PartialFailureError') {
            return error.errors;
        }
        throw error;
    }
};
exports.insertMetricsToBigQuery = insertMetricsToBigQuery;
//# sourceMappingURL=bigquery.service.js.map